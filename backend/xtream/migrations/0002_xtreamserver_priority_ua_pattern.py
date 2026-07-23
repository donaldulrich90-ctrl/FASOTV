from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("xtream", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="xtreamserver",
            name="priority",
            field=models.PositiveSmallIntegerField(
                default=10,
                help_text="Priorité de basculement (plus bas = essayé en premier)",
            ),
        ),
        migrations.AddField(
            model_name="xtreamserver",
            name="user_agent",
            field=models.CharField(
                default="krxplayer",
                max_length=200,
                help_text="User-Agent envoyé au panel Xtream",
            ),
        ),
        migrations.AddField(
            model_name="xtreamserver",
            name="cat_pattern",
            field=models.CharField(
                blank=True,
                default=r"^([A-Z]{2,6})\s*[|\-]\s*(.+)$",
                max_length=100,
                help_text="Regex de parsing des noms de catégorie (groupe 1 = préfixe, groupe 2 = label). Laisser vide pour désactiver.",
            ),
        ),
        migrations.AlterModelOptions(
            name="xtreamserver",
            options={
                "ordering": ["priority", "name", "id"],
                "verbose_name": "Serveur Xtream",
                "verbose_name_plural": "Serveurs Xtream",
            },
        ),
    ]
