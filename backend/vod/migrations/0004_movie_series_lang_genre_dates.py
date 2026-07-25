from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("vod", "0003_adult_content"),
    ]

    operations = [
        # Movie
        migrations.AddField(
            model_name="movie",
            name="added_at",
            field=models.DateTimeField(blank=True, db_index=True, null=True),
        ),
        migrations.AddField(
            model_name="movie",
            name="lang_code",
            field=models.CharField(blank=True, db_index=True, max_length=10),
        ),
        migrations.AddField(
            model_name="movie",
            name="genre_slug",
            field=models.CharField(blank=True, db_index=True, max_length=60),
        ),
        migrations.AddIndex(
            model_name="movie",
            index=models.Index(fields=["lang_code", "genre_slug"], name="movie_lang_genre_idx"),
        ),
        # Series
        migrations.AddField(
            model_name="series",
            name="release_year",
            field=models.IntegerField(blank=True, db_index=True, null=True),
        ),
        migrations.AddField(
            model_name="series",
            name="lang_code",
            field=models.CharField(blank=True, db_index=True, max_length=10),
        ),
        migrations.AddField(
            model_name="series",
            name="genre_slug",
            field=models.CharField(blank=True, db_index=True, max_length=60),
        ),
        migrations.AddIndex(
            model_name="series",
            index=models.Index(fields=["lang_code", "genre_slug"], name="series_lang_genre_idx"),
        ),
    ]
