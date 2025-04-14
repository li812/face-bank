from django.urls import path
from . import views

app_name = 'adminapp'

urlpatterns = [
    path('', views.admin_login, name='adminLogin'),
    path('adminPage', views.admin_page, name='adminPage'),
    path('adminLogout', views.admin_logout, name='adminLogout'),
    path('branchReg', views.branch_reg, name='branchReg'),
    path('viewComplaint', views.view_complaint, name='viewComplaint'),
    path('replyComplaint/<int:id>/', views.complaint_reply, name='replyComplaint'),
    path('allUser', views.view_all_user, name='allUser'),
]
