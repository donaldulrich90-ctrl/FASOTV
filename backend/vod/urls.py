from django.urls import path
from . import views

urlpatterns = [
    path("movies/", views.MovieListView.as_view(), name="movie-list"),
    path("movies/<int:pk>/", views.MovieDetailView.as_view(), name="movie-detail"),
    path("series/", views.SeriesListView.as_view(), name="series-list"),
    path("series/<int:pk>/", views.SeriesDetailView.as_view(), name="series-detail"),
    path("favorites/", views.FavoriteListView.as_view(), name="favorites"),
    path("favorites/toggle/", views.ToggleFavoriteView.as_view(), name="toggle-favorite"),
    path("history/", views.WatchHistoryView.as_view(), name="watch-history"),
    path("history/update/", views.UpdateWatchProgressView.as_view(), name="update-progress"),
    path("search/", views.GlobalSearchView.as_view(), name="global-search"),
]
