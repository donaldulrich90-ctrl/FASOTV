import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePaginatedChannels } from "../hooks/useChannels";
import { MdSearch, MdLiveTv, MdFavorite, MdFavoriteBorder, MdPeople } from "react-icons/md";
import api from "../services/api";
import toast from "react-hot-toast";

function SkeletonCard() {
  return <div className="card p-3 h-20 animate-pulse bg-card/60" />;
}

function CategoryFilter({ categories, active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
      <button
        onClick={() => onChange(null)}
        className={`flex-shrink-0 px-4 py-1.5 rounded-badge text-sm font-medium transition-all ${
          active === null ? "bg-gold text-black" : "bg-card text-white/60 hover:text-white"
        }`}
      >
        Tous
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`flex-shrink-0 px-4 py-1.5 rounded-badge text-sm font-medium transition-all ${
            active === cat.id ? "bg-gold text-black" : "bg-card text-white/60 hover:text-white"
          }`}
        >
          {cat.name}
          <span className="ml-1 text-xs opacity-60">({cat.channel_count || 0})</span>
        </button>
      ))}
    </div>
  );
}

function ChannelCard({ channel, onPlay, onFav, isFav }) {
  return (
    <div className="card p-3 flex items-center gap-3 group cursor-pointer" onClick={onPlay}>
      <div className="w-12 h-12 rounded-btn bg-bg flex items-center justify-center flex-shrink-0 overflow-hidden">
        {channel.logo_url ? (
          <img src={channel.logo_url} alt={channel.name} className="w-full h-full object-contain" />
        ) : (
          <MdLiveTv className="text-gold text-xl" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate group-hover:text-gold transition-colors">{channel.name}</p>
        <p className="text-xs text-white/40 truncate">{channel.category_name || "Général"}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="badge-live text-[10px]">LIVE</span>
          {channel.viewers_count > 0 && (
            <span className="text-[10px] text-white/30 flex items-center gap-0.5">
              <MdPeople className="text-xs" />
              {channel.viewers_count}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onFav(); }}
        className={`p-2 rounded-btn transition-colors ${isFav ? "text-gold" : "text-white/30 hover:text-white/60"}`}
      >
        {isFav ? <MdFavorite /> : <MdFavoriteBorder />}
      </button>
    </div>
  );
}

export default function LiveTVPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const loaderRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/channels/categories/").then((r) => setCategories(r.data.results || r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { items: channels, loading, loadingMore, hasMore, loadMore } = usePaginatedChannels(debouncedSearch, activeCategory);

  useEffect(() => {
    if (!loaderRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasMore && !loadingMore) loadMore(); },
      { threshold: 0.1 }
    );
    obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [hasMore, loadingMore, loadMore]);

  const toggleFav = async (channel) => {
    try {
      const { data } = await api.post("/vod/favorites/toggle/", {
        content_type: "channel",
        object_id: channel.id,
      });
      setFavorites((prev) => {
        const next = new Set(prev);
        data.favorited ? next.add(channel.id) : next.delete(channel.id);
        return next;
      });
      toast.success(data.favorited ? "Ajouté aux favoris" : "Retiré des favoris");
    } catch {
      toast.error("Erreur");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <MdLiveTv className="text-gold text-2xl flex-shrink-0" />
        <h1 className="text-2xl font-bold">Live TV</h1>
        <span className="badge-live ml-auto">{loading ? "…" : `${channels.length}+ chaînes`}</span>
      </div>

      <div className="relative">
        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg" />
        <input
          type="search"
          placeholder="Rechercher une chaîne…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10"
        />
      </div>

      <CategoryFilter categories={categories} active={activeCategory} onChange={setActiveCategory} />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : channels.length === 0 ? (
        <div className="text-center py-16 text-white/40">
          <MdLiveTv className="text-5xl mx-auto mb-3" />
          <p>Aucune chaîne trouvée</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {channels.map((ch) => (
              <ChannelCard
                key={ch.id}
                channel={ch}
                onPlay={() => navigate(`/player/live/${ch.id}`)}
                onFav={() => toggleFav(ch)}
                isFav={favorites.has(ch.id)}
              />
            ))}
          </div>
          <div ref={loaderRef} className="py-4 text-center text-white/30 text-sm">
            {loadingMore && (
              <div className="w-6 h-6 border-2 border-gold/20 border-t-gold rounded-full animate-spin mx-auto" />
            )}
          </div>
        </>
      )}
    </div>
  );
}
