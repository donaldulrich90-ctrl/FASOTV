from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('channels', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='channel',
            name='is_high_bitrate',
            field=models.BooleanField(default=False, help_text='Flux >15 Mbit/s (4K/8K/RAW) — masqué aux utilisateurs jusqu\'au transcodage'),
        ),
    ]
