import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { isFavorite, addFavorite, removeFavorite } from "../utils/store";
import useTranslation from "../hooks/useTranslation";
import { useLanguages, useGenres } from "../hooks/useCatalog";
import api from "../services/api";
import {
  MdSearch, MdVideoLibrary, MdStar, MdPlayArrow, MdClose,
  MdFavorite, MdFavoriteBorder, MdWhatsapp,
} from "react-icons/md";

const SORT_OPTIONS = ["recent", "year", "alpha", "rating"];

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] rounded-card bg-card/60" />
      <div className="h-3 bg-card/60 rounded mt-2 w-3/4" />
      <div className="h-2 bg-card/40 rounded mt-1 w-1/2" />
    </div>
  );
}

// ─── Series Card ──────────────────────────────────────────────────────────────

function SeriesCard({ series, onClick }) {
  const { t } = useTranslation();
  return (
    <button onClick={onClick} className="group text-left w-full">
      <div className="aspect-[2/3] rounded-card overflow-hidden bg-card relative">
        {series.poster_url ? (
          <img
            src={series.poster_url}
            alt={series.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MdVideoLibrary className="text-white/20 text-4xl" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
          <div className="flex items-center gap-1 text-gold text-sm font-semibold">
            <MdPlayArrow className="text-xl" /> Regarder
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <p className="text-xs text-white/60">
            {series.total_seasons} {t("series_seasons")}
          </p>
        </div>
        {series.rating && (
          <div className="absolute top-2 right-2 bg-black/70 rounded-badge px-1.5 py-0.5 text-xs text-gold flex items-center gap-0.5">
            <MdStar className="text-[10px]" /> {series.rating}
          </div>
        )}
        {series.is_featured && (
          <div className="absolute top-2 left-2 bg-gold/90 text-[10px] px-1.5 py-0.5 rounded-badge font-bold text-black">
            À LA UNE
          </div>
        )}
      </div>
      <p className="text-sm font-medium mt-2 truncate group-hover:text-gold transition-colors">{series.title}</p>
      <p className="text-xs text-white/40 truncate">{series.genre}</p>
    </button>
  );
}

// ─── Featured Hero ────────────────────────────────────────────────────────────

function FeaturedHero({ onOpen }) {
  const { t } = useTranslation();
  const [featured, setFeatured] = useState([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    api.get("/vod/series/", { params: { is_featured: true, page_size: 5 } })
      .then((r) => setFeatured(r.data.results || r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => setIdx((i) => (i + 1) % featured.length), 5000);
    return () => clearInterval(timer);
  }, [featured.length]);

  const item = featured[idx];
  if (!item) return null;

  return (
    <div className="relative rounded-card overflow-hidden aspect-[21/8] bg-black mb-6">
      <img
        src={item.poster_url}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover opacity-50"
        onError={(e) => { e.target.style.display = "none"; }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
      <div className="absolute bottom-0 left-0 p-5 md:p-8 max-w-lg">
        <p className="text-white/60 text-sm mb-1">{item.genre} · {item.total_seasons} saison(s)</p>
        <h2 className="text-2xl md:text-3xl font-black mb-2">{item.title}</h2>
        <p className="text-white/60 text-sm mb-4 line-clamp-2 hidden md:block">{item.description}</p>
        <button onClick={() => onOpen(item)} className="btn-primary flex items-center gap-2">
          <MdPlayArrow className="text-xl" /> {t("btn_regarder")}
        </button>
      </div>
    </div>
  );
}

// ─── Series Info Modal ────────────────────────────────────────────────────────

function SeriesModal({ series, onClose }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [fav, setFav] = useState(isFavorite(series.id, "series"));

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", h); };
  }, [onClose]);

  const toggleFav = () => {
    if (fav) removeFavorite(series.id, "series");
    else addFavorite({ id: series.id, type: "series", title: series.title, poster_url: series.poster_url });
    setFav(!fav);
  };

  const shareWA = () => {
    const text = encodeURIComponent(`📺 ${series.title} — à voir sur FASO TV\n${series.description || ""}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-4">
          {series.poster_url && (
            <img
              src={series.poster_url}
              alt={series.title}
              className="w-28 rounded-card object-cover flex-shrink-0"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h2 className="font-black text-xl leading-tight">{series.title}</h2>
              <button onClick={onClose} className="text-white/40 hover:text-white p-1 flex-shrink-0">
                <MdClose className="text-xl" />
              </button>
            </div>
            <p className="text-white/50 text-sm mb-3">
              {series.genre} · {series.total_seasons} saison(s)
              {series.rating && <span> · ⭐ {series.rating}</span>}
            </p>
            {series.description && (
              <p className="text-white/60 text-sm leading-relaxed line-clamp-4 mb-4">{series.description}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate(`/series/${series.id}`)}
                className="btn-primary flex items-center gap-1.5 text-sm"
              >
                <MdPlayArrow className="text-lg" /> Voir les épisodes
              </button>
              <button
                onClick={toggleFav}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-sm transition-all ${fav ? "bg-live/20 text-live border border-live/30" : "border border-border text-white/60 hover:border-live/30 hover:text-live"}`}
              >
                {fav ? <MdFavorite /> : <MdFavoriteBorder />}
                {fav ? "Favori ✓" : "Ajouter"}
              </button>
              <button
                onClick={shareWA}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-sm border border-border text-white/60 hover:border-green-500/30 hover:text-green-400 transition-colors"
              >
                <MdWhatsapp /> {t("btn_whatsapp")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Pill row ─────────────────────────────────────────────────────────────────

function PillRow({ items, active, onSelect, getKey, getLabel, getCount }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 px-3 py-1 rounded-badge text-sm transition-all ${
          active === null ? "bg-gold text-black font-semibold" : "bg-card text-white/60 hover:text-white"
        }`}
      >
        Tous
      </button>
      {items.map((item) => (
        <button
          key={getKey(item)}
          onClick={() => onSelect(getKey(item) === active ? null : getKey(item))}
          className={`flex-shrink-0 px-3 py-1 rounded-badge text-sm transition-all ${
            getKey(item) === active ? "bg-gold text-black font-semibold" : "bg-card text-white/60 hover:text-white"
          }`}
        >
          {getLabel(item)}
          {getCount && <span className="ml-1 text-xs opacity-60">({getCount(item)})</span>}
        </button>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SeriesPage() {
  const { t } = useTranslation();
  const [seriesList, setSeriesList] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeLang, setActiveLang] = useState(null);
  const [activeGenre, setActiveGenre] = useState(null);
  const [sort, setSort] = useState("recent");
  const [selected, setSelected] = useState(null);
  const loaderRef = useRef(null);

  const { languages } = useLanguages("series");
  const { genres } = useGenres("series", activeLang);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setSeriesList([]);
    setPage(1);
    setHasMore(false);
    setActiveGenre(null);
  }, [activeLang]);

  useEffect(() => {
    setSeriesList([]);
    setPage(1);
    setHasMore(false);
  }, [debouncedSearch, activeGenre, sort]);

  useEffect(() => {
    let cancelled = false;
    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    const params = { page, sort };
    if (debouncedSearch) params.search = debouncedSearch;
    if (activeLang) params.lang = activeLang;
    if (activeGenre) params.genre = activeGenre;

    api.get("/vod/series/", { params }).then((r) => {
      if (cancelled) return;
      const results = r.data.results || [];
      setSeriesList((prev) => (page === 1 ? results : [...prev, ...results]));
      setHasMore(!!r.data.next);
    }).catch(() => {}).finally(() => {
      if (!cancelled) { setLoading(false); setLoadingMore(false); }
    });

    return () => { cancelled = true; };
  }, [page, debouncedSearch, activeLang, activeGenre, sort]);

  useEffect(() => {
    if (!loaderRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasMore && !loadingMore) setPage((p) => p + 1); },
      { threshold: 0.1 }
    );
    obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [hasMore, loadingMore]);

  const resetFilters = () => {
    setSearch("");
    setActiveLang(null);
    setActiveGenre(null);
    setSort("recent");
  };

  const hasFilters = search || activeLang || activeGenre || sort !== "recent";

  return (
    <div className="animate-fade-in">
      {selected && <SeriesModal series={selected} onClose={() => setSelected(null)} />}

      <div className="p-4 md:p-6 space-y-4">
        {!search && !activeLang && !activeGenre && <FeaturedHero onOpen={setSelected} />}

        <div className="flex items-center gap-3">
          <MdVideoLibrary className="text-gold text-2xl" />
          <h1 className="text-2xl font-bold">{t("series_title")}</h1>
        </div>

        {/* Sort bar */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {SORT_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`flex-shrink-0 px-3 py-1 rounded-badge text-sm transition-all ${
                sort === s ? "bg-gold/20 text-gold border border-gold/30 font-semibold" : "text-white/50 hover:text-white"
              }`}
            >
              {t(`sort_${s}`)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg" />
            <input
              type="search"
              placeholder={t("series_search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          {hasFilters && (
            <button onClick={resetFilters} className="btn-outline flex items-center gap-1 text-sm px-3">
              <MdClose className="text-sm" /> {t("filter_reset")}
            </button>
          )}
        </div>

        {/* Language pills */}
        {languages.length > 0 && (
          <PillRow
            items={languages}
            active={activeLang}
            onSelect={(code) => { setActiveLang(code); setActiveGenre(null); }}
            getKey={(l) => l.code}
            getLabel={(l) => l.label}
            getCount={(l) => l.count}
          />
        )}

        {/* Genre pills */}
        {genres.length > 0 && (
          <PillRow
            items={genres}
            active={activeGenre}
            onSelect={setActiveGenre}
            getKey={(g) => g.slug}
            getLabel={(g) => g.label}
            getCount={(g) => g.count}
          />
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : seriesList.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <MdVideoLibrary className="text-5xl mx-auto mb-3 opacity-30" />
            <p>{t("series_empty")}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {seriesList.map((s) => (
                <SeriesCard key={s.id} series={s} onClick={() => setSelected(s)} />
              ))}
            </div>
            <div ref={loaderRef} className="py-4 flex justify-center">
              {loadingMore && (
                <div className="w-6 h-6 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
              )}
              {!hasMore && seriesList.length > 0 && (
                <p className="text-white/20 text-xs">{t("load_more_end")}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
