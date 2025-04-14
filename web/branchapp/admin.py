from django.contrib import admin
from .models import BranchModel, ComplaintModel

# Register your models here.
admin.site.register(BranchModel)
admin.site.register(ComplaintModel)