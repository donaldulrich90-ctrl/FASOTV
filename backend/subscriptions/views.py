import logging
from datetime import timedelta

from django.utils import timezone
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Plan, Subscription, Payment
from .serializers import (
    PlanSerializer, SubscriptionSerializer, InitiatePaymentSerializer, PaymentSerializer
)
from .payments import get_provider, PaymentProvider

logger = logging.getLogger(__name__)


class PlanListView(generics.ListAPIView):
    permission_classes = (AllowAny,)
    serializer_class = PlanSerializer
    queryset = Plan.objects.filter(is_active=True)


class MySubscriptionsView(generics.ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = SubscriptionSerializer

    def get_queryset(self):
        return self.request.user.subscriptions.select_related("plan").all()


class InitiatePaymentView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = InitiatePaymentSerializer(data=request.data, context={})
        serializer.is_valid(raise_exception=True)

        plan = Plan.objects.get(slug=serializer.validated_data["plan_slug"])
        method = serializer.validated_data["method"]
        phone = serializer.validated_data["phone"]

        transaction_id = PaymentProvider.generate_transaction_id()
        payment = Payment.objects.create(
            user=request.user,
            plan=plan,
            amount=plan.price,
            method=method,
            phone=phone,
            transaction_id=transaction_id,
            status="pending",
        )

        try:
            provider = get_provider(method)
            result = provider.initiate(
                amount=plan.price,
                phone=phone,
                transaction_id=transaction_id,
                description=f"FASO TV – {plan.name}",
            )
            if result.success:
                payment.provider_ref = result.provider_ref
                payment.save(update_fields=["provider_ref"])
                return Response({
                    "transaction_id": transaction_id,
                    "provider_ref": result.provider_ref,
                    "redirect_url": result.redirect_url,
                    "status": "pending",
                    "payment_id": payment.id,
                    "stub_mode": result.raw.get("stub", False) if result.raw else False,
                })
            else:
                payment.status = "failed"
                payment.error_message = result.error
                payment.save(update_fields=["status", "error_message"])
                return Response({"detail": result.error}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            logger.exception("Erreur initiation paiement: %s", exc)
            payment.status = "failed"
            payment.error_message = str(exc)
            payment.save(update_fields=["status", "error_message"])
            return Response({"detail": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PaymentWebhookView(APIView):
    """Endpoint webhook appelé par l'opérateur Mobile Money pour confirmer le paiement."""
    permission_classes = (AllowAny,)

    def post(self, request):
        transaction_id = request.data.get("transaction_id") or request.data.get("orderId")
        status_value = request.data.get("status", "").lower()

        try:
            payment = Payment.objects.select_related("plan", "user").get(
                transaction_id=transaction_id
            )
        except Payment.DoesNotExist:
            logger.warning("Webhook: transaction_id inconnu: %s", transaction_id)
            return Response({"detail": "Transaction introuvable."}, status=status.HTTP_404_NOT_FOUND)

        if payment.status != "pending":
            return Response({"detail": "Transaction déjà traitée."})

        if status_value in ("success", "successful", "completed", "paid"):
            payment.status = "success"
            payment.save(update_fields=["status", "updated_at"])
            self._activate_subscription(payment)
        elif status_value in ("failed", "error", "cancelled"):
            payment.status = "failed"
            payment.save(update_fields=["status", "updated_at"])

        return Response({"detail": "OK"})

    def _activate_subscription(self, payment: Payment):
        user = payment.user
        plan = payment.plan
        end_date = timezone.now() + timedelta(hours=plan.duration_hours)

        Subscription.objects.create(
            user=user,
            plan=plan,
            end_date=end_date,
            is_active=True,
            payment_method=payment.method,
            transaction_id=payment.transaction_id,
        )

        user.plan_actif = plan.name
        user.date_expiration = end_date
        user.save(update_fields=["plan_actif", "date_expiration"])
        logger.info("Abonnement activé: %s → %s jusqu'au %s", user, plan.name, end_date)


class ConfirmStubPaymentView(APIView):
    """Endpoint de test uniquement (DEBUG) pour simuler la confirmation d'un paiement stub."""
    permission_classes = (IsAuthenticated,)

    def post(self, request, transaction_id):
        from django.conf import settings as django_settings
        if not django_settings.DEBUG:
            return Response({"detail": "Non disponible en production."}, status=403)

        try:
            payment = Payment.objects.select_related("plan", "user").get(
                transaction_id=transaction_id, user=request.user
            )
        except Payment.DoesNotExist:
            return Response({"detail": "Paiement introuvable."}, status=404)

        if payment.status == "pending":
            payment.status = "success"
            payment.save(update_fields=["status", "updated_at"])
            webhook_view = PaymentWebhookView()
            webhook_view._activate_subscription(payment)

        return Response(PaymentSerializer(payment).data)


class MyPaymentsView(generics.ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = PaymentSerializer

    def get_queryset(self):
        return self.request.user.payments.select_related("plan").all()
