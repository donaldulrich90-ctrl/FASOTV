import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getSeries, isFavorite, addFavorite, removeFavorite } from "../utils/store";
import useTranslation from "../hooks/useTranslation";
import {
  MdSearch, MdVideoLibrary, MdStar, MdPlayArrow,
  MdNavigateBefore, MdNavigateNext, MdClose,
  MdFavorite, MdFavoriteBorder, MdWhatsapp,
} from "react-icons/md";

const CATEGORIES = ["series_tous", "series_bf", "series_africaines", "series_docs"];
const CAT_KEYS = { series_tous: null, series_bf: "Séries Burkinabées", series_africaines: "Séries Africaines", series_docs: "Documentaires" };

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
        {series.is_burkinabe && (
          <div className="absolute top-2 left-2 bg-black/70 text-[10px] px-1.5 py-0.5 rounded-badge font-bold text-gold">
            🇧🇫
          </div>
        )}
      </div>
      <p className="text-sm font-medium mt-2 truncate group-hover:text-gold transition-colors">{series.title}</p>
      <p className="text-xs text-white/40">{series.genre} · {series.year}</p>
    </button>
  );
}

// ─── BF Hero Slider ───────────────────────────────────────────────────────────

function BFHeroSlider({ series, onPlay }) {
  const { t } = useTranslation();
  const [idx, setIdx] = useState(0);
  const featured = series.filter((s) => s.is_featured && s.is_burkinabe);
  const item = featured[idx];

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => setIdx((i) => (i + 1) % featured.length), 5000);
    return () => clearInterval(timer);
  }, [featured.length]);

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
      <div className="absolute top-3 left-4">
        <span className="bg-gold/90 text-black text-xs font-black px-2 py-1 rounded-badge">🇧🇫 {t("series_bf")}</span>
      </div>
      <div className="absolute bottom-0 left-0 p-5 md:p-8 max-w-lg">
        <p className="text-white/60 text-sm mb-1">{item.genre} · {item.year} · {item.total_seasons} saison(s)</p>
        <h2 className="text-2xl md:text-3xl font-black mb-2">{item.title}</h2>
        <p className="text-white/60 text-sm mb-4 line-clamp-2 hidden md:block">{item.description}</p>
        <button onClick={() => onPlay(item)} className="btn-primary flex items-center gap-2">
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

// ─── Series Modal Player ──────────────────────────────────────────────────────

function SeriesModal({ series, onClose }) {
  const { t } = useTranslation();
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
    const text = encodeURIComponent(`📺 ${series.title} (${series.year}) — à voir sur FASO TV\n${series.description || ""}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-black text-xl">{series.title}</h2>
            <p className="text-white/50 text-sm">{series.genre} · {series.year} · {series.total_seasons} saison(s) · {series.total_episodes} épisode(s)</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white p-2"><MdClose className="text-2xl" /></button>
        </div>
        <div className="relative w-full aspect-video bg-black rounded-card overflow-hidden">
          <video
            src={series.stream_url}
            controls
            autoPlay
            className="w-full h-full"
            onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
          />
          <div className="hidden absolute inset-0 flex-col items-center justify-center text-white/40">
            <MdVideoLibrary className="text-5xl mb-3" />
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
        {series.description && (
          <p className="text-white/60 text-sm mt-3 leading-relaxed">{series.description}</p>
        )}
        {series.is_burkinabe && series.description_en && (
          <p className="text-white/30 text-xs mt-1 leading-relaxed italic">🇬🇧 {series.description_en}</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SeriesPage() {
  const { t } = useTranslation();
  const [allSeries, setAllSeries] = useState([]);
  const [catKey, setCatKey] = useState("series_tous");
  const [search, setSearch] = useState("");
  const [playing, setPlaying] = useState(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;
  const navigate = useNavigate();

  const refresh = useCallback(() => setAllSeries(getSeries()), []);
  useEffect(() => { refresh(); }, [refresh]);

  const catFilter = CAT_KEYS[catKey];
  const filtered = allSeries.filter((s) => {
    const matchCat = catFilter === null || s.category === catFilter;
    const matchSearch = !search || [s.title, s.genre, s.category].some((v) => v?.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const paged = filtered.slice(0, page * PER_PAGE);
  const hasMore = paged.length < filtered.length;
  const bfSeries = allSeries.filter((s) => s.is_burkinabe);

  return (
    <div className="animate-fade-in">
      {playing && <SeriesModal series={playing} onClose={() => setPlaying(null)} />}

      <div className="p-4 md:p-6 space-y-5">
        {/* BF Hero */}
        {(catKey === "series_tous" || catKey === "series_bf") && !search && (
          <BFHeroSlider series={bfSeries} onPlay={setPlaying} />
        )}

        {/* Header */}
        <div className="flex items-center gap-3">
          <MdVideoLibrary className="text-gold text-2xl" />
          <h1 className="text-2xl font-bold">{t("series_title")}</h1>
          <span className="ml-auto text-white/40 text-sm">{filtered.length} séries</span>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map((key) => (
            <button
              key={key}
              onClick={() => { setCatKey(key); setPage(1); }}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                catKey === key ? "bg-gold text-black font-bold" : "bg-card text-white/60 hover:text-white"
              }`}
            >
              {t(key)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg" />
          <input
            type="search"
            placeholder={t("series_search")}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input pl-10"
          />
        </div>

        {/* Grid */}
        {paged.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <MdVideoLibrary className="text-5xl mx-auto mb-3 opacity-30" />
            <p>{t("series_empty")}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {paged.map((s) => (
                <SeriesCard key={s.id} series={s} onClick={() => { if (s.is_burkinabe) setPlaying(s); else navigate(`/series/${s.id}`); }} />
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
