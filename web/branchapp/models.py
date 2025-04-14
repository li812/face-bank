from django.db import models


class BranchModel(models.Model):
    username = models.CharField(max_length=100)
    bank_name = models.CharField(max_length=100)
    branch_name = models.CharField(max_length=100)
    ifsc_code = models.CharField(max_length=50)
    address = models.CharField(max_length=200)
    city = models.CharField(max_length=50)
    state = models.CharField(max_length=50)
    country = models.CharField(max_length=50)
    postal_code = models.IntegerField()
    contact_number = models.CharField(max_length=15)
    email = models.EmailField()
    date = models.DateField(auto_now_add=True)
    password = models.CharField(max_length=100, default=1234)

    def __str__(self):
        return self.branch_name


class ComplaintModel(models.Model):
    branch_name = models.ForeignKey(BranchModel, on_delete=models.CASCADE)
    complaint = models.TextField()
    reply = models.TextField(null=True)
    status = models.CharField(max_length=10, default='Pending')

    def __str__(self):
        return self.complaint
