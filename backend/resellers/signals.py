from decimal import Decimal

from django.db import transaction
from django.db.models import F
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone


@receiver(post_save, sender="resellers.ResellerClient")
def on_reseller_client_created(sender, instance, created, **kwargs):
    if created:
        instance.reseller.update_niveau()


@receiver(post_save, sender="subscriptions.Subscription")
def calculate_commission_on_subscription(sender, instance, created, **kwargs):
    if not created:
        return

    from resellers.models import Commission, Reseller, ResellerClient

    try:
        affiliation = ResellerClient.objects.select_related("reseller").get(
            client=instance.user, is_active=True
        )
    except ResellerClient.DoesNotExist:
        return

    reseller = affiliation.reseller
    if not reseller.is_active:
        return

    rate = reseller.commission_rate
    amount = (Decimal(str(instance.plan.price)) * rate / Decimal("100")).quantize(Decimal("1"))

    commission, commission_created = Commission.objects.get_or_create(
        subscription=instance,
        defaults={
            "reseller": reseller,
            "client": instance.user,
            "amount": amount,
            "rate_applied": rate,
            "status": "paid",
            "paid_at": timezone.now(),
        },
    )

    if commission_created:
        with transaction.atomic():
            Reseller.objects.filter(pk=reseller.pk).update(
                available_balance=F("available_balance") + amount,
                total_earnings=F("total_earnings") + amount,
            )


@receiver(pre_save, sender="resellers.Withdrawal")
def capture_old_withdrawal_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            from resellers.models import Withdrawal
            instance._old_status = Withdrawal.objects.get(pk=instance.pk).status
        except Exception:
            instance._old_status = None
    else:
        instance._old_status = None


@receiver(post_save, sender="resellers.Withdrawal")
def handle_withdrawal_rejection(sender, instance, created, **kwargs):
    if created:
        return
    old = getattr(instance, "_old_status", None)
    if old in ("pending", "processing") and instance.status == "rejected":
        from resellers.models import Reseller
        with transaction.atomic():
            Reseller.objects.filter(pk=instance.reseller.pk).update(
                available_balance=F("available_balance") + instance.amount,
            )
