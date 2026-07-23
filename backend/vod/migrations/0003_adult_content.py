from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vod', '0002_vod_title_indexes'),
    ]

    operations = [
        migrations.AddField(
            model_name='movie',
            name='is_adult',
            field=models.BooleanField(
                default=False,
                db_index=True,
                help_text='Contenu adulte — masqué sans PIN',
            ),
        ),
        migrations.AddField(
            model_name='series',
            name='is_adult',
            field=models.BooleanField(
                default=False,
                db_index=True,
                help_text='Contenu adulte — masqué sans PIN',
            ),
        ),
    ]
