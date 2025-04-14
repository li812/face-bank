from django.contrib import admin
from .models import UserModel, AccountModel, LoanModel, FamilyModel, TransactionModel, UserComplaintModel
# Register your models here.


admin.site.register(UserModel)
admin.site.register(AccountModel)
admin.site.register(LoanModel)
admin.site.register(FamilyModel)
admin.site.register(TransactionModel)
admin.site.register(UserComplaintModel)

