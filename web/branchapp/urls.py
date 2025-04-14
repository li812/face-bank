from django.urls import path
from . import views

app_name = 'branch_app'

urlpatterns = [
    path('branchDelete/<int:id>/', views.branch_delete, name='branchDelete'),
    path('branchUpdate/<int:id>/', views.branch_update, name='branchUpdate'),
    path('branchLogin', views.branch_login, name='branchLogin'),
    path('branchPage', views.branch_page, name='branchPage'),
    path('branchLogout', views.branch_logout, name='branchLogout'),
    path('addComplaint', views.add_branch_complaint, name='addComplaint'),
    path('viewReplyComplaint', views.view_complaint_replay, name='viewReplyComplaint'),
    path('viewAccount', views.view_account_by_branch, name='viewAccount'),
    path('userByBranch', views.view_user_by_branch, name='userByBranch'),
    path('allLoan', views.all_loan_list, name='allLoan'),
    path('approveLoan/<int:id>/', views.approve_loan, name='approveLoan'),
    path('view_transaction', views.transaction_history, name='view_transaction'),
    path('secondaryUserByBranch', views.secondary_user_by_branch, name='secondaryUserByBranch'),
]
