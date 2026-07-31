import { useState, useEffect, useRef, useCallback } from "react";
import { setFocus } from "@noriginmedia/norigin-spatial-navigation";
import { isFavorite, addFavorite, removeFavorite } from "../utils/store";
import useTranslation from "../hooks/useTranslation";
import { useLanguages, useGenres } from "../hooks/useCatalog";
import api from "../services/api";
import VideoPlayer from "../components/VideoPlayer";
import { FocusableItem, FocusableSection } from "../components/Focusable";
import {
  MdSearch, MdMovie, MdStar, MdPlayArrow, MdClose,
  MdFavorite, MdFavoriteBorder, MdWhatsapp,
} from "react-icons/md";

const SORT_OPTIONS = ["recent", "year", "alpha", "rating"];
const QUICK_TABS = [
  { label: "✨ Nouveautés", params: { sort: "recent" } },
  { label: "🎬 2026",       params: { year: 2026 } },
  { label: "🎥 2025",       params: { year: 2025 } },
  { label: "🌍 Afrique",    params: { lang: "AF" } },
  { label: "🇳🇬 Nollywood", params: { lang: "AF", genre: "nollywood" } },
];

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

// ─── Movie Card ───────────────────────────────────────────────────────────────

function MovieCard({ movie, onClick, focusKey }) {
  return (
    <FocusableItem
      onClick={onClick}
      onEnterPress={onClick}
      focusKey={focusKey}
      focusClass="ring-4 ring-gold scale-105 z-10 shadow-xl shadow-gold/30 rounded-card"
      className="group text-left w-full cursor-pointer"
    >
      <div className="aspect-[2/3] rounded-card overflow-hidden bg-card relative">
        {movie.poster_url ? (
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MdMovie className="text-white/20 text-4xl" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
          <div className="flex items-center gap-1.5 text-gold">
            <MdPlayArrow className="text-2xl" />
            <span className="text-sm font-semibold">Regarder</span>
          </div>
        </div>
        {movie.rating && (
          <div className="absolute top-2 right-2 bg-black/70 rounded-badge px-1.5 py-0.5 text-xs text-gold flex items-center gap-0.5">
            <MdStar className="text-[10px]" />
            {movie.rating}
          </div>
        )}
        {movie.is_featured && (
          <div className="absolute top-2 left-2 bg-gold/90 rounded-badge px-1.5 py-0.5 text-[10px] font-bold text-black">
            À LA UNE
          </div>
        )}
      </div>
      <p className="text-sm font-medium mt-2 truncate group-hover:text-gold transition-colors">{movie.title}</p>
      <div className="flex items-center gap-1.5 text-xs text-white/40 mt-0.5">
        {movie.genre && <span className="truncate max-w-[80px]">{movie.genre}</span>}
        {movie.year && <><span>·</span><span>{movie.year}</span></>}
        {movie.duration && <><span>·</span><span>{movie.duration}min</span></>}
      </div>
    </FocusableItem>
  );
}

// ─── Featured Hero ────────────────────────────────────────────────────────────

function FeaturedHero({ onPlay }) {
  const { t } = useTranslation();
  const [featured, setFeatured] = useState([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    api.get("/vod/movies/", { params: { is_featured: true, page_size: 5 } })
      .then((r) => setFeatured(r.data.results || r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => setIdx((i) => (i + 1) % featured.length), 5000);
    return () => clearInterval(timer);
  }, [featured.length]);

  const movie = featured[idx];
  if (!movie) return null;

  return (
    <div className="relative rounded-card overflow-hidden aspect-[21/8] bg-black mb-6">
      <img
        src={movie.poster_url}
        alt={movie.title}
        className="absolute inset-0 w-full h-full object-cover opacity-50"
        onError={(e) => { e.target.style.display = "none"; }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
      <div className="absolute bottom-0 left-0 p-5 md:p-8 max-w-lg">
        <p className="text-white/60 text-sm mb-1">{movie.genre} · {movie.year}</p>
        <h2 className="text-2xl md:text-3xl font-black mb-2">{movie.title}</h2>
        <p className="text-white/60 text-sm mb-4 line-clamp-2 hidden md:block">{movie.description}</p>
        <button onClick={() => onPlay(movie)} className="btn-primary flex items-center gap-2">
          <MdPlayArrow className="text-xl" /> {t("btn_regarder")}
        </button>
      </div>
    </div>
  );
}

// ─── Movie Modal Player ───────────────────────────────────────────────────────

function MovieModal({ movie, onClose }) {
  const { t } = useTranslation();
  const [fav, setFav] = useState(isFavorite(movie.id, "movie"));

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const h = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", h); };
  }, [onClose]);

  const toggleFav = () => {
    if (fav) removeFavorite(movie.id, "movie");
    else addFavorite({ id: movie.id, type: "movie", title: movie.title, poster_url: movie.poster_url });
    setFav(!fav);
  };

  const shareWA = () => {
    const text = encodeURIComponent(`🎬 ${movie.title} (${movie.year}) — à voir sur FASO TV\n${movie.description || ""}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-black text-xl">{movie.title}</h2>
            <p className="text-white/50 text-sm">{movie.genre} · {movie.year} · {movie.duration}min</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white p-2"><MdClose className="text-2xl" /></button>
        </div>
        <VideoPlayer src={movie.stream_url} title={movie.title} />
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={toggleFav}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-sm transition-all ${fav ? "bg-live/20 text-live border border-live/30" : "border border-border text-white/60 hover:border-live/30 hover:text-live"}`}
          >
            {fav ? <MdFavorite /> : <MdFavoriteBorder />}
            {fav ? "Favori ✓" : "Ajouter favori"}
          </button>
          <button
            onClick={shareWA}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-sm border border-border text-white/60 hover:border-green-500/30 hover:text-green-400 transition-colors"
          >
            <MdWhatsapp /> {t("btn_whatsapp")}
          </button>
        </div>
        {movie.description && (
          <p className="text-white/60 text-sm mt-3 leading-relaxed">{movie.description}</p>
        )}
      </div>
    </div>
  );
}

// ─── Pill row ─────────────────────────────────────────────────────────────────

function PillRow({ items, active, onSelect, getKey, getLabel, getCount }) {
  return (
    <FocusableSection className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
      <FocusableItem
        onClick={() => onSelect(null)}
        onEnterPress={() => onSelect(null)}
        className={`flex-shrink-0 px-3 py-1 rounded-badge text-sm transition-all cursor-pointer ${
          active === null ? "bg-gold text-black font-semibold" : "bg-card text-white/60 hover:text-white"
        }`}
        focusClass="ring-2 ring-gold"
      >
        Tous
      </FocusableItem>
      {items.map((item) => (
        <FocusableItem
          key={getKey(item)}
          onClick={() => onSelect(getKey(item) === active ? null : getKey(item))}
          onEnterPress={() => onSelect(getKey(item) === active ? null : getKey(item))}
          className={`flex-shrink-0 px-3 py-1 rounded-badge text-sm transition-all cursor-pointer ${
            getKey(item) === active ? "bg-gold text-black font-semibold" : "bg-card text-white/60 hover:text-white"
          }`}
          focusClass="ring-2 ring-gold"
        >
          {getLabel(item)}
          {getCount && <span className="ml-1 text-xs opacity-60">({getCount(item)})</span>}
        </FocusableItem>
      ))}
    </FocusableSection>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MoviesPage() {
  const { t } = useTranslation();
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeLang, setActiveLang] = useState(null);
  const [activeGenre, setActiveGenre] = useState(null);
  const [activeYear, setActiveYear] = useState(null);
  const [sort, setSort] = useState("recent");
  const [playing, setPlaying] = useState(null);
  const loaderRef = useRef(null);

  const { languages } = useLanguages("vod");
  const { genres } = useGenres("vod", activeLang);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setMovies([]);
    setPage(1);
    setHasMore(false);
  }, [debouncedSearch, activeLang, activeGenre, activeYear, sort]);

  useEffect(() => {
    let cancelled = false;
    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    const params = { page, sort };
    if (debouncedSearch) params.search = debouncedSearch;
    if (activeLang) params.lang = activeLang;
    if (activeGenre) params.genre = activeGenre;
    if (activeYear) params.year = activeYear;

    api.get("/vod/movies/", { params }).then((r) => {
      if (cancelled) return;
      const results = r.data.results || [];
      setMovies((prev) => (page === 1 ? results : [...prev, ...results]));
      setHasMore(!!r.data.next);
    }).catch(() => {}).finally(() => {
      if (!cancelled) { setLoading(false); setLoadingMore(false); }
    });

    return () => { cancelled = true; };
  }, [page, debouncedSearch, activeLang, activeGenre, activeYear, sort]);

  // Initial TV focus on first card
  const initialFocusDone = useRef(false);
  useEffect(() => {
    if (!loading && movies.length > 0 && !initialFocusDone.current) {
      initialFocusDone.current = true;
      requestAnimationFrame(() => setFocus('movies-card-0'));
    }
  }, [loading, movies.length]);

  // Infinite scroll
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
    setActiveYear(null);
    setSort("recent");
  };

  const hasFilters = search || activeLang || activeGenre || activeYear || sort !== "recent";

  return (
    <div className="animate-fade-in">
      {playing && <MovieModal movie={playing} onClose={() => setPlaying(null)} />}

      <div className="p-4 md:p-6 space-y-4">
        {!search && !activeLang && !activeGenre && <FeaturedHero onPlay={setPlaying} />}

        <div className="flex items-center gap-3">
          <MdMovie className="text-gold text-2xl" />
          <h1 className="text-2xl font-bold">{t("movies_title")}</h1>
        </div>

        {/* Quick tabs */}
        <FocusableSection className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {QUICK_TABS.map((tab) => (
            <FocusableItem
              key={tab.label}
              onClick={() => {
                setSearch("");
                setActiveLang(tab.params.lang || null);
                setActiveGenre(tab.params.genre || null);
                setActiveYear(tab.params.year || null);
                if (tab.params.sort) setSort(tab.params.sort);
              }}
              onEnterPress={() => {
                setSearch("");
                setActiveLang(tab.params.lang || null);
                setActiveGenre(tab.params.genre || null);
                setActiveYear(tab.params.year || null);
                if (tab.params.sort) setSort(tab.params.sort);
              }}
              className="flex-shrink-0 px-3 py-1.5 rounded-badge text-sm bg-card text-white/60 hover:text-white hover:bg-card/80 transition-all cursor-pointer"
              focusClass="ring-2 ring-gold"
            >
              {tab.label}
            </FocusableItem>
          ))}
        </FocusableSection>

        {/* Sort bar */}
        <FocusableSection className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {SORT_OPTIONS.map((s) => (
            <FocusableItem
              key={s}
              onClick={() => setSort(s)}
              onEnterPress={() => setSort(s)}
              className={`flex-shrink-0 px-3 py-1 rounded-badge text-sm transition-all cursor-pointer ${
                sort === s ? "bg-gold/20 text-gold border border-gold/30 font-semibold" : "text-white/50 hover:text-white"
              }`}
              focusClass="ring-2 ring-gold"
            >
              {t(`sort_${s}`)}
            </FocusableItem>
          ))}
        </FocusableSection>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg" />
            <input
              type="search"
              placeholder={t("movies_search")}
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

        {/* Language pills (niveau 1) */}
        {languages.length > 0 && (
          <PillRow
            items={languages}
            active={activeLang}
            onSelect={(code) => { setActiveLang(code); setActiveGenre(null); setActiveYear(null); }}
            getKey={(l) => l.code}
            getLabel={(l) => l.label}
            getCount={(l) => l.count}
          />
        )}

        {/* Genre pills (niveau 2) */}
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

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <MdMovie className="text-5xl mx-auto mb-3 opacity-30" />
            <p>{t("movies_empty")}</p>
          </div>
        ) : (
          <>
            <FocusableSection className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {movies.map((m, i) => (
                <MovieCard key={m.id} movie={m} onClick={() => setPlaying(m)} focusKey={`movies-card-${i}`} />
              ))}
            </FocusableSection>
            <div ref={loaderRef} className="py-4 flex justify-center">
              {loadingMore && (
                <div className="w-6 h-6 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
              )}
              {!hasMore && movies.length > 0 && (
                <p className="text-white/20 text-xs">{t("load_more_end")}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
