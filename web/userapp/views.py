from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from deepface import DeepFace
from PIL import Image
import numpy as np
import pickle
from .models import UserModel, AccountModel, LoanModel, FamilyModel, TransactionModel, UserComplaintModel
from branchapp.models import BranchModel
from django.contrib import messages
import random
from adminapp.views import send_email
import json


SIMILARITY_THRESHOLD = 0.00001


def get_face_embedding(face_image):
    """Extracts face embeddings using DeepFace."""
    try:
        face_array = np.array(face_image)
        embedding = DeepFace.represent(face_array, model_name="Facenet512", enforce_detection=False)
        return embedding[0]["embedding"]
    except Exception as e:
        print(f"⚠️ Error extracting face embedding: {e}")
        return None


@csrf_exempt
def register(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        gender = request.POST.get('gender')
        address = request.POST.get('address')
        email = request.POST.get('email')
        phone = request.POST.get('phone')
        city = request.POST.get('city')
        state = request.POST.get('state')
        country = request.POST.get('country')
        image_file = request.FILES.get('image')

        if not username or not image_file:
            return JsonResponse({"message": "Invalid data. Provide username and image."})

        # Process image
        image = Image.open(image_file).convert("RGB")
        face_embedding = get_face_embedding(image)
        if face_embedding is None:
            return JsonResponse({"message": "Failed to extract face features."})

        # Store face embedding
        embedding_binary = pickle.dumps(face_embedding)

        # Save user to database
        user_face, created = UserModel.objects.update_or_create(
            username=username,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'gender': gender,
                'address': address,
                'email': email,
                'phone': phone,
                'city': city,
                'state': state,
                'country': country,
                'embedding': embedding_binary
            }
        )

        if created:
            return JsonResponse({"message": "User registered successfully!", "redirect": "/login/"})
        else:
            return JsonResponse({"message": f"User '{username}' updated successfully!"})

    return render(request, 'user_register.html')


@csrf_exempt
def login(request):

    if request.method == 'POST':
        username = request.POST.get('username')
        image_file = request.FILES.get('image')

        if not username or not image_file:
            return JsonResponse({"message": "Invalid data. Provide username and image."})

        image = Image.open(image_file).convert("RGB")
        face_embedding = get_face_embedding(image)
        if face_embedding is None:
            return JsonResponse({"message": "Failed to extract face features."})

        try:
            user_face = UserModel.objects.get(username=username)
            stored_embedding = pickle.loads(user_face.embedding)
            request.session['user_id'] = user_face.id
            request.session['t_name'] = user_face.username
            request.session['primary_user'] = True

        except UserModel.DoesNotExist:
            return JsonResponse({"message": "User not found."})

        result = DeepFace.verify(stored_embedding, face_embedding, model_name="Facenet512")
        similarity = 1 - result['distance']

        if similarity > SIMILARITY_THRESHOLD:
            return JsonResponse({"message": "Face verified successfully!", "redirect": "/userPage/"})
        else:
            return JsonResponse(
                {"message": f"Face verification failed. Similarity: {similarity:.2f}", "success": False})

    return render(request, 'user_login.html')


def home(request):
    return render(request, 'index.html')


def user_page(request):
    c_id = request.session.get('user_id')
    user_data = UserModel.objects.get(id=c_id)
    primary_user = request.session['primary_user']

    # Return JSON for mobile app
    if request.headers.get('accept') == 'application/json':
        return JsonResponse({
            'user_data': {
                'username': user_data.username,
                'first_name': user_data.first_name,
                'last_name': user_data.last_name,
                'gender': user_data.gender,
                'address': user_data.address,
                'email': user_data.email,
                'phone': user_data.phone,
                'city': user_data.city,
                'state': user_data.state,
                'country': user_data.country,
                'date': str(user_data.date),
            },
            'primary_user': primary_user
        })

    return render(request, 'user_page.html', {'user_data': user_data, 'primary_user': primary_user})


def user_logout(request):
    request.session.flush()  # Clear session data

    return redirect("userapp:login")


@csrf_exempt
def add_account(request):
    branch = BranchModel.objects.all()
    c_id = request.session.get('user_id')
    user_data = UserModel.objects.get(id=c_id)

    if request.method == 'POST':
        account_number = request.POST['account_number']
        branch_name_ = request.POST['branch_name']
        branch_name = BranchModel.objects.get(id=branch_name_)
        username_ = request.POST['username']
        username = UserModel.objects.get(username=username_)
        account_type = request.POST['account_type']
        balance = request.POST['balance']
        ifsc_code = branch_name.ifsc_code

        if AccountModel.objects.filter(account_number=account_number).exists():
            messages.info(request, "Account Number Already Registered")
            return redirect('userapp:addAccount')
        else:
            account_data = AccountModel(account_number=account_number,
                                        branch_name=branch_name,
                                        username=username,
                                        account_type=account_type,
                                        ifsc_code=ifsc_code,
                                        balance=balance)
            account_data.save()
            return redirect('userapp:userPage')

    return render(request, 'addAccount.html', {'branch': branch, 'user_data': user_data})


