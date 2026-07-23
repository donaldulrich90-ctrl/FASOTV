from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vod', '0001_initial'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='movie',
            index=models.Index(fields=['title'], name='vod_movie_title_idx'),
        ),
        migrations.AddIndex(
            model_name='series',
            index=models.Index(fields=['title'], name='vod_series_title_idx'),
        ),
    ]
