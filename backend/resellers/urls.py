from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.RegisterResellerView.as_view(), name="reseller-register"),
    path("dashboard/", views.DashboardView.as_view(), name="reseller-dashboard"),
    path("clients/", views.ClientListView.as_view(), name="reseller-clients"),
    path("commissions/", views.CommissionListView.as_view(), name="reseller-commissions"),
    path("withdraw/", views.WithdrawView.as_view(), name="reseller-withdraw"),
    path("withdrawals/", views.WithdrawalListView.as_view(), name="reseller-withdrawals"),
    path("stats/", views.StatsView.as_view(), name="reseller-stats"),
]