def view_user_account(request):
    u_id = request.session.get('user_id')
    user_data = UserModel.objects.get(id=u_id)
    user_account = AccountModel.objects.all().filter(username=user_data.id)
    if request.headers.get('accept') == 'application/json':
        # Return JSON for mobile app
        return JsonResponse({
            'user_account': [
                {
                    'id': acc.id,  # <-- add this line
                    'account_number': acc.account_number,
                    'balance': acc.balance,
                    'account_type': acc.account_type,
                    'branch_name': acc.branch_name.branch_name,
                    'ifsc_code': acc.ifsc_code,
                    'date': acc.date
                }
                for acc in user_account
            ]
        })
    return render(request, 'user_account.html', {'user_account': user_account})

@csrf_exempt
def apply_loan(request):
    u_id = request.session.get('user_id')
    user_data = UserModel.objects.get(id=u_id)
    user_account = AccountModel.objects.all().filter(username=user_data.id)

    if request.method == 'POST':
        account_number_ = request.POST['account_number']
        account_number = AccountModel.objects.get(id=account_number_)
        loan_amount = request.POST['loan_amount']
        branch_name_ = request.POST['branch_name']
        branch_name = BranchModel.objects.get(id=branch_name_)
        username_ = request.POST['username']
        username = UserModel.objects.get(username=username_)

        try:
            AccountModel.objects.get(account_number=account_number.account_number, branch_name=branch_name)
            loan_request = LoanModel(account_number=account_number,
                                     loan_amount=loan_amount,
                                     branch_name=branch_name,
                                     username=username)
            loan_request.save()
            return redirect('userapp:userPage')
        except:
            messages.info(request, "something error please check details")

            return redirect('userapp:applyLoan')

    return render(request, 'apply_loan.html', {"user_account": user_account, 'user_data': user_data})




@csrf_exempt
def register_family_member(request):
    c_id = request.session.get('user_id')
    user_data = UserModel.objects.get(id=c_id)
    family_members_data = FamilyModel.objects.all().filter(account_username=user_data)

    # Always return JSON for mobile app
    if family_members_data:
        print("pass")
        if request.headers.get('accept') == 'application/json':
            return JsonResponse({"message": "You can only add one family member. You have already added one."})
        else:
            return HttpResponse('<h3>You Can Only Add One Family member. You have already add one family member</h3>')
    else:
        print("creating")
        if request.method == 'POST':
            username = request.POST.get('username')
            account_username_ = request.POST.get('account_username')
            if not account_username_:
                return JsonResponse({"message": "Missing account_username."}, status=400)
            try:
                account_username = UserModel.objects.get(username=account_username_)
            except UserModel.DoesNotExist:
                return JsonResponse({"message": "Account owner not found."}, status=404)
            print('Received account_username:', account_username_)
            name = request.POST.get('name')
            email = request.POST.get('email')
            phone = request.POST.get('phone')
            relationship = request.POST.get('relationship')
            image_file = request.FILES.get('image')

            if not account_username or not image_file:
                return JsonResponse({"message": "Invalid data. Provide username and image."})

            # Process image
            image = Image.open(image_file).convert("RGB")
            face_embedding = get_face_embedding(image)
            if face_embedding is None:
                return JsonResponse({"message": "Failed to extract face features."})

            # Store face embedding
            embedding_binary = pickle.dumps(face_embedding)

            try:
                user = UserModel.objects.get(username=account_username)
            except UserModel.DoesNotExist:
                return JsonResponse({"message": "Account owner not found."})

            # Save family member to database
            family_member = FamilyModel.objects.create(
                username=username,
                account_username=account_username,
                name=name,
                email=email,
                phone=phone,
                relationship=relationship,
                embedding=embedding_binary
            )

            return JsonResponse({"message": "Family member registered successfully!", "redirect": "/userPage"})

    return render(request, 'family_register.html', {'user_data': user_data})




