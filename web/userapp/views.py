from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from deepface import DeepFace
from PIL import Image
import numpy as np
import pickle
from .models import UserModel, AccountModel, LoanModel, FamilyModel, TransactionModel, UserComplaintModel
from branchapp . models import BranchModel
from django.contrib import messages
import random
from adminapp . views import send_email


SIMILARITY_THRESHOLD = 0.75


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

    return render(request, 'user_page.html', {'user_data': user_data, 'primary_user': primary_user})


def user_logout(request):
    request.session.flush()  # Clear session data

    return redirect("userapp:login")


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

    return render(request, 'user_account.html', {'user_account': user_account})


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

    if family_members_data:
        print("pass")
        return HttpResponse('<h3>You Can Only Add One Family member. You have already add one family member</h3>')
    else:
        print("creating")
        if request.method == 'POST':
            username = request.POST.get('username')
            account_username_ = request.POST.get('account_username')
            account_username = UserModel.objects.get(username=account_username_)
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

    if request.method == 'POST':
        username = request.POST.get('username')  # Main user’s username
        image_file = request.FILES.get('image')

        if not username or not image_file:
            return JsonResponse({"message": "Invalid data. Provide username, family member name, and image."})

        # Process image
        image = Image.open(image_file).convert("RGB")
        face_embedding = get_face_embedding(image)
        if face_embedding is None:
            return JsonResponse({"message": "Failed to extract face features."})

        try:
            family_member = FamilyModel.objects.get(username=username)
            stored_embedding = pickle.loads(family_member.embedding)
            print(family_member.username)
            user = family_member.account_username
            request.session['user_id'] = user.id
            request.session['t_name'] = family_member.username
            request.session['primary_user'] = False

        except (UserModel.DoesNotExist, FamilyModel.DoesNotExist):
            return JsonResponse({"message": "Family member not found."})

        # Verify face match
        result = DeepFace.verify(stored_embedding, face_embedding, model_name="Facenet512")
        similarity = 1 - result['distance']

        if similarity > SIMILARITY_THRESHOLD:
            request.session['family_member_id'] = family_member.id
            return JsonResponse({"message": "Face verified successfully!", "redirect": "/userPage"})
        else:
            return JsonResponse({"message": f"Face verification failed. Similarity: {similarity:.2f}", "success": False})

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
            return JsonResponse({"message": "Face verified successfully!", "redirect": "/verify_transaction/"})
        else:
            return JsonResponse(
                {"message": f"Face verification failed. Similarity: {similarity:.2f}", "success": False})

    return render(request, 'transaction_face_verification.html')


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


def verify_transaction(request):
    t_id = request.session.get('transaction_id')

    if not t_id:
        messages.error(request, "No transaction found.")
        return redirect('userapp:initiate_transaction')

    transaction = TransactionModel.objects.get(id=t_id)

    success = False  # Flag to track transaction success

    if request.method == 'POST':
        entered_otp = int(request.POST['otp'])
        if entered_otp == transaction.otp:
            transaction.is_verified = True
            transaction.save()

            sender_account = transaction.account_number
            sender_account.withdraw(int(transaction.amount))

            receiver_account = AccountModel.objects.get(account_number=transaction.receiver_account_number)
            receiver_account.deposit(transaction.amount)

            # messages.success(request, "Transaction successful!")
            success = True  # Set flag to show modal popup
            del request.session['transaction_id']

            # return redirect('userapp:userPage')
        else:
            messages.error(request, "Invalid OTP. Please try again.")
            return redirect('userapp:initiate_transaction')

    return render(request, 'verify_transaction.html', {"success": success})


def user_transaction_history(request):
    u_id = request.session.get('user_id')
    user_data = UserModel.objects.get(id=u_id)
    transaction_history = TransactionModel.objects.all().filter(username=user_data)

    return render(request, 'view_transaction.html', {'transaction_history': transaction_history, 'branch': False})


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

    return render(request, 'view_user_complaint_replay.html', {'complaint': complaint})

