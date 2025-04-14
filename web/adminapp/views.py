from django.shortcuts import render, redirect
from django.contrib import auth, messages
from branchapp.models import BranchModel, ComplaintModel
from branchapp.forms import ComplaintForm
from userapp.models import UserModel, UserComplaintModel
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from userapp.forms import UserComplaintForm

# Email credentials
SMTP_SERVER = "smtp.gmail.com"  # Change for Outlook/Yahoo
SMTP_PORT = 587
# EMAIL_SENDER = "jaganbaiju257@gmail.com"
EMAIL_SENDER = "blessyop89@gmail.com"
EMAIL_PASSWORD = "eshn ysii lqvj qzcr"
# EMAIL_RECEIVER = "jboffcl2001@gmail.com"


def send_email(sub, mssg, EMAIL_RECEIVER):
    try:
        # Create the email message
        msg = MIMEMultipart()
        msg['From'] = EMAIL_SENDER
        msg['To'] = EMAIL_RECEIVER
        msg['Subject'] = sub
        body = mssg
        msg.attach(MIMEText(body, 'plain'))

        # Connect to SMTP server and send email
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()  # Secure the connection
        server.login(EMAIL_SENDER, EMAIL_PASSWORD)
        server.sendmail(EMAIL_SENDER, EMAIL_RECEIVER, msg.as_string())
        server.quit()

        print("✅ Email sent successfully!")
    except Exception as e:
        print(f"❌ Error: {e}")


def admin_login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        admin = auth.authenticate(username=username,
                                  password=password)

        if admin is not None:
            auth.login(request, admin)
            return redirect('adminapp:adminPage')
        else:
            messages.info(request, "Username or Password is wrong")
            return redirect('adminapp:adminLogin')
    return render(request, 'admin_login.html')


def admin_page(request):
    branch_data = BranchModel.objects.all()

    return render(request, 'admin_page.html', {"branch_data": branch_data})


def admin_logout(request):
    auth.logout(request)
    return redirect('adminapp:adminLogin')


def branch_reg(request):
    if request.method == 'POST':
        username = request.POST['username']
        bank_name = request.POST['bank_name']
        branch_name = request.POST['branch_name']
        ifsc_code = request.POST['ifsc_code']
        address = request.POST['address']
        city = request.POST['city']
        state = request.POST['state']
        country = request.POST['country']
        postal_code = request.POST['postal_code']
        contact_number = request.POST['contact_number']
        email = request.POST['email']
        password = request.POST['password']
        c_password = request.POST['c_password']

        if password == c_password:
            if BranchModel.objects.filter(username=username).exists():
                messages.info(request, 'Username already exist')

                return redirect('adminapp:branchReg')
            elif BranchModel.objects.filter(email=email).exists():
                messages.info(request, "email already exist")

                return redirect('adminapp:branchReg')
            else:
                try:
                    branch_data = BranchModel(username=username,
                                              bank_name=bank_name,
                                              branch_name=branch_name,
                                              ifsc_code=ifsc_code,
                                              address=address,
                                              city=city,
                                              state=state,
                                              country=country,
                                              postal_code=postal_code,
                                              contact_number=contact_number,
                                              email=email,
                                              password=password)
                    branch_data.save()

                    s = "Email from Card Payment system"
                    m = f'username: {username}\n password: {password}'
                    e = email

                    send_email(s, m, e)

                    return redirect('adminapp:adminPage')
                except:
                    return redirect('adminapp:branchReg')
        else:
            messages.info(request, "Password Not Matching")
            return redirect('adminapp:branchReg')

    return render(request, 'branch_reg.html')


def view_complaint(request):
    b_complaint = ComplaintModel.objects.all()
    u_complaint = UserComplaintModel.objects.all()

    return render(request, 'view_complaint.html', {"b_complaint": b_complaint, "u_complaint": u_complaint})


def complaint_reply(request, id):
    try:
        complaint = ComplaintModel.objects.get(id=id)
        forms = ComplaintForm(request.POST or None, instance=complaint)

        if forms.is_valid():
            forms.save()

            return redirect('adminapp:adminPage')
    except:
        complaint = UserComplaintModel.objects.get(id=id)
        forms = UserComplaintForm(request.POST or None, instance=complaint)

        if forms.is_valid():
            forms.save()

            return redirect('adminapp:adminPage')
    return render(request, 'complaint_reply.html', {'complaint': complaint, 'forms': forms})


def view_all_user(request):
    user = UserModel.objects.all()
    return render(request, 'all_user.html', {'user': user})