@csrf_exempt
def family_login(request):
    print("[family_login] Function called", request.method)

    if request.method == 'POST':
        username = request.POST.get('username')
        image_file = request.FILES.get('image')
        
        print("[family_login] Username:", username)
        print("[family_login] Image file provided:", image_file is not None)

        if not username:
            print("[family_login] Username not provided")
            return JsonResponse({"message": "Username is required.", "success": False}, status=400)
            
        # Check if user exists before checking image
        try:
            family_member = FamilyModel.objects.get(username=username)
            print(f"[family_login] Found family member: {family_member.username}")
            
            # If we're just checking if user exists (no image provided)
            if not image_file:
                print("[family_login] No image provided, this appears to be a user check")
                return JsonResponse({"message": "Image is required for login.", "success": False}, status=400)
                
            # Proceed with face verification if image is provided
            image = Image.open(image_file).convert("RGB")
            face_embedding = get_face_embedding(image)
            
            if face_embedding is None:
                print("[family_login] Failed to extract face features")
                return JsonResponse({"message": "Failed to extract face features.", "success": False}, status=400)
                
            stored_embedding = pickle.loads(family_member.embedding)
            # Store session info
            request.session['user_id'] = family_member.account_username.id
            request.session['t_name'] = family_member.username
            request.session['primary_user'] = False
            
            # Verify face
            result = DeepFace.verify(stored_embedding, face_embedding, model_name="Facenet512")
            similarity = 1 - result['distance']
            print(f"[family_login] Face verification result: similarity = {similarity}")
            
            if similarity > SIMILARITY_THRESHOLD:
                print("[family_login] Face verified successfully!")
                return JsonResponse({"message": "Face verified successfully!", "redirect": "/userPage/", "success": True})
            else:
                print("[family_login] Face verification failed")
                return JsonResponse({"message": f"Face verification failed. Similarity: {similarity:.2f}", "success": False})
                
        except FamilyModel.DoesNotExist:
            print(f"[family_login] Family member not found: {username}")
            return JsonResponse({"message": f"Family member '{username}' not found.", "success": False}, status=404)
        except Exception as e:
            print(f"[family_login] Error during login: {str(e)}")
            return JsonResponse({"message": f"Login error: {str(e)}", "success": False}, status=500)

    return render(request, 'family_login.html')

@csrf_exempt
def transaction_face_verification(request):
    u_username = request.session.get('t_name')
    try:
        user_data = UserModel.objects.get(username=u_username)
    except:
        user_data = FamilyModel.objects.get(username=u_username)

    if request.method == 'POST':
        image_file = request.FILES.get('image')

        if not image_file:
            return JsonResponse({"message": "Invalid data. Provide image."})

        # Process image
        image = Image.open(image_file).convert("RGB")
        face_embedding = get_face_embedding(image)
        if face_embedding is None:
            return JsonResponse({"message": "Failed to extract face features."})

        try:

            stored_embedding = pickle.loads(user_data.embedding)

        except (UserModel.DoesNotExist, FamilyModel.DoesNotExist):
            return JsonResponse({"message": "Face not exists."})

        # Verify face match
        result = DeepFace.verify(stored_embedding, face_embedding, model_name="Facenet512")
        similarity = 1 - result['distance']

        if similarity > SIMILARITY_THRESHOLD:
            return JsonResponse({"message": "Face verified successfully!", "success": True, "redirect": "/verify_transaction/"})
        else:
            return JsonResponse({"message": f"Face verification failed. Similarity: {similarity:.2f}", "success": False})

    return render(request, 'transaction_face_verification.html')


@csrf_exempt
def initiate_transaction(request):
    u_id = request.session.get('user_id')
    user_data = UserModel.objects.get(id=u_id)
    user_account = AccountModel.objects.all().filter(username=user_data.id)
    family = FamilyModel.objects.all().filter(username=user_data.id)

    if request.method == 'POST':
        receiver_account_number = request.POST['receiver_account_number']
        receiver_name = request.POST['receiver_name']
        account_number_ = request.POST['account_number']
        account_number = AccountModel.objects.get(id=account_number_)
        branch_name_ = request.POST['branch_name']
        branch_name = BranchModel.objects.get(id=branch_name_)
        amount = request.POST['amount']
        # family_name_ = request.POST['family_name']

        # try:
        #     family_name = FamilyModel.objects.get(id=family_name_)
        # except:
        #     family_name = None

        if account_number.balance < int(amount):
            messages.error(request, "Insufficient balance.")
            return redirect('initiate_transaction')

        otp = random.randint(100000, 999999)

        transaction = TransactionModel.objects.create(
            receiver_account_number=receiver_account_number,
            receiver_name=receiver_name,
            account_number=account_number,
            username=user_data,
            branch_name=branch_name,
            amount=amount,
            otp=otp,
            is_verified=False
        )

        s = "OTP Verification code"
        m = f'otp : {otp}'
        e = user_data.email
        send_email(s, m, e)

        request.session['transaction_id'] = transaction.id
        return redirect('userapp:face_verification')

    return render(request, 'initiate_transaction.html', {'user_account': user_account, 'family': family})

