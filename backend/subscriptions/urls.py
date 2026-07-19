from django.urls import path
from . import views

urlpatterns = [
    path("plans/", views.PlanListView.as_view(), name="plan-list"),
    path("my/", views.MySubscriptionsView.as_view(), name="my-subscriptions"),
    path("payments/", views.MyPaymentsView.as_view(), name="my-payments"),
    path("payments/initiate/", views.InitiatePaymentView.as_view(), name="initiate-payment"),
    path("payments/webhook/", views.PaymentWebhookView.as_view(), name="payment-webhook"),
    path("payments/confirm-stub/<str:transaction_id>/", views.ConfirmStubPaymentView.as_view(), name="confirm-stub"),
]
