import { useState, useEffect, useCallback } from "react";
import {
  getClips, incrementViews, toggleLike, isLiked, thumbUrl,
} from "../utils/store";
import {
  MdPlayArrow, MdFavorite, MdFavoriteBorder, MdShare,
  MdContentCopy, MdClose, MdVisibility, MdSearch,
  MdMusicNote, MdWhatsapp, MdNavigateBefore, MdNavigateNext,
} from "react-icons/md";

const CATEGORIES = ["Tout", "Musique Burkinabè", "Musique Africaine", "Gospel", "Comédie", "Contenu Mooré", "Documentaire", "Sport", "Événement"];
const SORT_OPTIONS = [
  { key: "views", label: "Plus vus" },
  { key: "recent", label: "Plus récents" },
  { key: "az", label: "A-Z" },
];

// ─── Clip Player Modal ────────────────────────────────────────────────────────

function ClipPlayerModal({ clip, allClips, onClose }) {
  const [liked, setLiked] = useState(isLiked(clip.id));
  const [currentClip, setCurrentClip] = useState(clip);
  const similar = allClips.filter((c) => c.id !== currentClip.id && (c.category === currentClip.category || c.artist === currentClip.artist)).slice(0, 6);

  useEffect(() => {
    incrementViews(currentClip.id);
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [currentClip.id]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleLike = () => {
    const nowLiked = toggleLike(currentClip.id);
    setLiked(nowLiked);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://youtube.com/watch?v=${currentClip.youtube_id}`);
  };

  const shareWA = () => {
    const msg = encodeURIComponent(`Regarde ce clip sur FASO TV 🎵 ${currentClip.title} - ${currentClip.artist} 👉 https://youtube.com/watch?v=${currentClip.youtube_id}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col overflow-y-auto" onClick={onClose}>
      <div className="max-w-3xl mx-auto w-full p-4" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MdMusicNote className="text-gold text-xl" />
            <span className="font-semibold">FASO TV Clips</span>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white p-2">
            <MdClose className="text-2xl" />
          </button>
        </div>

        {/* Player */}
        <div className="relative w-full aspect-video rounded-card overflow-hidden bg-black mb-4">
          <iframe
            src={`https://www.youtube.com/embed/${currentClip.youtube_id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={currentClip.title}
          />
          {currentClip.is_promoted && currentClip.promotion_badge && (
            <span className="absolute top-3 right-3 bg-black/70 text-purple-400 text-xs font-bold px-2 py-0.5 rounded-badge border border-purple-400/30">
              {currentClip.promotion_badge}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="space-y-3 mb-6">
          <div>
            <h2 className="text-xl font-black">{currentClip.title}</h2>
            <p className="text-white/60">{currentClip.artist} · {currentClip.category}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-white/50">
              <span className="flex items-center gap-1">
                <MdVisibility className="text-base" />
                {(currentClip.views_count || 0).toLocaleString()} vues
              </span>
              <span className="flex items-center gap-1">
                <MdFavorite className="text-live/60 text-base" />
                {(currentClip.likes_count || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-sm transition-all ${
                  liked ? "bg-live/20 text-live border border-live/30" : "border border-border text-white/60 hover:border-live/30 hover:text-live"
                }`}
              >
                {liked ? <MdFavorite /> : <MdFavoriteBorder />} Like
              </button>
              <button onClick={copyLink} className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-sm border border-border text-white/60 hover:border-white/20">
                <MdContentCopy className="text-sm" /> Copier
              </button>
              <button onClick={shareWA} className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-sm border border-border text-white/60 hover:border-green-500/30 hover:text-green-400">
                <MdWhatsapp /> WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Similar clips */}
        {similar.length > 0 && (
          <div>
            <p className="font-semibold mb-3 text-sm text-white/50 uppercase tracking-wider">Clips similaires</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {similar.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCurrentClip(c)}
                  className="group text-left"
                >
                  <div className="relative aspect-video rounded-btn overflow-hidden mb-2">
                    <img src={thumbUrl(c.youtube_id)} alt={c.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <MdPlayArrow className="text-3xl text-white" />
                    </div>
                  </div>
                  <p className="text-sm font-medium leading-tight truncate">{c.title}</p>
                  <p className="text-xs text-white/40 truncate">{c.artist}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Clip Card ────────────────────────────────────────────────────────────────

function ClipCard({ clip, onPlay }) {
  return (
    <div className="group cursor-pointer" onClick={() => onPlay(clip)}>
      <div className="relative aspect-video rounded-card overflow-hidden mb-2">
        <img
          src={thumbUrl(clip.youtube_id)}
          alt={clip.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => { e.target.src = ""; e.target.parentElement.style.background = "#161625"; }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gold/90 flex items-center justify-center">
            <MdPlayArrow className="text-black text-2xl ml-0.5" />
          </div>
        </div>
        {/* Duration */}
        {clip.duration && (
          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
            {clip.duration}
          </span>
        )}
        {/* Badge */}
        {clip.is_promoted && clip.promotion_badge && (
          <span className="absolute top-2 left-2 bg-purple-600/90 text-white text-xs font-bold px-2 py-0.5 rounded-badge">
            {clip.promotion_badge}
          </span>
        )}
      </div>
      <p className="font-medium text-sm leading-tight truncate group-hover:text-gold transition-colors">{clip.title}</p>
      <p className="text-white/50 text-xs truncate mt-0.5">{clip.artist}</p>
      <p className="text-white/30 text-xs mt-0.5 flex items-center gap-1">
        <MdVisibility className="text-sm" /> {(clip.views_count || 0).toLocaleString()}
      </p>
    </div>
  );
}

// ─── Horizontal Scroll Section ────────────────────────────────────────────────

function ScrollSection({ title, clips, onPlay }) {
  if (!clips.length) return null;
  return (
    <section>
      <h2 className="text-lg font-bold mb-3">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin">
        {clips.map((clip) => (
          <div key={clip.id} className="flex-shrink-0 w-44 md:w-52">
            <ClipCard clip={clip} onPlay={onPlay} />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Artists section ──────────────────────────────────────────────────────────

function ArtistsSection({ clips, onFilter }) {
  const artists = Object.entries(
    clips.reduce((acc, c) => { acc[c.artist] = (acc[c.artist] || 0) + 1; return acc; }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  if (!artists.length) return null;

  return (
    <section>
      <h2 className="text-lg font-bold mb-3">Artistes populaires</h2>
      <div className="flex gap-4 overflow-x-auto pb-3">
        {artists.map(([artist, count]) => {
          const clip = clips.find((c) => c.artist === artist);
          return (
            <button
              key={artist}
              onClick={() => onFilter(artist)}
              className="flex-shrink-0 flex flex-col items-center gap-2 group"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden bg-card border-2 border-border group-hover:border-gold transition-colors">
                {clip && (
                  <img
                    src={thumbUrl(clip.youtube_id)}
                    alt={artist}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                )}
              </div>
              <p className="text-xs text-center w-20 truncate group-hover:text-gold transition-colors">{artist}</p>
              <p className="text-xs text-white/30">{count} clip{count > 1 ? "s" : ""}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ─── BF Clips Hero ────────────────────────────────────────────────────────────

function BFClipsHero({ clips, onPlay }) {
  const [idx, setIdx] = useState(0);
  const bfClips = clips.filter((c) => c.category === "Musique Burkinabè");
  const clip = bfClips[idx % Math.max(1, bfClips.length)];

  useEffect(() => {
    if (bfClips.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % bfClips.length), 5000);
    return () => clearInterval(t);
  }, [bfClips.length]);

  if (!clip) return null;

  return (
    <div className="relative rounded-card overflow-hidden aspect-video md:aspect-[21/7] bg-black mb-2">
      <img src={thumbUrl(clip.youtube_id)} alt={clip.title} className="absolute inset-0 w-full h-full object-cover opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
      <div className="absolute top-3 left-4">
        <span className="bg-gold/90 text-black text-xs font-black px-2 py-1 rounded-badge">🇧🇫 Musique Burkinabè</span>
      </div>
      <div className="absolute bottom-0 left-0 p-5 md:p-8">
        <p className="text-white/60 text-sm mb-1">{clip.artist}</p>
        <h2 className="text-2xl md:text-3xl font-black mb-3">{clip.title}</h2>
        <button onClick={() => onPlay(clip)} className="btn-primary flex items-center gap-2">
          <MdPlayArrow className="text-xl" /> Regarder
        </button>
      </div>
      {bfClips.length > 1 && (
        <>
          <button onClick={() => setIdx((i) => (i - 1 + bfClips.length) % bfClips.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/80">
            <MdNavigateBefore className="text-xl" />
          </button>
          <button onClick={() => setIdx((i) => (i + 1) % bfClips.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/80">
            <MdNavigateNext className="text-xl" />
          </button>
          <div className="absolute bottom-4 right-4 flex gap-1">
            {bfClips.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === idx % bfClips.length ? "bg-gold w-4" : "bg-white/30"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection({ heroClips, onPlay }) {
  const [idx, setIdx] = useState(0);
  const clip = heroClips[idx];

  useEffect(() => {
    if (heroClips.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % heroClips.length), 6000);
    return () => clearInterval(t);
  }, [heroClips.length]);

  if (!clip) {
    return (
      <div className="relative rounded-card overflow-hidden bg-gradient-to-r from-[#0a0a1f] to-[#1a0a2e] p-8 md:p-12">
        <div className="flex items-center gap-2 mb-4">
          <MdMusicNote className="text-gold text-3xl" />
          <span className="text-gold font-black text-xl">FASO TV Clips</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black mb-3">Le meilleur de la<br />musique africaine</h1>
        <p className="text-white/50 text-lg">Clips, gospel, comédie et bien plus</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-card overflow-hidden aspect-video md:aspect-[21/7] bg-black">
      <img src={thumbUrl(clip.youtube_id)} alt={clip.title} className="absolute inset-0 w-full h-full object-cover opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

      {clip.is_promoted && (
        <span className="absolute top-4 right-4 bg-purple-600/80 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-badge">
          SPONSORISÉ
        </span>
      )}

      <div className="absolute bottom-0 left-0 p-5 md:p-8">
        <p className="text-white/60 text-sm mb-1">{clip.artist}</p>
        <h1 className="text-2xl md:text-4xl font-black mb-3 text-shadow">{clip.title}</h1>
        <button onClick={() => onPlay(clip)} className="btn-primary flex items-center gap-2">
          <MdPlayArrow className="text-xl" /> Regarder
        </button>
      </div>

      {heroClips.length > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-1">
          {heroClips.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === idx ? "bg-gold w-4" : "bg-white/30"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ClipsPage() {
  const [allClips, setAllClips] = useState([]);
  const [category, setCategory] = useState("Tout");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("views");
  const [artistFilter, setArtistFilter] = useState(null);
  const [playing, setPlaying] = useState(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  const refresh = useCallback(() => setAllClips(getClips()), []);
  useEffect(() => { refresh(); }, [refresh]);

  const filtered = allClips.filter((c) => {
    const matchCat = category === "Tout" || c.category === category;
    const matchSearch = !search || [c.title, c.artist].some((v) => v?.toLowerCase().includes(search.toLowerCase()));
    const matchArtist = !artistFilter || c.artist === artistFilter;
    return matchCat && matchSearch && matchArtist;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "views") return (b.views_count || 0) - (a.views_count || 0);
    if (sort === "recent") return new Date(b.added_at) - new Date(a.added_at);
    if (sort === "az") return a.title.localeCompare(b.title);
    return 0;
  });

  const heroClips = allClips.filter((c) => c.is_promoted && c.promotion_badge === "SPONSORISÉ");
  const trending = [...allClips].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 10);
  const newest = [...allClips].sort((a, b) => new Date(b.added_at) - new Date(a.added_at)).slice(0, 10);
  const paged = sorted.slice(0, page * PER_PAGE);
  const hasMore = paged.length < sorted.length;

  const handlePlay = (clip) => setPlaying(clip);
  const handleClose = useCallback(() => {
    setPlaying(null);
    refresh(); // refresh view counts
  }, [refresh]);

  return (
    <div className="animate-fade-in">
      {playing && <ClipPlayerModal clip={playing} allClips={allClips} onClose={handleClose} />}

      <div className="p-4 md:p-6 space-y-6">
        {/* Hero */}
        {category === "Musique Burkinabè" && !search && !artistFilter
          ? <BFClipsHero clips={allClips} onPlay={handlePlay} />
          : <HeroSection heroClips={heroClips} onPlay={handlePlay} />
        }

        {/* Category bar + search */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex gap-1.5 overflow-x-auto pb-1 flex-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setArtistFilter(null); setPage(1); }}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  category === cat && !artistFilter ? "bg-gold text-black" : "bg-card text-white/60 hover:text-white hover:bg-card-hover"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative flex-shrink-0 md:w-56">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Rechercher…"
              className="input pl-10 py-2"
            />
          </div>
        </div>

        {artistFilter && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/50">Artiste :</span>
            <span className="text-gold font-medium">{artistFilter}</span>
            <button onClick={() => setArtistFilter(null)} className="text-white/30 hover:text-white ml-1">
              <MdClose className="text-base" />
            </button>
          </div>
        )}

        {/* Trending */}
        {!search && !artistFilter && category === "Tout" && (
          <ScrollSection title="🔥 Tendances" clips={trending} onPlay={handlePlay} />
        )}

        {/* Newest */}
        {!search && !artistFilter && category === "Tout" && (
          <ScrollSection title="✨ Nouveautés" clips={newest} onPlay={handlePlay} />
        )}

        {/* Artists */}
        {!search && !artistFilter && category === "Tout" && (
          <ArtistsSection clips={allClips} onFilter={(artist) => { setArtistFilter(artist); setPage(1); }} />
        )}

        {/* All clips grid */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">
              {artistFilter ? `${artistFilter}` : category === "Tout" ? "Tous les clips" : category}
              <span className="text-white/30 text-sm font-normal ml-2">({sorted.length})</span>
            </h2>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-card border border-border rounded-btn px-3 py-1.5 text-sm text-white"
            >
              {SORT_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </div>

          {paged.length === 0 ? (
            <div className="text-center py-16 text-white/30">
              <MdMusicNote className="text-5xl mx-auto mb-3 opacity-30" />
              <p>Aucun clip trouvé</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {paged.map((clip) => <ClipCard key={clip.id} clip={clip} onPlay={handlePlay} />)}
              </div>
              {hasMore && (
                <div className="text-center mt-6">
                  <button onClick={() => setPage((p) => p + 1)} className="btn-outline px-8">
                    Voir plus
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
