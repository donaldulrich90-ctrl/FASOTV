import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { isFavorite, addFavorite, removeFavorite } from "../utils/store";
import useTranslation from "../hooks/useTranslation";
import api from "../services/api";
import {
  MdSearch, MdVideoLibrary, MdStar, MdPlayArrow, MdClose,
  MdFavorite, MdFavoriteBorder, MdWhatsapp,
} from "react-icons/md";

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
            {series.total_seasons} {t("series_saisons")}
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
      <p className="text-xs text-white/40">{series.genre}</p>
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SeriesPage() {
  const { t } = useTranslation();
  const [series, setSeries] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const loaderRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setSeries([]);
    setPage(1);
    setHasMore(false);
  }, [debouncedSearch]);

  useEffect(() => {
    let cancelled = false;
    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    const params = { page };
    if (debouncedSearch) params.search = debouncedSearch;

    api.get("/vod/series/", { params }).then((r) => {
      if (cancelled) return;
      const results = r.data.results || [];
      setSeries((prev) => (page === 1 ? results : [...prev, ...results]));
      setHasMore(!!r.data.next);
    }).catch(() => {}).finally(() => {
      if (!cancelled) { setLoading(false); setLoadingMore(false); }
    });

    return () => { cancelled = true; };
  }, [page, debouncedSearch]);

  useEffect(() => {
    if (!loaderRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasMore && !loadingMore) setPage((p) => p + 1); },
      { threshold: 0.1 }
    );
    obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [hasMore, loadingMore]);

  return (
    <div className="animate-fade-in">
      {selected && <SeriesModal series={selected} onClose={() => setSelected(null)} />}

      <div className="p-4 md:p-6 space-y-5">
        {!search && <FeaturedHero onOpen={setSelected} />}

        <div className="flex items-center gap-3">
          <MdVideoLibrary className="text-gold text-2xl" />
          <h1 className="text-2xl font-bold">{t("series_title")}</h1>
        </div>

        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg" />
          <input
            type="search"
            placeholder={t("series_search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : series.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <MdVideoLibrary className="text-5xl mx-auto mb-3 opacity-30" />
            <p>{t("series_empty")}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {series.map((s) => (
                <SeriesCard key={s.id} series={s} onClick={() => setSelected(s)} />
              ))}
            </div>
            <div ref={loaderRef} className="py-4 flex justify-center">
              {loadingMore && (
                <div className="w-6 h-6 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
