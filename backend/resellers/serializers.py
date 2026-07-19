from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Commission, Reseller, ResellerClient, Withdrawal

User = get_user_model()


class RegisterResellerSerializer(serializers.Serializer):
    phone_paiement = serializers.CharField(max_length=20)
    motivation = serializers.CharField(required=False, allow_blank=True, default="")

    def validate(self, attrs):
        user = self.context["request"].user
        if hasattr(user, "reseller_profile"):
            raise serializers.ValidationError("Vous êtes déjà revendeur.")
        return attrs


class ResellerProfileSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.name", read_only=True)
    user_phone = serializers.CharField(source="user.phone", read_only=True)
    next_niveau_info = serializers.SerializerMethodField()
    active_clients_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Reseller
        fields = (
            "id", "user_name", "user_phone", "code_parrainage",
            "commission_rate", "total_earnings", "available_balance",
            "is_active", "phone_paiement", "niveau", "motivation",
            "active_clients_count", "next_niveau_info", "created_at",
        )
        read_only_fields = (
            "code_parrainage", "commission_rate", "total_earnings",
            "available_balance", "niveau", "created_at",
        )

    def get_next_niveau_info(self, obj):
        return obj.next_niveau_info


class ClientSubscriptionSerializer(serializers.Serializer):
    plan_actif = serializers.CharField()
    date_expiration = serializers.DateTimeField()
    has_active_subscription = serializers.BooleanField()


class ResellerClientSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.name", read_only=True)
    client_phone = serializers.CharField(source="client.phone", read_only=True)
    plan_actif = serializers.CharField(source="client.plan_actif", read_only=True)
    date_expiration = serializers.DateTimeField(source="client.date_expiration", read_only=True)
    has_active_subscription = serializers.BooleanField(
        source="client.has_active_subscription", read_only=True
    )

    class Meta:
        model = ResellerClient
        fields = (
            "id", "client_name", "client_phone", "joined_at",
            "is_active", "source", "plan_actif", "date_expiration",
            "has_active_subscription",
        )


class CommissionSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.name", read_only=True)
    client_phone = serializers.CharField(source="client.phone", read_only=True)
    plan_name = serializers.SerializerMethodField()

    class Meta:
        model = Commission
        fields = (
            "id", "client_name", "client_phone", "plan_name",
            "amount", "rate_applied", "status", "paid_at", "created_at",
        )

    def get_plan_name(self, obj):
        if obj.subscription:
            return obj.subscription.plan.name
        return ""


class WithdrawalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Withdrawal
        fields = (
            "id", "amount", "method", "phone", "status",
            "reference", "requested_at", "processed_at",
        )
        read_only_fields = ("status", "reference", "requested_at", "processed_at")


class WithdrawalCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Withdrawal
        fields = ("amount", "method", "phone")

    def validate_amount(self, value):
        if value < Decimal("1000"):
            raise serializers.ValidationError("Le montant minimum de retrait est 1 000 FCFA.")
        return value

    def validate(self, attrs):
        reseller = self.context["reseller"]
        if attrs["amount"] > reseller.available_balance:
            raise serializers.ValidationError(
                {"amount": f"Solde insuffisant. Disponible : {reseller.available_balance} FCFA."}
            )
        return attrs
