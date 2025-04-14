from django import forms
from .models import BranchModel, ComplaintModel
from userapp . models import LoanModel


class BranchForm(forms.ModelForm):
    class Meta:
        model = BranchModel
        fields = '__all__'
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter Username'}),
            'bank_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter Bank Name'}),
            'branch_name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter Branch Name'}),
            'ifsc_code': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter IFSC Code'}),
            'address': forms.Textarea(attrs={'class': 'form-control', 'rows': 2, 'placeholder': 'Enter Address'}),
            'city': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter City'}),
            'state': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter State'}),
            'country': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter Country'}),
            'postal_code': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Enter Postal Code'}),
            'contact_number': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter Contact Number'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Enter Email'}),
            'password': forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Enter Password'}),
        }
class ComplaintForm(forms.ModelForm):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Processing', 'Processing'),
        ('Completed', 'Completed'),
    ]

    status = forms.ChoiceField(
        choices=STATUS_CHOICES,
        widget=forms.Select(attrs={'class': 'form-select'}),
        initial='Pending'  # Set default to "Pending"
    )

    class Meta:
        model = ComplaintModel
        fields = ['reply', 'status']
        widgets = {
            'reply': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Enter your reply...'}),
        }


class LoanForm(forms.ModelForm):
    class Meta:
        model = LoanModel
        fields = ['status']
        widgets = {
            'status': forms.Select(choices=LoanModel.LOAN_STATUS_CHOICES, attrs={'class': 'form-control'})
        }
