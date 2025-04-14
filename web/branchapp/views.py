from django.shortcuts import render, redirect
from .models import BranchModel, ComplaintModel
from .forms import BranchForm, LoanForm
from django.contrib import messages
from userapp . models import UserModel, AccountModel, LoanModel, TransactionModel, FamilyModel


def branch_delete(request, id):
    branch = BranchModel.objects.get(id=id)
    branch.delete()

    return redirect('adminapp:adminPage')


def branch_update(request, id):
    branch = BranchModel.objects.get(id=id)
    forms = BranchForm(request.POST or None, instance=branch)

    if forms.is_valid():
        forms.save()

        return redirect('adminapp:adminPage')
    return render(request, 'branch_update.html', {'branch': branch, 'forms': forms})


def branch_login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        try:
            branch = BranchModel.objects.get(username=username, password=password)
            request.session['branch_id'] = branch.id  # Store session data
            return redirect("branch_app:branchPage")  # Redirect to dashboard or another page
        except:
            messages.error(request, "Invalid username or password")
            return redirect('branch_app:branchLogin')
    return render(request, 'branch_login.html')


def branch_page(request):
    b_id = request.session.get('branch_id')
    branch_data = BranchModel.objects.get(id=b_id)

    return render(request, 'branch_page.html', {'branch_data': branch_data})


def branch_logout(request):
    request.session.flush()  # Clear session data

    return redirect("branch_app:branchLogin")


def add_branch_complaint(request):
    b_id = request.session.get('branch_id')
    branch_data = BranchModel.objects.get(id=b_id)
    if request.method == 'POST':
        branch_name = request.POST['branch_name']
        new = BranchModel.objects.get(branch_name=branch_name)
        complaint = request.POST['complaint']

        complaint_data = ComplaintModel(branch_name=new, complaint=complaint)
        complaint_data.save()

        return redirect('branch_app:branchPage')

    return render(request, 'complaint.html', {'branch_data': branch_data})


def view_complaint_replay(request):
    b_id = request.session.get('branch_id')
    branch_data = BranchModel.objects.get(id=b_id)
    complaint = ComplaintModel.objects.all().filter(branch_name=branch_data.id)

    return render(request, 'view_complaint_replay.html', {'complaint': complaint})


def view_account_by_branch(request):
    b_id = request.session.get('branch_id')
    branch_data = BranchModel.objects.get(id=b_id)
    account = AccountModel.objects.all().filter(branch_name=branch_data.id)

    return render(request, 'view_account.html', {'account': account})


def view_user_by_branch(request):
    b_id = request.session.get('branch_id')
    branch_data = BranchModel.objects.get(id=b_id)
    # branch_name = branch_data.branch_name

    accounts = AccountModel.objects.filter(branch_name=branch_data)
    users = UserModel.objects.filter(id__in=accounts.values_list('username', flat=True))

    return render(request, 'user_by_branch.html', {'users': users})


def all_loan_list(request):
    b_id = request.session.get('branch_id')
    branch_data = BranchModel.objects.get(id=b_id)
    pending_loan = LoanModel.objects.all().filter(status="Pending", branch_name=branch_data.id)
    return render(request, 'all_loan_list.html', {'pending_loan': pending_loan})


def approve_loan(request, id):
    loan = LoanModel.objects.get(id=id)
    forms = LoanForm(request.POST or None, instance=loan)
    if forms.is_valid():
        forms.save()

        if loan.status == "Approved":
            amount = loan.loan_amount
            account = AccountModel.objects.get(account_number=loan.account_number.account_number)
            account.deposit(amount)

            return redirect('branch_app:branchPage')

    return render(request, 'approve_loan.html', {'forms': forms, 'loan': loan})


def transaction_history(request):
    b_id = request.session.get('branch_id')
    branch_data = BranchModel.objects.get(id=b_id)
    transaction_history = TransactionModel.objects.all().filter(branch_name=branch_data)

    return render(request, 'view_transaction.html', {'transaction_history': transaction_history, 'branch': True})


def secondary_user_by_branch(request):
    b_id = request.session.get('branch_id')
    branch_data = BranchModel.objects.get(id=b_id)

    branch = BranchModel.objects.get(branch_name=branch_data)
    users_in_branch = UserModel.objects.filter(accountmodel__branch_name=branch)
    family_members = FamilyModel.objects.filter(account_username__in=users_in_branch)

    return render(request, 'secondary_user_by_branch.html', {'family_members': family_members})

