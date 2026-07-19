from django.db.models import Count
from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, Channel, EPG
from .serializers import CategorySerializer, ChannelSerializer, ChannelListSerializer, EPGSerializer


class CategoryListView(generics.ListAPIView):
    permission_classes = (AllowAny,)
    serializer_class = CategorySerializer

    def get_queryset(self):
        return Category.objects.annotate(channel_count=Count("channels")).order_by("order")


class ChannelListView(generics.ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = ChannelListSerializer
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = ("category", "is_active", "is_featured")
    search_fields = ("name", "category__name", "language")
    ordering_fields = ("order", "name", "viewers_count")

    def get_queryset(self):
        return Channel.objects.filter(is_active=True).select_related("category")


class ChannelDetailView(generics.RetrieveAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = ChannelSerializer
    queryset = Channel.objects.select_related("category")


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
        return Channel.objects.filter(is_active=True, is_featured=True).select_related("category")[:10]
