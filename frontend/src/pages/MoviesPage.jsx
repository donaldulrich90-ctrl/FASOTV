import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getMovies, isFavorite, addFavorite, removeFavorite, getVideoUrl } from "../utils/store";
import useTranslation from "../hooks/useTranslation";
import {
  MdSearch, MdMovie, MdStar, MdPlayArrow, MdClose,
  MdNavigateBefore, MdNavigateNext, MdFavorite, MdFavoriteBorder,
  MdWhatsapp, MdFolder,
} from "react-icons/md";

const CATEGORIES = ["movies_tous", "movies_bf", "movies_africains", "movies_docs"];
const CAT_KEYS = { movies_tous: null, movies_bf: "Films Burkinabés", movies_africains: "Films Africains", movies_docs: "Documentaires" };
const GENRES = ["Action", "Drame", "Comédie", "Thriller", "Fantastique", "Documentaire", "Animation"];
const SOURCES = [
  { value: "", label: "Toutes sources" },
  { value: "xtream", label: "IPTV (Xtream)" },
  { value: "local", label: "📁 Local" },
  { value: "youtube", label: "YouTube" },
];

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
        {movie.is_burkinabe && (
          <div className="absolute bottom-2 left-2 bg-black/70 text-[10px] px-1.5 py-0.5 rounded-badge font-bold" style={{ color: "#F7B32B" }}>
            🇧🇫
          </div>
        )}
        {movie.source === "local" && (
          <div className="absolute bottom-2 right-2 bg-purple-900/80 text-purple-300 text-[10px] px-1.5 py-0.5 rounded-badge flex items-center gap-0.5">
            <MdFolder className="text-[10px]" /> Local
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

// ─── BF Hero Slider ───────────────────────────────────────────────────────────

function BFHeroSlider({ movies, onPlay }) {
  const { t } = useTranslation();
  const [idx, setIdx] = useState(0);
  const featured = movies.filter((m) => m.is_featured && m.is_burkinabe);
  const movie = featured[idx];

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => setIdx((i) => (i + 1) % featured.length), 5000);
    return () => clearInterval(timer);
  }, [featured.length]);

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
      <div className="absolute top-3 left-4 flex items-center gap-2">
        <span className="bg-gold/90 text-black text-xs font-black px-2 py-1 rounded-badge">🇧🇫 {t("movies_bf")}</span>
      </div>
      <div className="absolute bottom-0 left-0 p-5 md:p-8 max-w-lg">
        <p className="text-white/60 text-sm mb-1">{movie.genre} · {movie.year}</p>
        <h2 className="text-2xl md:text-3xl font-black mb-2">{movie.title}</h2>
        <p className="text-white/60 text-sm mb-4 line-clamp-2 hidden md:block">{movie.description}</p>
        <button onClick={() => onPlay(movie)} className="btn-primary flex items-center gap-2">
          <MdPlayArrow className="text-xl" /> {t("btn_regarder")}
        </button>
      </div>
      {featured.length > 1 && (
        <>
          <button onClick={() => setIdx((i) => (i - 1 + featured.length) % featured.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/80">
            <MdNavigateBefore className="text-xl" />
          </button>
          <button onClick={() => setIdx((i) => (i + 1) % featured.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/80">
            <MdNavigateNext className="text-xl" />
          </button>
          <div className="absolute bottom-4 right-4 flex gap-1">
            {featured.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === idx ? "bg-gold w-4" : "bg-white/30"}`} />
            ))}
          </div>
        </>
      )}
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
            src={getVideoUrl(movie)}
            controls
            autoPlay
            className="w-full h-full"
            onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
          />
          <div className="hidden absolute inset-0 flex-col items-center justify-center text-white/40">
            <MdMovie className="text-5xl mb-3" />
            <p>Flux vidéo non disponible en démo</p>
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
        {movie.is_burkinabe && movie.description_en && (
          <p className="text-white/30 text-xs mt-1 leading-relaxed italic">🇬🇧 {movie.description_en}</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MoviesPage() {
  const { t } = useTranslation();
  const [allMovies, setAllMovies] = useState([]);
  const [catKey, setCatKey] = useState("movies_tous");
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [playing, setPlaying] = useState(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;
  const navigate = useNavigate();

  const refresh = useCallback(() => setAllMovies(getMovies()), []);
  useEffect(() => { refresh(); }, [refresh]);

  const catFilter = CAT_KEYS[catKey];
  const filtered = allMovies.filter((m) => {
    const matchCat = catFilter === null || m.category === catFilter;
    const matchGenre = !genre || m.genre === genre;
    const matchSearch = !search || [m.title, m.genre, m.category].some((v) => v?.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchGenre && matchSearch;
  });

  const paged = filtered.slice(0, page * PER_PAGE);
  const hasMore = paged.length < filtered.length;
  const bfMovies = allMovies.filter((m) => m.is_burkinabe);

  const handlePlay = (movie) => setPlaying(movie);

  return (
    <div className="animate-fade-in">
      {playing && <MovieModal movie={playing} onClose={() => setPlaying(null)} />}

      <div className="p-4 md:p-6 space-y-5">
        {/* BF Hero (visible only on Tous & BF tabs) */}
        {(catKey === "movies_tous" || catKey === "movies_bf") && !search && (
          <BFHeroSlider movies={bfMovies} onPlay={handlePlay} />
        )}

        {/* Header */}
        <div className="flex items-center gap-3">
          <MdMovie className="text-gold text-2xl" />
          <h1 className="text-2xl font-bold">{t("movies_title")}</h1>
          <span className="ml-auto text-white/40 text-sm">{filtered.length} films</span>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map((key) => (
            <button
              key={key}
              onClick={() => { setCatKey(key); setPage(1); setGenre(""); }}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                catKey === key ? "bg-gold text-black font-bold" : "bg-card text-white/60 hover:text-white"
              }`}
            >
              {t(key)}
            </button>
          ))}
        </div>

        {/* Search + Genre */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg" />
            <input
              type="search"
              placeholder={t("movies_search")}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input pl-10"
            />
          </div>
          <select
            value={genre}
            onChange={(e) => { setGenre(e.target.value); setPage(1); }}
            className="input sm:w-40"
          >
            <option value="">{t("movies_genre")}</option>
            {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          {(genre || search) && (
            <button
              onClick={() => { setGenre(""); setSearch(""); setPage(1); }}
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
              onClick={() => { setGenre(g === genre ? "" : g); setPage(1); }}
              className={`flex-shrink-0 px-3 py-1 rounded-badge text-sm transition-all ${
                genre === g ? "bg-gold text-black font-semibold" : "bg-card text-white/60 hover:text-white"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Grid */}
        {paged.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <MdMovie className="text-5xl mx-auto mb-3 opacity-30" />
            <p>{t("movies_empty")}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {paged.map((m) => (
                <MovieCard key={m.id} movie={m} onClick={() => handlePlay(m)} />
              ))}
            </div>
            {hasMore && (
              <div className="text-center mt-4">
                <button onClick={() => setPage((p) => p + 1)} className="btn-outline px-8">
                  {t("btn_charger_plus")}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