@csrf_exempt
def verify_transaction(request):
    t_id = request.session.get('transaction_id')

    if not t_id:
        if request.headers.get('accept') == 'application/json':
            return JsonResponse({"success": False, "message": "No transaction found."})
        messages.error(request, "No transaction found.")
        return redirect('userapp:initiate_transaction')

    transaction = TransactionModel.objects.get(id=t_id)
    success = False

    if request.method == 'POST':
        entered_otp = int(request.POST['otp'])
        if entered_otp == transaction.otp:
            transaction.is_verified = True
            transaction.save()

            sender_account = transaction.account_number
            sender_account.withdraw(int(transaction.amount))

            receiver_account = AccountModel.objects.get(account_number=transaction.receiver_account_number)
            receiver_account.deposit(transaction.amount)

            success = True
            del request.session['transaction_id']

            if request.headers.get('accept') == 'application/json':
                return JsonResponse({"success": True, "message": "Transaction successful!"})
            # else, fall through to render HTML
        else:
            if request.headers.get('accept') == 'application/json':
                return JsonResponse({"success": False, "message": "Invalid OTP. Please try again."})
            messages.error(request, "Invalid OTP. Please try again.")
            return redirect('userapp:initiate_transaction')

    return render(request, 'verify_transaction.html', {"success": success})


@csrf_exempt
def user_transaction_history(request):
    u_id = request.session.get('user_id')
    user_data = UserModel.objects.get(id=u_id)
    transaction_history = TransactionModel.objects.all().filter(username=user_data)

    # Return JSON if requested by mobile app
    if request.headers.get('accept') == 'application/json':
        return JsonResponse({
            'transaction_history': [
                {
                    'id': t.id,
                    'sender_account': t.account_number.account_number,
                    'username': t.username.username,
                    'receiver_account_number': t.receiver_account_number,
                    'receiver_name': t.receiver_name,
                    'branch_name': t.branch_name.branch_name,
                    'amount': float(t.amount),
                    'is_verified': t.is_verified,
                    'date': t.date.strftime('%Y-%m-%d %H:%M:%S'),
                }
                for t in transaction_history
            ]
        })

    return render(request, 'view_transaction.html', {'transaction_history': transaction_history, 'branch': False})

@csrf_exempt
def add_user_complaint(request):
    u_id = request.session.get('user_id')
    user_data = UserModel.objects.get(id=u_id)

    if request.method == 'POST':
        username = request.POST['username']
        new = UserModel.objects.get(username=username)
        complaint = request.POST['complaint']

        complaint_data = UserComplaintModel(username=new, complaint=complaint)
        complaint_data.save()

        return redirect('userapp:userPage')

    return render(request, 'user_complaint.html', {'user_data': user_data})


def view_user_complaint_replay(request):
    u_id = request.session.get('user_id')
    user_data = UserModel.objects.get(id=u_id)
    complaint = UserComplaintModel.objects.all().filter(username=user_data)

    # Return JSON if requested by mobile app
    if request.headers.get('accept') == 'application/json':
        return JsonResponse({
            'complaint': [
                {
                    'complaint': c.complaint,
                    'reply': c.reply,
                    'status': c.status
                }
                for c in complaint
            ]
        })

    return render(request, 'view_user_complaint_replay.html', {'complaint': complaint})


@csrf_exempt
def check_username(request):
    print("check_username called", request.method)
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode())
            username = data.get('username')
        except Exception:
            username = request.POST.get('username')
        print("POST username:", username)
        if not username:
            return JsonResponse({'exists': False, 'message': 'No username provided.'})
        from .models import UserModel
        exists = UserModel.objects.filter(username=username).exists()
        return JsonResponse({'exists': exists})
    return JsonResponse({'message': 'Invalid request method.'}, status=405)


def get_branches(request):
    if request.method == 'GET':
        branches = BranchModel.objects.all()
        return JsonResponse({
            'branches': [
                {
                    'id': branch.id,
                    'branch_name': branch.branch_name,
                    'ifsc_code': branch.ifsc_code,
                    'city': branch.city,
                    'state': branch.state,
                    'country': branch.country,
                }
                for branch in branches
            ]
        })
    return JsonResponse({'error': 'Invalid request method'}, status=405)


from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from PIL import Image
import pickle

