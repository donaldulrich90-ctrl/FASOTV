from rest_framework import serializers
from .models import Category, Channel, EPG


class CategorySerializer(serializers.ModelSerializer):
    channel_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ("id", "name", "icon", "order", "slug", "channel_count")


class EPGSerializer(serializers.ModelSerializer):
    class Meta:
        model = EPG
        fields = ("id", "title", "description", "start_time", "end_time")


class ChannelSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source="category", write_only=True, required=False
    )
    current_epg = serializers.SerializerMethodField()

    class Meta:
        model = Channel
        fields = (
            "id", "name", "logo_url", "category", "category_id",
            "stream_url", "is_active", "order", "viewers_count",
            "is_featured", "language", "country", "current_epg",
        )

    def get_current_epg(self, obj):
        from django.utils import timezone
        now = timezone.now()
        epg = obj.epg_entries.filter(start_time__lte=now, end_time__gte=now).first()
        return EPGSerializer(epg).data if epg else None


class ChannelListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Channel
        fields = ("id", "name", "logo_url", "category_id", "category_name",
                  "is_active", "order", "viewers_count", "is_featured")
