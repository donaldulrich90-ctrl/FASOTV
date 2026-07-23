from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('channels', '0002_channel_is_high_bitrate'),
    ]

    operations = [
        migrations.AddField(
            model_name='channel',
            name='is_radio',
            field=models.BooleanField(default=False, db_index=True, help_text='Station radio (audio uniquement)'),
        ),
        migrations.AlterField(
            model_name='channel',
            name='is_high_bitrate',
            field=models.BooleanField(default=False, db_index=True, help_text="Flux >15 Mbit/s (4K/8K/RAW) — masqué aux utilisateurs jusqu'au transcodage"),
        ),
        migrations.AddIndex(
            model_name='channel',
            index=models.Index(fields=['name'], name='channels_channel_name_idx'),
        ),
    ]
