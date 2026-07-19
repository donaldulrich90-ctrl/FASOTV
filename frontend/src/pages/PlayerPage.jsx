import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import api from "../services/api";
import { MdArrowBack, MdLiveTv, MdInfo, MdFavorite, MdFavoriteBorder } from "react-icons/md";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

function EPGBar({ entries }) {
  if (!entries?.length) return null;
  const now = new Date();
  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-white/60 mb-2">Programme</h3>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {entries.map((entry) => {
          const start = new Date(entry.start_time);
          const end = new Date(entry.end_time);
          const isCurrent = start <= now && end >= now;
          return (
            <div
              key={entry.id}
              className={`flex-shrink-0 rounded-btn p-2.5 min-w-[140px] border ${
                isCurrent
                  ? "bg-gold/10 border-gold/30 text-gold"
                  : "bg-card border-border text-white/60"
              }`}
            >
              <p className="text-xs font-bold mb-0.5">
                {format(start, "HH:mm", { locale: fr })} – {format(end, "HH:mm", { locale: fr })}
              </p>
              <p className="text-xs truncate">{entry.title}</p>
              {isCurrent && <span className="text-[10px] text-gold font-bold">EN COURS</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PlayerPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [epg, setEpg] = useState([]);
  const [channels, setChannels] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint =
      type === "live" ? `/channels/${id}/` :
      type === "movie" ? `/vod/movies/${id}/` :
      `/vod/series/${id}/`;

    api.get(endpoint)
      .then((r) => setContent(r.data))
      .catch(() => toast.error("Contenu introuvable"))
      .finally(() => setLoading(false));

    if (type === "live") {
      api.get(`/channels/${id}/epg/`).then((r) => setEpg(r.data.results || r.data)).catch(() => {});
      api.get("/channels/").then((r) => {
        const list = r.data.results || r.data;
        setChannels(list);
        const idx = list.findIndex((c) => String(c.id) === String(id));
        if (idx !== -1) setCurrentIdx(idx);
      }).catch(() => {});
    }
  }, [type, id]);

  const toggleFav = async () => {
    const ct = type === "live" ? "channel" : type;
    try {
      const { data } = await api.post("/vod/favorites/toggle/", { content_type: ct, object_id: id });
      setIsFav(data.favorited);
      toast.success(data.favorited ? "Ajouté aux favoris" : "Retiré des favoris");
    } catch {
      toast.error("Erreur");
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      const prev = channels[currentIdx - 1];
      navigate(`/player/live/${prev.id}`, { replace: true });
    }
  };

  const handleNext = () => {
    if (currentIdx < channels.length - 1) {
      const next = channels[currentIdx + 1];
      navigate(`/player/live/${next.id}`, { replace: true });
    }
  };

  const streamUrl = content?.stream_url || content?.seasons?.[0]?.episodes?.[0]?.stream_url;
  const title = content?.name || content?.title;

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="aspect-video bg-card rounded-card animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 animate-fade-in">
      {/* Back + Title bar */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-white/60 hover:text-white p-1">
          <MdArrowBack className="text-2xl" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold truncate">{title || "Lecture"}</h1>
          {type === "live" && (
            <div className="flex items-center gap-2">
              <span className="badge-live text-[10px]">LIVE</span>
              {content?.category?.name && (
                <span className="text-white/40 text-xs">{content.category.name}</span>
              )}
            </div>
          )}
        </div>
        <button onClick={toggleFav} className={`p-2 ${isFav ? "text-gold" : "text-white/40 hover:text-white"}`}>
          {isFav ? <MdFavorite className="text-xl" /> : <MdFavoriteBorder className="text-xl" />}
        </button>
      </div>

      {/* Player */}
      {streamUrl ? (
        <VideoPlayer
          src={streamUrl}
          title={title}
          onPrev={type === "live" && currentIdx > 0 ? handlePrev : undefined}
          onNext={type === "live" && currentIdx < channels.length - 1 ? handleNext : undefined}
        />
      ) : (
        <div className="aspect-video bg-card rounded-card flex items-center justify-center">
          <div className="text-center">
            <MdLiveTv className="text-white/20 text-5xl mx-auto mb-2" />
            <p className="text-white/40">Flux non disponible</p>
          </div>
        </div>
      )}

      {/* EPG for live */}
      {type === "live" && <EPGBar entries={epg} />}

      {/* Movie/Series info */}
      {type !== "live" && content && (
        <div className="card p-4 space-y-2">
          <div className="flex items-start gap-4">
            {content.poster_url && (
              <img src={content.poster_url} alt={title} className="w-20 rounded-card flex-shrink-0" />
            )}
            <div>
              <h2 className="font-bold text-lg">{title}</h2>
              <div className="flex items-center gap-2 text-sm text-white/50 mt-1">
                {content.genre && <span>{content.genre}</span>}
                {content.year && <span>• {content.year}</span>}
                {content.rating && <span>• ⭐ {content.rating}</span>}
                {content.duration && <span>• {content.duration}min</span>}
              </div>
              {content.description && (
                <p className="text-sm text-white/60 mt-2 line-clamp-3">{content.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Episodes list for series */}
      {type === "series" && content?.seasons && (
        <div className="space-y-4">
          {content.seasons.map((season) => (
            <div key={season.id} className="card p-4">
              <h3 className="font-semibold mb-3">{season.title || `Saison ${season.number}`}</h3>
              <div className="space-y-2">
                {season.episodes.map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() => navigate(`/player/episode/${ep.id}`)}
                    className="w-full flex items-center gap-3 p-2 rounded-btn hover:bg-card-hover transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-bg rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-white/50">{ep.number}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ep.title}</p>
                      {ep.duration && <p className="text-xs text-white/40">{ep.duration}min</p>}
                    </div>
                    <MdLiveTv className="text-white/30" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
