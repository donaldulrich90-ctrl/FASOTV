from django.db.models import Count, Q
from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from accounts.helpers import adult_allowed
from .models import Category, Channel, EPG
from .serializers import CategorySerializer, ChannelSerializer, ChannelListSerializer, EPGSerializer


class CategoryListView(generics.ListAPIView):
    permission_classes = (AllowAny,)
    serializer_class = CategorySerializer

    def get_queryset(self):
        show_adult = adult_allowed(self.request)
        count_filter = Q() if show_adult else Q(channels__is_adult=False)
        qs = Category.objects.all()
        if not show_adult:
            qs = qs.filter(is_adult=False)
        return qs.annotate(channel_count=Count("channels", filter=count_filter)).order_by("order")


class ChannelListView(generics.ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = ChannelListSerializer
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = ("category", "is_active", "is_featured", "is_radio")
    search_fields = ("name", "category__name", "language")
    ordering_fields = ("order", "name", "viewers_count")

    def get_queryset(self):
        qs = Channel.objects.filter(is_active=True, is_high_bitrate=False).select_related("category")
        if not adult_allowed(self.request):
            qs = qs.filter(is_adult=False)
        return qs


class ChannelDetailView(generics.RetrieveAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = ChannelSerializer

    def get_queryset(self):
        qs = Channel.objects.select_related("category")
        if not adult_allowed(self.request):
            qs = qs.filter(is_adult=False)
        return qs


class ChannelEPGView(generics.ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = EPGSerializer

    def get_queryset(self):
        channel_id = self.kwargs["pk"]
        return EPG.objects.filter(channel_id=channel_id).order_by("start_time")


class FeaturedChannelsView(generics.ListAPIView):
    permission_classes = (AllowAny,)
    serializer_class = ChannelListSerializer

    def get_queryset(self):
        qs = Channel.objects.filter(
            is_active=True, is_featured=True, is_high_bitrate=False
        ).select_related("category")
        if not adult_allowed(self.request):
            qs = qs.filter(is_adult=False)
        return qs[:10]
