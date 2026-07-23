import { useState, useEffect, useRef, useCallback } from "react";
import { isFavorite, addFavorite, removeFavorite } from "../utils/store";
import useTranslation from "../hooks/useTranslation";
import api from "../services/api";
import {
  MdSearch, MdMovie, MdStar, MdPlayArrow, MdClose,
  MdFavorite, MdFavoriteBorder, MdWhatsapp,
} from "react-icons/md";

const GENRES = ["Action", "Drame", "Comédie", "Thriller", "Fantastique", "Documentaire", "Animation"];

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

function MovieCard({ movie, onClick }) {
  return (
    <button onClick={onClick} className="group text-left w-full">
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
        {movie.genre && <span>{movie.genre}</span>}
        {movie.year && <><span>·</span><span>{movie.year}</span></>}
        {movie.duration && <><span>·</span><span>{movie.duration}min</span></>}
      </div>
    </button>
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
        <div className="relative w-full aspect-video bg-black rounded-card overflow-hidden">
          <video
            src={movie.stream_url}
            controls
            autoPlay
            className="w-full h-full"
            onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
          />
          <div className="hidden absolute inset-0 flex-col items-center justify-center text-white/40">
            <MdMovie className="text-5xl mb-3" />
            <p>Flux vidéo non disponible</p>
          </div>
        </div>
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
  const [genre, setGenre] = useState("");
  const [playing, setPlaying] = useState(null);
  const loaderRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset on filter change
  useEffect(() => {
    setMovies([]);
    setPage(1);
    setHasMore(false);
  }, [debouncedSearch, genre]);

  useEffect(() => {
    let cancelled = false;
    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    const params = { page };
    if (debouncedSearch) params.search = debouncedSearch;
    if (genre) params.genre = genre;

    api.get("/vod/movies/", { params }).then((r) => {
      if (cancelled) return;
      const results = r.data.results || [];
      setMovies((prev) => (page === 1 ? results : [...prev, ...results]));
      setHasMore(!!r.data.next);
    }).catch(() => {}).finally(() => {
      if (!cancelled) { setLoading(false); setLoadingMore(false); }
    });

    return () => { cancelled = true; };
  }, [page, debouncedSearch, genre]);

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
      {playing && <MovieModal movie={playing} onClose={() => setPlaying(null)} />}

      <div className="p-4 md:p-6 space-y-5">
        {!search && !genre && <FeaturedHero onPlay={setPlaying} />}

        <div className="flex items-center gap-3">
          <MdMovie className="text-gold text-2xl" />
          <h1 className="text-2xl font-bold">{t("movies_title")}</h1>
        </div>

        {/* Search + Genre */}
        <div className="flex flex-col sm:flex-row gap-2">
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
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="input sm:w-40"
          >
            <option value="">{t("movies_genre")}</option>
            {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          {(genre || search) && (
            <button
              onClick={() => { setGenre(""); setSearch(""); }}
              className="btn-outline flex items-center gap-1 text-sm px-3"
            >
              <MdClose className="text-sm" /> Réinitialiser
            </button>
          )}
        </div>

        {/* Genre pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g === genre ? "" : g)}
              className={`flex-shrink-0 px-3 py-1 rounded-badge text-sm transition-all ${
                genre === g ? "bg-gold text-black font-semibold" : "bg-card text-white/60 hover:text-white"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {movies.map((m) => (
                <MovieCard key={m.id} movie={m} onClick={() => setPlaying(m)} />
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
