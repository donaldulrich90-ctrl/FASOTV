from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True)
    code_parrainage = serializers.CharField(
        required=False, allow_blank=True, default="", write_only=True
    )

    class Meta:
        model = User
        fields = ("phone", "name", "email", "password", "password2", "code_parrainage")

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password2"):
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("code_parrainage", None)
        return User.objects.create_user(**validated_data)


class UserProfileSerializer(serializers.ModelSerializer):
    has_active_subscription = serializers.BooleanField(read_only=True)
    is_reseller = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id", "phone", "name", "email", "avatar",
            "plan_actif", "date_expiration", "has_active_subscription",
            "is_reseller", "date_joined",
        )
        read_only_fields = ("phone", "plan_actif", "date_expiration", "date_joined")

    def get_is_reseller(self, obj):
        try:
            return obj.reseller_profile.is_active
        except Exception:
            return False


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Ancien mot de passe incorrect.")
        return value
