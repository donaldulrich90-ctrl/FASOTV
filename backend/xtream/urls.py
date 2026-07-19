from django.urls import path
from . import views

urlpatterns = [
    path("info/", views.XtreamInfoView.as_view(), name="xtream-info"),
    path("live/categories/", views.XtreamLiveCategoriesView.as_view(), name="xtream-live-categories"),
    path("live/streams/", views.XtreamLiveStreamsView.as_view(), name="xtream-live-streams"),
    path("vod/", views.XtreamVODView.as_view(), name="xtream-vod"),
    path("series/", views.XtreamSeriesView.as_view(), name="xtream-series"),
    path("epg/<int:stream_id>/", views.XtreamEPGView.as_view(), name="xtream-epg"),
    path("sync/", views.XtreamSyncView.as_view(), name="xtream-sync"),
]
