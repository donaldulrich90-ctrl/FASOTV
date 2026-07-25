from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("channels", "0004_adult_content"),
    ]

    operations = [
        migrations.AddField(
            model_name="channel",
            name="lang_code",
            field=models.CharField(blank=True, db_index=True, max_length=10),
        ),
        migrations.AddField(
            model_name="channel",
            name="genre_slug",
            field=models.CharField(blank=True, db_index=True, max_length=60),
        ),
        migrations.AddField(
            model_name="channel",
            name="quality",
            field=models.CharField(blank=True, max_length=20),
        ),
        migrations.AddIndex(
            model_name="channel",
            index=models.Index(fields=["lang_code", "genre_slug"], name="channel_lang_genre_idx"),
        ),
    ]
