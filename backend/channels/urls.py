from django.urls import path
from . import views

urlpatterns = [
    path("", views.ChannelListView.as_view(), name="channel-list"),
    path("categories/", views.CategoryListView.as_view(), name="category-list"),
    path("featured/", views.FeaturedChannelsView.as_view(), name="channel-featured"),
    path("<int:pk>/", views.ChannelDetailView.as_view(), name="channel-detail"),
    path("<int:pk>/epg/", views.ChannelEPGView.as_view(), name="channel-epg"),
]
