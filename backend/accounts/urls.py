from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("profile/", views.ProfileView.as_view(), name="profile"),
    path("change-password/", views.ChangePasswordView.as_view(), name="change-password"),
    # Adult PIN / parental control
    path("adult-pin/set/", views.SetAdultPinView.as_view(), name="adult-pin-set"),
    path("adult-pin/verify/", views.VerifyAdultPinView.as_view(), name="adult-pin-verify"),
    path("adult-pin/lock/", views.LockAdultView.as_view(), name="adult-pin-lock"),
    path("adult-pin/disable/", views.DisableAdultView.as_view(), name="adult-pin-disable"),
]
