from django import forms
from .models import UserComplaintModel


class UserComplaintForm(forms.ModelForm):
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
        model = UserComplaintModel
        fields = ['reply', 'status']
        widgets = {
            'reply': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Enter your reply...'}),
        }
