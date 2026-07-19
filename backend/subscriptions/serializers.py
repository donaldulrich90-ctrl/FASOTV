from rest_framework import serializers
from .models import Plan, Subscription, Payment


class PlanSerializer(serializers.ModelSerializer):
    duration_label = serializers.ReadOnlyField()

    class Meta:
        model = Plan
        fields = ("id", "name", "slug", "price", "duration_hours", "duration_label",
                  "max_screens", "features", "is_active", "order")


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)
    is_valid = serializers.BooleanField(read_only=True)

    class Meta:
        model = Subscription
        fields = ("id", "plan", "start_date", "end_date", "is_active",
                  "payment_method", "transaction_id", "is_valid")


class InitiatePaymentSerializer(serializers.Serializer):
    plan_slug = serializers.SlugField()
    method = serializers.ChoiceField(choices=["orange_money", "moov_money", "coris_money"])
    phone = serializers.CharField(max_length=20)

    def validate_plan_slug(self, value):
        try:
            plan = Plan.objects.get(slug=value, is_active=True)
        except Plan.DoesNotExist:
            raise serializers.ValidationError("Forfait introuvable.")
        self.context["plan"] = plan
        return value


class PaymentSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)

    class Meta:
        model = Payment
        fields = ("id", "plan", "amount", "method", "phone", "status",
                  "transaction_id", "created_at", "updated_at")
