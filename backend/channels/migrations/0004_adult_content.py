from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('channels', '0003_channel_radio_indexes'),
    ]

    operations = [
        migrations.AddField(
            model_name='category',
            name='is_adult',
            field=models.BooleanField(default=False, db_index=True),
        ),
        migrations.AddField(
            model_name='channel',
            name='is_adult',
            field=models.BooleanField(
                default=False,
                db_index=True,
                help_text='Contenu adulte — masqué sans PIN',
            ),
        ),
    ]
