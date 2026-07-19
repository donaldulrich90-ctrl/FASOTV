import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { MdArrowBack, MdPlayArrow, MdVideoLibrary, MdStar } from "react-icons/md";
import toast from "react-hot-toast";

export default function SeriesDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [series, setSeries] = useState(null);
  const [activeSeason, setActiveSeason] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/vod/series/${id}/`)
      .then((r) => setSeries(r.data))
      .catch(() => toast.error("Série introuvable"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="p-6 space-y-4">
      <div className="h-8 bg-card rounded animate-pulse w-48" />
      <div className="h-48 bg-card rounded-card animate-pulse" />
    </div>
  );

  if (!series) return null;

  const currentSeason = series.seasons?.[activeSeason];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="relative h-48 md:h-64 bg-card overflow-hidden">
        {series.poster_url && (
          <img src={series.poster_url} alt={series.title} className="w-full h-full object-cover blur-sm scale-105 opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-black/50 p-2 rounded-btn text-white hover:bg-black/70"
        >
          <MdArrowBack className="text-xl" />
        </button>
        <div className="absolute bottom-4 left-4 right-4 flex gap-4 items-end">
          {series.poster_url && (
            <img src={series.poster_url} alt={series.title} className="w-20 h-28 rounded-card object-cover shadow-xl flex-shrink-0" />
          )}
          <div>
            <h1 className="text-2xl font-black">{series.title}</h1>
            <div className="flex items-center gap-2 text-sm text-white/50 mt-1">
              {series.genre && <span>{series.genre}</span>}
              {series.rating && <span className="flex items-center gap-0.5 text-gold"><MdStar className="text-xs" />{series.rating}</span>}
              <span>{series.total_seasons} saison{series.total_seasons > 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-5">
        {/* Description */}
        {series.description && (
          <p className="text-sm text-white/60 leading-relaxed">{series.description}</p>
        )}

        {/* Season tabs */}
        {series.seasons?.length > 0 && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {series.seasons.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSeason(i)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-badge text-sm font-medium transition-all ${
                    i === activeSeason ? "bg-gold text-black" : "bg-card text-white/60 hover:text-white"
                  }`}
                >
                  {s.title || `Saison ${s.number}`}
                </button>
              ))}
            </div>

            {/* Episodes */}
            {currentSeason && (
              <div className="space-y-2">
                {currentSeason.episodes.map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() => navigate(`/player/series/${id}?episode=${ep.id}`)}
                    className="w-full card p-3 flex items-center gap-3 text-left hover:border-gold/20"
                  >
                    <div className="w-10 h-10 bg-bg rounded-btn flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-white/50">{ep.number}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{ep.title}</p>
                      {ep.duration && <p className="text-xs text-white/40">{ep.duration} min</p>}
                    </div>
                    <MdPlayArrow className="text-gold text-xl flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
