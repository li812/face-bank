from django.db import models
from branchapp . models import BranchModel


class UserModel(models.Model):
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]
    username = models.CharField(max_length=15, unique=True)
    first_name = models.CharField(max_length=20)
    last_name = models.CharField(max_length=20)
    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES,
        default='Male'  # Default value
    )
    address = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.IntegerField()
    city = models.CharField(max_length=50)
    state = models.CharField(max_length=50)
    country = models.CharField(max_length=50)
    date = models.DateField(auto_now_add=True)
    embedding = models.BinaryField()

    def __str__(self):
        return self.username


class AccountModel(models.Model):
    ACCOUNT_TYPE_CHOICES = [
        ('Savings', 'Savings'),
        ('Current', 'Current'),
    ]
    account_number = models.IntegerField()
    branch_name = models.ForeignKey(BranchModel, on_delete=models.CASCADE)
    username = models.ForeignKey(UserModel, on_delete=models.CASCADE)
    account_type = models.CharField(
        max_length=15,
        choices=ACCOUNT_TYPE_CHOICES,
        default='Savings'
    )
    ifsc_code = models.CharField(max_length=20)
    balance = models.IntegerField()
    date = models.DateField(auto_now_add=True)

    def deposit(self, amount):
        if amount > 0:
            self.balance += amount
            self.save()
            return True

        return False

    def withdraw(self, amount):
        if amount > 0 and self.balance >= amount:
            self.balance -= amount
            self.save()
            return True

        return False

    def __str__(self):
        return f"{self.account_number}"


class LoanModel(models.Model):
    LOAN_STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
    ]
    account_number = models.ForeignKey(AccountModel, on_delete=models.CASCADE)
    loan_amount = models.IntegerField()
    branch_name = models.ForeignKey(BranchModel, on_delete=models.CASCADE)
    username = models.ForeignKey(UserModel, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=10,
        choices=LOAN_STATUS_CHOICES,
        default="Pending"
    )
    request_date = models.DateField(auto_now_add=True)


class FamilyModel(models.Model):
    username = models.CharField(max_length=30, unique=True)
    account_username = models.ForeignKey(UserModel, on_delete=models.CASCADE)
    name = models.CharField(max_length=20)
    email = models.EmailField()
    phone = models.IntegerField()
    relationship = models.CharField(max_length=100)
    date = models.DateField(auto_now_add=True)
    embedding = models.BinaryField()

    def __str__(self):
        return self.username


class TransactionModel(models.Model):
    receiver_account_number = models.IntegerField()
    receiver_name = models.CharField(max_length=50)
    account_number = models.ForeignKey(AccountModel, on_delete=models.CASCADE)
    username = models.ForeignKey(UserModel, on_delete=models.CASCADE)
    branch_name = models.ForeignKey(BranchModel, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    otp = models.IntegerField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Transaction to {self.receiver_name} - {self.amount}"


class UserComplaintModel(models.Model):
    username = models.ForeignKey(UserModel, on_delete=models.CASCADE)
    complaint = models.TextField()
    reply = models.TextField(null=True)
    status = models.CharField(max_length=10, default='Pending')

    def __str__(self):
        return self.complaint

