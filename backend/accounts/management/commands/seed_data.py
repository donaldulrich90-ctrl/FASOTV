"""
Commande : python manage.py seed_data
Peuple la BDD avec des données de démo FASO TV.

Notes sur les flux vidéo :
- Les URL de stream utilisées sont des flux HLS publics de test (Apple, Mux, etc.)
- En production, remplacer par de vrais flux ou configurer le panel Xtream
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta


DEMO_STREAM = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
DEMO_STREAM_2 = "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8"

CHANNELS_DATA = [
    # Burkina Faso
    {"name": "RTB 1", "category": "Burkina Faso", "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/RTB_Faso.svg/200px-RTB_Faso.svg.png"},
    {"name": "BF1", "category": "Burkina Faso", "logo": ""},
    {"name": "TNB", "category": "Burkina Faso", "logo": ""},
    {"name": "Oméga TV", "category": "Burkina Faso", "logo": ""},
    {"name": "Canal Arc-en-Ciel", "category": "Burkina Faso", "logo": ""},
    # Afrique
    {"name": "TV5 Monde Afrique", "category": "Afrique", "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/TV5monde_2017.svg/200px-TV5monde_2017.svg.png"},
    {"name": "Africa 24", "category": "Afrique", "logo": ""},
    {"name": "Canal+ Afrique", "category": "Afrique", "logo": ""},
    {"name": "Trace Africa", "category": "Afrique", "logo": ""},
    {"name": "Trace Urban", "category": "Afrique", "logo": ""},
    # Information
    {"name": "France 24 FR", "category": "Information", "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/France24_logo.svg/200px-France24_logo.svg.png"},
    {"name": "France 24 EN", "category": "Information", "logo": ""},
    {"name": "Al Jazeera EN", "category": "Information", "logo": ""},
    {"name": "BBC World News", "category": "Information", "logo": ""},
    {"name": "CNN International", "category": "Information", "logo": ""},
    {"name": "RFI Monde", "category": "Information", "logo": ""},
    # Sports
    {"name": "beIN Sports 1", "category": "Sports", "logo": ""},
    {"name": "beIN Sports 2", "category": "Sports", "logo": ""},
    {"name": "Canal+ Sport", "category": "Sports", "logo": ""},
    {"name": "Supersport", "category": "Sports", "logo": ""},
    {"name": "Eurosport 1", "category": "Sports", "logo": ""},
    # Divertissement
    {"name": "Canal+ Fiction", "category": "Divertissement", "logo": ""},
    {"name": "Canal+ Cinéma", "category": "Divertissement", "logo": ""},
    {"name": "Disney Channel", "category": "Divertissement", "logo": ""},
    {"name": "Trace Gospel", "category": "Divertissement", "logo": ""},
    # Musique
    {"name": "Trace Mziki", "category": "Musique", "logo": ""},
    {"name": "MTV Base", "category": "Musique", "logo": ""},
    # Jeunesse
    {"name": "Cartoon Network", "category": "Jeunesse", "logo": ""},
    {"name": "Gulli Africa", "category": "Jeunesse", "logo": ""},
    # Religion
    {"name": "Soudjou TV", "category": "Religion", "logo": ""},
]

MOVIES_DATA = [
    {
        "title": "La Nuit des Rois",
        "description": "Un jeune homme doit raconter des histoires toute la nuit pour survivre dans une prison ivoirienne.",
        "genre": "Drame",
        "year": 2021,
        "rating": 7.2,
        "duration": 93,
    },
    {
        "title": "Atlantique",
        "description": "Sur la côte sénégalaise, des jeunes travailleurs disparaissent en mer. Leurs fantômes reviennent hanter les lieux.",
        "genre": "Drame",
        "year": 2019,
        "rating": 7.1,
        "duration": 106,
    },
    {
        "title": "Félicité",
        "description": "À Kinshasa, une femme courageuse lutte pour sauver son fils après un accident.",
        "genre": "Drame",
        "year": 2017,
        "rating": 7.3,
        "duration": 129,
    },
    {
        "title": "Timbuktu",
        "description": "Un couple et sa fille voient leur vie paisible bouleversée par l'occupation jihadiste au Mali.",
        "genre": "Drame",
        "year": 2014,
        "rating": 7.6,
        "duration": 97,
    },
    {
        "title": "Moolaadé",
        "description": "Une femme africaine s'oppose à la pratique de l'excision dans son village.",
        "genre": "Drame",
        "year": 2004,
        "rating": 7.7,
        "duration": 124,
    },
    {
        "title": "Black Panther",
        "description": "T'Challa, le roi du Wakanda, doit défendre son pays contre une menace intérieure.",
        "genre": "Action",
        "year": 2018,
        "rating": 7.3,
        "duration": 134,
    },
    {
        "title": "Coming 2 America",
        "description": "Le prince Akeem retourne en Amérique pour trouver l'héritier au trône du Zamunda.",
        "genre": "Comédie",
        "year": 2021,
        "rating": 5.3,
        "duration": 110,
    },
    {
        "title": "The Woman King",
        "description": "L'histoire des Agojie, les guerrières redoutables du royaume du Dahomey en Afrique de l'Ouest.",
        "genre": "Action",
        "year": 2022,
        "rating": 7.0,
        "duration": 135,
    },
    {
        "title": "Yarabi",
        "description": "Une fresque familiale burkinabè sur trois générations dans le contexte des transformations sociales.",
        "genre": "Drame",
        "year": 2020,
        "rating": 6.8,
        "duration": 98,
    },
    {
        "title": "Ali Zaoua",
        "description": "Des enfants des rues de Casablanca organisent des funérailles pour leur ami tué.",
        "genre": "Drame",
        "year": 2000,
        "rating": 7.9,
        "duration": 90,
    },
    {
        "title": "Mandabi",
        "description": "Un homme de Dakar reçoit un mandat de son neveu depuis Paris — début d'un cauchemar bureaucratique.",
        "genre": "Comédie dramatique",
        "year": 1968,
        "rating": 7.5,
        "duration": 90,
    },
    {
        "title": "Yaaba",
        "description": "Dans un village burkinabè, un enfant se lie d'amitié avec une vieille femme rejetée par la communauté.",
        "genre": "Drame",
        "year": 1989,
        "rating": 7.8,
        "duration": 90,
        "is_featured": True,
    },
]

SERIES_DATA = [
    {
        "title": "Kafon",
        "description": "Série burkinabè humoristique sur la vie quotidienne à Ouagadougou.",
        "genre": "Comédie",
        "rating": 7.5,
        "seasons": [
            {"number": 1, "episodes": 12},
            {"number": 2, "episodes": 10},
        ],
    },
    {
        "title": "African Queens",
        "description": "Série documentaire Netflix sur les grandes reines d'Afrique.",
        "genre": "Documentaire",
        "rating": 7.8,
        "seasons": [{"number": 1, "episodes": 4}],
    },
    {
        "title": "Blood & Water",
        "description": "Thriller scolaire sud-africain : une lycéenne enquête sur l'enlèvement de sa sœur.",
        "genre": "Thriller",
        "rating": 6.9,
        "seasons": [
            {"number": 1, "episodes": 6},
            {"number": 2, "episodes": 8},
            {"number": 3, "episodes": 8},
        ],
    },
    {
        "title": "Queen Sono",
        "description": "Première production Netflix africaine : une agente secrète sud-africaine en mission.",
        "genre": "Action",
        "rating": 6.8,
        "seasons": [{"number": 1, "episodes": 6}],
    },
    {
        "title": "Mambwe Mambwe",
        "description": "Série familiale zambienne pleine d'humour et de valeurs africaines.",
        "genre": "Famille",
        "rating": 7.2,
        "seasons": [{"number": 1, "episodes": 13}],
    },
    {
        "title": "Bino et Fino",
        "description": "Série animée éducative africaine pour enfants.",
        "genre": "Animation",
        "rating": 8.0,
        "seasons": [
            {"number": 1, "episodes": 20},
            {"number": 2, "episodes": 20},
        ],
    },
    {
        "title": "Azali",
        "description": "Drame camerounais sur une famille confrontée aux défis de la modernité.",
        "genre": "Drame",
        "rating": 7.0,
        "seasons": [{"number": 1, "episodes": 8}],
    },
    {
        "title": "Samba",
        "description": "Série d'action burkinabè sur un jeune gendarme qui déjoue des trafics à Ouagadougou.",
        "genre": "Action",
        "rating": 7.4,
        "seasons": [
            {"number": 1, "episodes": 10},
            {"number": 2, "episodes": 10},
        ],
    },
]

PLANS_DATA = [
    {
        "name": "Journalier",
        "slug": "journalier",
        "price": 200,
        "duration_hours": 24,
        "max_screens": 1,
        "features": ["Toutes les chaînes live", "VOD incluse", "1 écran simultané"],
        "order": 1,
    },
    {
        "name": "Hebdomadaire",
        "slug": "hebdomadaire",
        "price": 1000,
        "duration_hours": 168,
        "max_screens": 2,
        "features": ["Toutes les chaînes live", "VOD illimitée", "Séries complètes", "2 écrans simultanés"],
        "order": 2,
    },
    {
        "name": "Mensuel",
        "slug": "mensuel",
        "price": 3500,
        "duration_hours": 720,
        "max_screens": 3,
        "features": [
            "Toutes les chaînes live", "VOD illimitée", "Séries complètes",
            "3 écrans simultanés", "Téléchargement offline",
        ],
        "order": 3,
    },
    {
        "name": "Premium",
        "slug": "premium",
        "price": 7500,
        "duration_hours": 720,
        "max_screens": 5,
        "features": [
            "Toutes les chaînes live 4K", "VOD illimitée en HD", "Séries complètes",
            "5 écrans simultanés", "Téléchargement offline", "Priorité support",
            "Accès anticipé nouveautés",
        ],
        "order": 4,
    },
]


class Command(BaseCommand):
    help = "Peuple la base de données avec des données de démo FASO TV"

    def add_arguments(self, parser):
        parser.add_argument("--flush", action="store_true", help="Supprimer les données existantes avant de seeder")

    def handle(self, *args, **options):
        if options["flush"]:
            self._flush()

        self.stdout.write(self.style.MIGRATE_HEADING("=== FASO TV — Seed Data ==="))

        self._seed_plans()
        self._seed_channels()
        self._seed_movies()
        self._seed_series()
        self._seed_users()

        self.stdout.write(self.style.SUCCESS("\nDonnees de demo creees avec succes !"))
        self.stdout.write("\n  Connexions disponibles :")
        self.stdout.write("  Admin   → phone: 70000000 / password: admin123")
        self.stdout.write("  Test    → phone: 71000000 / password: test123")
        self.stdout.write("  API Docs→ http://localhost:8000/api/docs/")

    def _flush(self):
        from channels.models import Channel, Category, EPG
        from vod.models import Movie, Series, Season, Episode
        from subscriptions.models import Plan
        EPG.objects.all().delete()
        Channel.objects.all().delete()
        Category.objects.all().delete()
        Episode.objects.all().delete()
        Season.objects.all().delete()
        Series.objects.all().delete()
        Movie.objects.all().delete()
        Plan.objects.all().delete()
        self.stdout.write(self.style.WARNING("Base nettoyée."))

    def _seed_plans(self):
        from subscriptions.models import Plan
        created = 0
        for data in PLANS_DATA:
            _, c = Plan.objects.update_or_create(slug=data["slug"], defaults=data)
            if c:
                created += 1
        self.stdout.write(f"  Forfaits : {created} créés, {len(PLANS_DATA) - created} mis à jour")

    def _seed_channels(self):
        from channels.models import Channel, Category, EPG
        from django.utils.text import slugify

        created = 0
        for i, data in enumerate(CHANNELS_DATA):
            cat_slug = slugify(data["category"])
            category, _ = Category.objects.get_or_create(
                slug=cat_slug,
                defaults={"name": data["category"], "icon": "tv", "order": i // 5},
            )

            channel, c = Channel.objects.update_or_create(
                name=data["name"],
                defaults={
                    "logo_url": data.get("logo", ""),
                    "category": category,
                    "stream_url": DEMO_STREAM if i % 2 == 0 else DEMO_STREAM_2,
                    "is_active": True,
                    "order": i,
                    "is_featured": i < 6,
                    "country": "BF" if data["category"] == "Burkina Faso" else "",
                },
            )
            if c:
                created += 1
                # Add sample EPG entries
                now = timezone.now().replace(minute=0, second=0, microsecond=0)
                EPG_ENTRIES = [
                    ("Journal de 20h", "Journal télévisé du soir"),
                    ("Débat politique", "Grande émission de débat"),
                    ("Musique africaine", "Sélection des meilleurs clips"),
                    ("Film du soir", "Cinéma africain en prime time"),
                ]
                for j, (title, desc) in enumerate(EPG_ENTRIES):
                    EPG.objects.create(
                        channel=channel,
                        title=title,
                        description=desc,
                        start_time=now + timedelta(hours=j),
                        end_time=now + timedelta(hours=j + 1),
                    )

        self.stdout.write(f"  Chaînes : {created} créées")

    def _seed_movies(self):
        from vod.models import Movie
        created = 0
        for data in MOVIES_DATA:
            _, c = Movie.objects.update_or_create(
                title=data["title"],
                defaults={
                    **data,
                    "stream_url": DEMO_STREAM,
                    "poster_url": f"https://picsum.photos/seed/{data['title'][:10].replace(' ', '')}/300/450",
                    "is_active": True,
                    "is_featured": data.get("is_featured", False),
                },
            )
            if c:
                created += 1
        self.stdout.write(f"  Films    : {created} créés")

    def _seed_series(self):
        from vod.models import Series, Season, Episode
        created = 0
        for data in SERIES_DATA:
            series, c = Series.objects.update_or_create(
                title=data["title"],
                defaults={
                    "description": data["description"],
                    "genre": data["genre"],
                    "rating": data["rating"],
                    "total_seasons": len(data["seasons"]),
                    "poster_url": f"https://picsum.photos/seed/{data['title'][:8].replace(' ', '')}/300/450",
                    "is_active": True,
                    "is_featured": created < 3,
                },
            )
            if c:
                created += 1

            for season_data in data["seasons"]:
                season, _ = Season.objects.get_or_create(
                    series=series,
                    number=season_data["number"],
                    defaults={"title": f"Saison {season_data['number']}"},
                )
                for ep_num in range(1, season_data["episodes"] + 1):
                    Episode.objects.get_or_create(
                        season=season,
                        number=ep_num,
                        defaults={
                            "title": f"Épisode {ep_num}",
                            "stream_url": DEMO_STREAM,
                            "duration": 25 + (ep_num % 20),
                        },
                    )

        self.stdout.write(f"  Séries   : {created} créées")

    def _seed_users(self):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        created = 0

        if not User.objects.filter(phone="+22670000000").exists():
            User.objects.create_superuser(phone="70000000", password="admin123", name="Admin FAEST")
            created += 1

        if not User.objects.filter(phone="+22671000000").exists():
            User.objects.create_user(phone="71000000", password="test123", name="Utilisateur Test")
            created += 1

        self.stdout.write(f"  Comptes  : {created} créés")
