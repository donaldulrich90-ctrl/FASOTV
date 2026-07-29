import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { MdArrowBack, MdPlayArrow, MdStar } from "react-icons/md";
import toast from "react-hot-toast";
import VideoPlayer from "../components/VideoPlayer";

export default function SeriesDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [series, setSeries] = useState(null);
  const [episodesData, setEpisodesData] = useState(null); // { seasons, info, episodes }
  const [activeSeason, setActiveSeason] = useState(null);  // season_number as string
  const [loading, setLoading] = useState(true);
  const [loadingEps, setLoadingEps] = useState(true);
  const [playingUrl, setPlayingUrl] = useState(null);
  const [playingTitle, setPlayingTitle] = useState("");

  // 1) Base series info (poster, title, description)
  useEffect(() => {
    api.get(`/vod/series/${id}/`)
      .then((r) => setSeries(r.data))
      .catch(() => toast.error("Serie introuvable"))
      .finally(() => setLoading(false));
  }, [id]);

  // 2) Episodes (separate Xtream endpoint)
  useEffect(() => {
    setLoadingEps(true);
    api.get(`/xtream/series/${id}/episodes/`)
      .then((r) => {
        setEpisodesData(r.data);
        const eps = r.data?.episodes || {};
        const keys = Object.keys(eps).sort((a, b) => Number(a) - Number(b));
        if (keys.length) setActiveSeason(keys[0]);
      })
      .catch(() => {})
      .finally(() => setLoadingEps(false));
  }, [id]);

  const playEpisode = (ep) => {
    // Build the stream URL the same way movies do: /series/user/pass/ID.ext
    // The backend proxy + VideoPlayer.getProxyUrl handle the rest.
    const ext = ep.container_extension || "mp4";
    // We rely on the base series info to know the provider path is /series/...
    // VideoPlayer proxifies any /series/.../ID.ext into /api/xtream/vod/ID/?type=series
    const base = episodesData?.info?.stream_base
      || (series?.stream_base)
      || null;

    // Fallback: construct a relative marker URL the player understands.
    // getProxyUrl matches /series/<u>/<p>/<id>.<ext>; we only need id + ext + type.
    // Simplest: hit the VOD proxy directly.
    const url = `/api/xtream/vod/${ep.id}/?type=series&ext=${ext}`;
    setPlayingUrl(url);
    setPlayingTitle(ep.title || `Episode ${ep.episode_num}`);
  };

  if (loading) return (
    <div className="p-6 space-y-4">
      <div className="h-8 bg-card rounded animate-pulse w-48" />
      <div className="h-48 bg-card rounded-card animate-pulse" />
    </div>
  );

  if (!series) return null;

  const eps = episodesData?.episodes || {};
  const seasonKeys = Object.keys(eps).sort((a, b) => Number(a) - Number(b));
  const currentEpisodes = activeSeason ? (eps[activeSeason] || []) : [];

  // Map season_number -> display name from seasons metadata
  const seasonName = (num) => {
    const meta = episodesData?.seasons?.find(
      (s) => String(s.season_number) === String(num)
    );
    return meta?.name || `Saison ${num}`;
  };

  return (
    <div className="animate-fade-in">
      {/* Inline player modal */}
      {playingUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold truncate pr-4">{playingTitle}</p>
              <button
                onClick={() => setPlayingUrl(null)}
                className="text-white/60 hover:text-white text-2xl px-2"
              >
                &times;
              </button>
            </div>
            <VideoPlayer src={playingUrl} title={playingTitle} />
          </div>
        </div>
      )}

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
              {seasonKeys.length > 0 && (
                <span>{seasonKeys.length} saison{seasonKeys.length > 1 ? "s" : ""}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-5">
        {/* Description */}
        {series.description && (
          <p className="text-sm text-white/60 leading-relaxed">{series.description}</p>
        )}

        {/* Loading episodes */}
        {loadingEps && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-card rounded-card animate-pulse" />
            ))}
          </div>
        )}

        {/* No episodes */}
        {!loadingEps && seasonKeys.length === 0 && (
          <p className="text-white/40 text-sm text-center py-8">
            Aucun episode disponible pour cette serie.
          </p>
        )}

        {/* Season tabs */}
        {!loadingEps && seasonKeys.length > 0 && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {seasonKeys.map((num) => (
                <button
                  key={num}
                  onClick={() => setActiveSeason(num)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-badge text-sm font-medium transition-all ${
                    num === activeSeason ? "bg-gold text-black" : "bg-card text-white/60 hover:text-white"
                  }`}
                >
                  {seasonName(num)}
                </button>
              ))}
            </div>

            {/* Episodes list */}
            <div className="space-y-2">
              {currentEpisodes.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => playEpisode(ep)}
                  className="w-full card p-3 flex items-center gap-3 text-left hover:border-gold/20"
                >
                  <div className="w-10 h-10 bg-bg rounded-btn flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-white/50">{ep.episode_num}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{ep.title}</p>
                    {ep.info?.duration && (
                      <p className="text-xs text-white/40">{ep.info.duration}</p>
                    )}
                  </div>
                  <MdPlayArrow className="text-gold text-xl flex-shrink-0" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