@csrf_exempt
def mobile_register_family_member(request):
    print("==== mobile_register_family_member called ====")
    print(f"Request method: {request.method}")
    print(f"Request path: {request.path}")
    print(f"Request content type: {request.content_type}")
    print(f"Request headers: {dict(request.headers)}")
    
    if request.method != 'POST':
        print("Error: Only POST allowed")
        return JsonResponse({"message": "Only POST allowed."}, status=405)

    print(f"POST data keys: {request.POST.keys()}")
    print(f"FILES keys: {request.FILES.keys()}")
    
    username = request.POST.get('username')
    account_username_ = request.POST.get('account_username')
    name = request.POST.get('name')
    email = request.POST.get('email')
    phone = request.POST.get('phone')
    relationship = request.POST.get('relationship')
    image_file = request.FILES.get('image')

    print(f"username: {username}")
    print(f"account_username: {account_username_}")
    print(f"name: {name}")
    print(f"email: {email}")
    print(f"phone: {phone}")
    print(f"relationship: {relationship}")
    print(f"image_file: {image_file}")

    if not (username and account_username_ and name and email and phone and relationship and image_file):
        print("Error: Missing required fields")
        return JsonResponse({"message": "All fields are required."}, status=400)

    # Check if account_username exists
    try:
        account_user = UserModel.objects.get(username=account_username_)
        print(f"Found account user: {account_user.username} (id: {account_user.id})")
    except UserModel.DoesNotExist:
        print(f"Error: Account owner '{account_username_}' not found")
        return JsonResponse({"message": "Account owner not found."}, status=404)

    # Only one family member allowed per account_username
    family_exists = FamilyModel.objects.filter(account_username=account_user).exists()
    print(f"Family member already exists: {family_exists}")
    if family_exists:
        return JsonResponse({"message": "You can only add one family member. You have already added one."}, status=400)

    # Check if family username is unique
    username_exists = FamilyModel.objects.filter(username=username).exists()
    print(f"Username '{username}' already exists: {username_exists}")
    if username_exists:
        return JsonResponse({"message": "Family username already exists."}, status=400)

    # Process image and embedding
    try:
        print("Opening and processing image...")
        image = Image.open(image_file).convert("RGB")
        print("Extracting face embedding...")
        face_embedding = get_face_embedding(image)
        if face_embedding is None:
            print("Error: Failed to extract face features")
            return JsonResponse({"message": "Failed to extract face features."}, status=400)
        print("Creating binary embedding...")
        embedding_binary = pickle.dumps(face_embedding)
        print("Embedding successfully created")
    except Exception as e:
        print(f"Error processing image: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({"message": f"Image processing error: {e}"}, status=400)

    # Save family member
    print("Saving family member to database...")
    try:
        family_member = FamilyModel.objects.create(
            username=username,
            account_username=account_user,
            name=name,
            email=email,
            phone=phone,
            relationship=relationship,
            embedding=embedding_binary
        )
        print(f"Family member created with ID: {family_member.id}")
    except Exception as e:
        print(f"Error creating family member: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({"message": f"Database error: {e}"}, status=500)
    
    print("Family member registration successful!")
    return JsonResponse({"message": "Family member registered successfully!"})




@csrf_exempt
def check_family_username(request):
    print("[check_family_username] Endpoint called", request.method)
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode())
            username = data.get('username')
        except Exception:
            username = request.POST.get('username')
            
        print("[check_family_username] Username to check:", username)
        
        if not username:
            print("[check_family_username] No username provided")
            return JsonResponse({'exists': False, 'message': 'No username provided.'})
            
        from .models import FamilyModel
        exists = FamilyModel.objects.filter(username=username).exists()
        print(f"[check_family_username] Username '{username}' exists: {exists}")
        
        return JsonResponse({'exists': exists})
        
    return JsonResponse({'message': 'Invalid request method.'}, status=405)



@csrf_exempt
def get_family_details(request):
    """API endpoint to get family member details by username"""
    if request.method == 'GET':
        username = request.GET.get('username')
        
        if not username:
            return JsonResponse({"message": "Username is required"}, status=400)
            
        try:
            family_member = FamilyModel.objects.get(username=username)
            
            # Return family member information
            return JsonResponse({
                'family_data': {
                    'id': family_member.id,
                    'username': family_member.username,
                    'name': family_member.name,
                    'email': family_member.email,
                    'phone': family_member.phone,
                    'relationship': family_member.relationship,
                    'date': str(family_member.date),
                    'primary_account': family_member.account_username.username
                },
                'success': True
            })
            
        except FamilyModel.DoesNotExist:
            return JsonResponse({"message": f"Family member '{username}' not found."}, status=404)
            
    return JsonResponse({"message": "Invalid request method."}, status=405)