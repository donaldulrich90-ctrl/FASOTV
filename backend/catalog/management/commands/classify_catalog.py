from django.core.management.base import BaseCommand

from catalog.taxonomy import parse_category

BATCH = 2000


class Command(BaseCommand):
    help = "Classify catalog items by lang_code / genre_slug from their raw category name"

    def add_arguments(self, parser):
        parser.add_argument("--channels", action="store_true", help="Classify channels")
        parser.add_argument("--movies", action="store_true", help="Classify movies")
        parser.add_argument("--series", action="store_true", help="Classify series")
        parser.add_argument("--all", action="store_true", dest="classify_all")
        parser.add_argument("--force", action="store_true", help="Re-classify already classified rows")

    def handle(self, *args, **options):
        do_all = options["classify_all"]
        force = options["force"]

        if do_all or options["channels"]:
            self._classify_channels(force)
        if do_all or options["movies"]:
            self._classify_movies(force)
        if do_all or options["series"]:
            self._classify_series(force)

        if not any([do_all, options["channels"], options["movies"], options["series"]]):
            self.stderr.write("Specify --channels, --movies, --series, or --all")

    # ─── Channels ────────────────────────────────────────────────────────────

    def _classify_channels(self, force: bool):
        from channels.models import Channel

        base_qs = Channel.objects.select_related("category").order_by("id")
        total = base_qs.count() if force else base_qs.filter(lang_code="").count()
        self.stdout.write(f"Classifying {total} channels…")

        updated = 0
        last_id = 0

        while True:
            qs = base_qs.filter(id__gt=last_id)
            if not force:
                qs = qs.filter(lang_code="")
            batch = list(qs[:BATCH])
            if not batch:
                break

            for ch in batch:
                raw = ch.category.name if ch.category else ch.name
                p = parse_category(raw)
                ch.lang_code = p["lang_code"]
                ch.genre_slug = p["genre_slug"]
                ch.quality = p["quality"]
                if p["is_radio"]:
                    ch.is_radio = True
                if p["is_high_bitrate"]:
                    ch.is_high_bitrate = True

            Channel.objects.bulk_update(
                batch,
                ["lang_code", "genre_slug", "quality", "is_radio", "is_high_bitrate"],
                batch_size=BATCH,
            )
            last_id = batch[-1].id
            updated += len(batch)
            self.stdout.write(f"  {updated}/{total}", ending="\r")

        self.stdout.write(self.style.SUCCESS(f"\nDone — {updated} channels classified"))

    # ─── Movies ──────────────────────────────────────────────────────────────

    def _classify_movies(self, force: bool):
        from vod.models import Movie

        base_qs = Movie.objects.order_by("id")
        total = base_qs.count() if force else base_qs.filter(lang_code="").count()
        self.stdout.write(f"Classifying {total} movies…")

        updated = 0
        last_id = 0

        while True:
            qs = base_qs.filter(id__gt=last_id)
            if not force:
                qs = qs.filter(lang_code="")
            batch = list(qs.values("id", "genre")[:BATCH])
            if not batch:
                break

            objs = []
            for row in batch:
                p = parse_category(row["genre"] or "")
                obj = Movie(pk=row["id"], lang_code=p["lang_code"], genre_slug=p["genre_slug"])
                if p["is_adult"]:
                    obj.is_adult = True
                objs.append(obj)

            Movie.objects.bulk_update(objs, ["lang_code", "genre_slug", "is_adult"], batch_size=BATCH)
            last_id = batch[-1]["id"]
            updated += len(objs)
            self.stdout.write(f"  {updated}/{total}", ending="\r")

        self.stdout.write(self.style.SUCCESS(f"\nDone — {updated} movies classified"))

    # ─── Series ──────────────────────────────────────────────────────────────

    def _classify_series(self, force: bool):
        from vod.models import Series

        base_qs = Series.objects.order_by("id")
        total = base_qs.count() if force else base_qs.filter(lang_code="").count()
        self.stdout.write(f"Classifying {total} series…")

        updated = 0
        last_id = 0

        while True:
            qs = base_qs.filter(id__gt=last_id)
            if not force:
                qs = qs.filter(lang_code="")
            batch = list(qs.values("id", "genre")[:BATCH])
            if not batch:
                break

            objs = []
            for row in batch:
                p = parse_category(row["genre"] or "")
                obj = Series(pk=row["id"], lang_code=p["lang_code"], genre_slug=p["genre_slug"])
                if p["is_adult"]:
                    obj.is_adult = True
                objs.append(obj)

            Series.objects.bulk_update(objs, ["lang_code", "genre_slug", "is_adult"], batch_size=BATCH)
            last_id = batch[-1]["id"]
            updated += len(objs)
            self.stdout.write(f"  {updated}/{total}", ending="\r")

        self.stdout.write(self.style.SUCCESS(f"\nDone — {updated} series classified"))
