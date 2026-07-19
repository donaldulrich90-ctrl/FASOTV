import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useChannels } from "../hooks/useChannels";
import { MdSearch, MdLiveTv, MdFavorite, MdFavoriteBorder, MdPeople } from "react-icons/md";
import api from "../services/api";
import toast from "react-hot-toast";

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
  const { channels, categories, loading } = useChannels();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    let list = channels;
    if (activeCategory) list = list.filter((c) => c.category_id === activeCategory);
    if (search.trim()) list = list.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [channels, activeCategory, search]);

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
      {/* Header */}
      <div className="flex items-center gap-3">
        <MdLiveTv className="text-gold text-2xl flex-shrink-0" />
        <h1 className="text-2xl font-bold">Live TV</h1>
        <span className="badge-live ml-auto">{filtered.length} chaînes</span>
      </div>

      {/* Search */}
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

      {/* Category filter */}
      <CategoryFilter categories={categories} active={activeCategory} onChange={setActiveCategory} />

      {/* Channel grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="card p-3 h-20 animate-pulse bg-card" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/40">
          <MdLiveTv className="text-5xl mx-auto mb-3" />
          <p>Aucune chaîne trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((ch) => (
            <ChannelCard
              key={ch.id}
              channel={ch}
              onPlay={() => navigate(`/player/live/${ch.id}`)}
              onFav={() => toggleFav(ch)}
              isFav={favorites.has(ch.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
