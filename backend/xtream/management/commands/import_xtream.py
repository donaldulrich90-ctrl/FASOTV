from django.core.management.base import BaseCommand
from django.utils.text import slugify

from xtream.client import XtreamClient
from xtream.taxonomy import parse_category
from xtream.utils import is_high_bitrate, is_radio, is_adult_content


class Command(BaseCommand):
    help = "Import Xtream Codes catalog (live/vod/series) into the local DB"

    def add_arguments(self, parser):
        parser.add_argument("--live", action="store_true", help="Import live streams")
        parser.add_argument("--vod", action="store_true", help="Import VOD movies")
        parser.add_argument("--series", action="store_true", help="Import series")
        parser.add_argument("--all", action="store_true", dest="import_all", help="Import everything")
        parser.add_argument("--batch", type=int, default=500, help="Bulk batch size (default: 500)")

    def handle(self, *args, **options):
        client, cat_pattern = self._build_client()
        batch = options["batch"]
        do_all = options["import_all"]

        if do_all or options["live"]:
            self._import_live(client, batch, cat_pattern)
        if do_all or options["vod"]:
            self._import_vod(client, batch)
        if do_all or options["series"]:
            self._import_series(client, batch)

        if not any([do_all, options["live"], options["vod"], options["series"]]):
            self.stderr.write("Specify --live, --vod, --series, or --all")

    def _build_client(self):
        # Note: importing from multiple panels would collide on xtream_id (not globally unique).
        # We use only the highest-priority active server.
        try:
            from xtream.models import XtreamServer
            server = XtreamServer.objects.filter(is_active=True).order_by("priority", "name", "id").first()
            if server:
                return (
                    XtreamClient(server.url, server.username, server.password, user_agent=server.user_agent),
                    server.cat_pattern,
                )
        except Exception:
            pass
        return XtreamClient(), ""

    def _import_live(self, client, batch, cat_pattern=""):
        from channels.models import Channel, Category

        self.stdout.write("Fetching live streams…")
        try:
            streams = client.get_live_streams()
        except Exception as exc:
            self.stderr.write(f"Failed to fetch live streams: {exc}")
            return
        self.stdout.write(f"  Got {len(streams)} streams")

        # Pre-fetch category slugs → id
        cat_cache = {c.slug: c.id for c in Category.objects.all()}
        # Pre-fetch existing xtream_id → pk
        existing = {
            r["xtream_id"]: r["id"]
            for r in Channel.objects.filter(xtream_id__isnull=False).values("xtream_id", "id")
        }

        to_create, to_update = [], []
        seen = set()

        for stream in streams:
            xid = stream.get("stream_id")
            if not xid or xid in seen:
                continue
            seen.add(xid)

            name = stream.get("name", "")
            group = stream.get("category_name") or "Général"
            parsed = parse_category(group, cat_pattern)
            display_name = parsed["label"]
            slug = slugify(display_name)[:50] or "general"

            if slug not in cat_cache:
                cat, _ = Category.objects.get_or_create(slug=slug, defaults={"name": display_name})
                cat_cache[slug] = cat.id

            adult = is_adult_content(name, group)
            obj = Channel(
                xtream_id=xid,
                name=name,
                logo_url=stream.get("stream_icon") or "",
                stream_url=client.get_stream_url(xid, "live"),
                category_id=cat_cache[slug],
                is_active=True,
                is_high_bitrate=is_high_bitrate(name),
                is_radio=is_radio(name, group),
                is_adult=adult,
            )
            if xid in existing:
                obj.pk = existing[xid]
                to_update.append(obj)
            else:
                to_create.append(obj)

        if to_create:
            Channel.objects.bulk_create(to_create, batch_size=batch, ignore_conflicts=True)
            self.stdout.write(self.style.SUCCESS(f"  Created {len(to_create)} channels"))

        if to_update:
            Channel.objects.bulk_update(
                to_update,
                fields=["name", "logo_url", "stream_url", "category_id", "is_active", "is_high_bitrate", "is_radio", "is_adult"],
                batch_size=batch,
            )
            self.stdout.write(self.style.SUCCESS(f"  Updated {len(to_update)} channels"))

    def _import_vod(self, client, batch):
        from vod.models import Movie

        self.stdout.write("Fetching VOD streams…")
        try:
            streams = client.get_vod_streams()
        except Exception as exc:
            self.stderr.write(f"Failed to fetch VOD: {exc}")
            return
        self.stdout.write(f"  Got {len(streams)} movies")

        existing = {
            r["xtream_id"]: r["id"]
            for r in Movie.objects.filter(xtream_id__isnull=False).values("xtream_id", "id")
        }

        to_create, to_update = [], []
        seen = set()

        for stream in streams:
            xid = stream.get("stream_id")
            if not xid or xid in seen:
                continue
            seen.add(xid)

            title = stream.get("name", "")
            genre = stream.get("category_name") or ""
            obj = Movie(
                xtream_id=xid,
                title=title,
                poster_url=stream.get("stream_icon") or "",
                stream_url=client.get_stream_url(xid, "movie"),
                genre=genre,
                is_active=True,
                is_adult=is_adult_content(title, genre),
            )
            if xid in existing:
                obj.pk = existing[xid]
                to_update.append(obj)
            else:
                to_create.append(obj)

        if to_create:
            Movie.objects.bulk_create(to_create, batch_size=batch, ignore_conflicts=True)
            self.stdout.write(self.style.SUCCESS(f"  Created {len(to_create)} movies"))

        if to_update:
            Movie.objects.bulk_update(
                to_update,
                fields=["title", "poster_url", "stream_url", "genre", "is_active", "is_adult"],
                batch_size=batch,
            )
            self.stdout.write(self.style.SUCCESS(f"  Updated {len(to_update)} movies"))

    def _import_series(self, client, batch):
        from vod.models import Series

        self.stdout.write("Fetching series…")
        try:
            items = client.get_series()
        except Exception as exc:
            self.stderr.write(f"Failed to fetch series: {exc}")
            return
        self.stdout.write(f"  Got {len(items)} series")

        existing = {
            r["xtream_id"]: r["id"]
            for r in Series.objects.filter(xtream_id__isnull=False).values("xtream_id", "id")
        }

        to_create, to_update = [], []
        seen = set()

        for item in items:
            xid = item.get("series_id")
            if not xid or xid in seen:
                continue
            seen.add(xid)

            title = item.get("name", "")
            genre = item.get("genre") or item.get("category_name") or ""
            obj = Series(
                xtream_id=xid,
                title=title,
                poster_url=item.get("cover") or "",
                genre=genre,
                rating=_safe_decimal(item.get("rating")),
                total_seasons=item.get("num_seasons") or 1,
                is_active=True,
                is_adult=is_adult_content(title, genre),
            )
            if xid in existing:
                obj.pk = existing[xid]
                to_update.append(obj)
            else:
                to_create.append(obj)

        if to_create:
            Series.objects.bulk_create(to_create, batch_size=batch, ignore_conflicts=True)
            self.stdout.write(self.style.SUCCESS(f"  Created {len(to_create)} series"))

        if to_update:
            Series.objects.bulk_update(
                to_update,
                fields=["title", "poster_url", "genre", "rating", "total_seasons", "is_active", "is_adult"],
                batch_size=batch,
            )
            self.stdout.write(self.style.SUCCESS(f"  Updated {len(to_update)} series"))


def _safe_decimal(value):
    from decimal import Decimal, InvalidOperation
    try:
        return Decimal(str(value)) if value else None
    except (TypeError, ValueError, InvalidOperation):
        return None
