import { useState, useEffect, useRef } from "react";
import { MdRadio, MdSearch, MdPlayArrow, MdPause, MdStop } from "react-icons/md";
import api from "../services/api";
import { useRadioPlayer } from "../context/RadioPlayerContext";
import useTranslation from "../hooks/useTranslation";

function SkeletonCard() {
  return (
    <div className="card p-4 flex items-center gap-3 animate-pulse">
      <div className="w-12 h-12 rounded-full bg-card/60 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-card/60 rounded w-2/3" />
        <div className="h-2 bg-card/40 rounded w-1/3" />
      </div>
    </div>
  );
}

function StationCard({ channel }) {
  const { station, playing, play, toggle } = useRadioPlayer();
  const isActive = station?.id === channel.id;

  return (
    <button
      onClick={() => (isActive ? toggle() : play(channel))}
      className={`card p-4 flex items-center gap-3 transition-all w-full text-left ${
        isActive ? "border-gold/40 bg-gold/5" : "hover:border-white/20"
      }`}
    >
      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-bg flex items-center justify-center">
        {channel.logo_url ? (
          <img src={channel.logo_url} alt={channel.name} className="w-full h-full object-contain" onError={(e) => { e.target.style.display = "none"; }} />
        ) : (
          <MdRadio className={`text-2xl ${isActive ? "text-gold" : "text-white/30"}`} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm truncate ${isActive ? "text-gold" : ""}`}>{channel.name}</p>
        <p className="text-xs text-white/40 truncate">{channel.category_name || "Radio"}</p>
        {isActive && (
          <p className="text-xs text-gold/70 mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse inline-block" />
            {playing ? "En cours" : "En pause"}
          </p>
        )}
      </div>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
        isActive && playing ? "bg-gold text-black" : "bg-card text-white/60"
      }`}>
        {isActive && playing ? <MdPause className="text-lg" /> : <MdPlayArrow className="text-lg" />}
      </div>
    </button>
  );
}

export default function RadioPage() {
  const { t } = useTranslation();
  const { station, playing, stop } = useRadioPlayer();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const params = { is_radio: true };
    if (debouncedSearch) params.search = debouncedSearch;
    api.get("/channels/", { params })
      .then((r) => setStations(r.data.results || r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [debouncedSearch]);

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <MdRadio className="text-gold text-2xl flex-shrink-0" />
        <h1 className="text-2xl font-bold">Radio</h1>
        {station && (
          <button onClick={stop} className="ml-auto flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors">
            <MdStop className="text-base" /> Arrêter
          </button>
        )}
      </div>

      {station && (
        <div className="card p-4 flex items-center gap-3 border-gold/30 bg-gold/5">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-bg flex items-center justify-center flex-shrink-0">
            {station.logo_url ? (
              <img src={station.logo_url} alt={station.name} className="w-full h-full object-contain" />
            ) : (
              <MdRadio className="text-gold text-xl" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gold truncate">{station.name}</p>
            <p className="text-xs text-white/40 flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${playing ? "bg-gold animate-pulse" : "bg-white/30"}`} />
              {playing ? "En écoute" : "En pause"}
            </p>
          </div>
        </div>
      )}

      <div className="relative">
        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg" />
        <input
          type="search"
          placeholder="Rechercher une station…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : stations.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <MdRadio className="text-5xl mx-auto mb-3 opacity-30" />
          <p>Aucune station radio trouvée</p>
        </div>
      ) : (
        <div className="space-y-2">
          {stations.map((ch) => <StationCard key={ch.id} channel={ch} />)}
        </div>
      )}
    </div>
  );
}
