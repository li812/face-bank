from django.urls import path
from . import views

app_name = 'userapp'

urlpatterns = [
    path('', views.home, name='home'),
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('userPage/', views.user_page, name='userPage'),
    path('userLogout', views.user_logout, name='userLogout'),
    path('addAccount', views.add_account, name='addAccount'),
    path('userAccount', views.view_user_account, name='userAccount'),
    path('applyLoan', views.apply_loan, name='applyLoan'),
    path('register_family/', views.register_family_member, name='register_family'),
    path('family_login/', views.family_login, name='family_login'),
    path('face_verification/', views.transaction_face_verification, name='face_verification'),
    path('initiate_transaction/', views.initiate_transaction, name='initiate_transaction'),
    path('verify_transaction/', views.verify_transaction, name='verify_transaction'),
    path('user_transaction', views.user_transaction_history, name='user_transaction'),
    path('user_complaint', views.add_user_complaint, name='user_complaint'),
    path('view_user_complaint_replay', views.view_user_complaint_replay, name='view_user_complaint_replay'),
    path('check_username/', views.check_username, name='check_username'),
    path('branches', views.get_branches, name='branches'),
    path('api/mobile_register_family/', views.mobile_register_family_member, name='mobile_register_family'),
    path('api/mobile_register_family', views.mobile_register_family_member, name='mobile_register_family'),
    path('api/mobile_register_family//', views.mobile_register_family_member, name='mobile_register_family'),
    path('check_family_username/', views.check_family_username, name='check_family_username'),
    path('family_details', views.get_family_details, name='family_details'),
]
