import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFeaturedChannels } from "../hooks/useChannels";
import api from "../services/api";
import { MdPlayArrow, MdLiveTv, MdMovie, MdStar, MdArrowForward } from "react-icons/md";

function HeroSlider({ channels }) {
  const [idx, setIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!channels.length) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % channels.length), 5000);
    return () => clearInterval(t);
  }, [channels.length]);

  if (!channels.length) {
    return (
      <div className="relative h-56 md:h-80 bg-gradient-to-r from-surface to-card rounded-card flex items-center justify-center">
        <div className="text-center">
          <MdLiveTv className="text-gold text-5xl mx-auto mb-2" />
          <p className="text-white font-bold text-xl">FASO TV</p>
          <p className="text-white/40 text-sm">Chargement des chaînes…</p>
        </div>
      </div>
    );
  }

  const ch = channels[idx];
  return (
    <div className="relative h-56 md:h-80 rounded-card overflow-hidden bg-card">
      <div className="absolute inset-0 bg-gradient-to-r from-bg/90 via-bg/50 to-transparent z-10" />

      {/* Content */}
      <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-12">
        <span className="badge-live inline-flex items-center gap-1.5 w-fit mb-4">
          <span className="w-1.5 h-1.5 bg-white rounded-full" />
          EN DIRECT
        </span>
        <h1 className="text-2xl md:text-4xl font-black mb-2 text-shadow">{ch.name}</h1>
        {ch.category_name && (
          <p className="text-white/60 text-sm mb-6">{ch.category_name}</p>
        )}
        <button
          onClick={() => navigate(`/player/live/${ch.id}`)}
          className="btn-primary inline-flex items-center gap-2 w-fit"
        >
          <MdPlayArrow className="text-xl" />
          Regarder maintenant
        </button>
      </div>

      {/* Logo bg */}
      {ch.logo_url && (
        <img
          src={ch.logo_url}
          alt={ch.name}
          className="absolute right-8 top-1/2 -translate-y-1/2 h-16 md:h-24 object-contain opacity-20"
        />
      )}

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {channels.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? "bg-gold w-4" : "bg-white/30"}`}
          />
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, value, label }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className="w-10 h-10 bg-gold/10 rounded-btn flex items-center justify-center">
        <Icon className="text-gold text-xl" />
      </div>
      <div>
        <p className="text-xl font-bold">{value}</p>
        <p className="text-white/40 text-xs">{label}</p>
      </div>
    </div>
  );
}

function ChannelCarousel({ title, channels }) {
  const navigate = useNavigate();
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span className="w-1 h-5 bg-gold rounded-full inline-block" />
          {title}
        </h2>
        <button onClick={() => navigate("/live")} className="text-gold text-sm flex items-center gap-1 hover:underline">
          Tout voir <MdArrowForward />
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {channels.slice(0, 10).map((ch) => (
          <button
            key={ch.id}
            onClick={() => navigate(`/player/live/${ch.id}`)}
            className="flex-shrink-0 card p-3 w-28 text-center group"
          >
            <div className="w-14 h-14 mx-auto rounded-btn bg-bg flex items-center justify-center mb-2 overflow-hidden">
              {ch.logo_url ? (
                <img src={ch.logo_url} alt={ch.name} className="w-full h-full object-contain" />
              ) : (
                <MdLiveTv className="text-gold text-2xl" />
              )}
            </div>
            <p className="text-xs font-medium truncate group-hover:text-gold transition-colors">{ch.name}</p>
            <span className="badge-live text-[10px] mt-1">LIVE</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function MovieCarousel({ title, movies }) {
  const navigate = useNavigate();
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span className="w-1 h-5 bg-gold rounded-full inline-block" />
          {title}
        </h2>
        <button onClick={() => navigate("/movies")} className="text-gold text-sm flex items-center gap-1 hover:underline">
          Tout voir <MdArrowForward />
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {movies.slice(0, 8).map((m) => (
          <button
            key={m.id}
            onClick={() => navigate(`/player/movie/${m.id}`)}
            className="flex-shrink-0 group"
          >
            <div className="w-28 h-40 rounded-card overflow-hidden bg-card relative">
              {m.poster_url ? (
                <img src={m.poster_url} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MdMovie className="text-white/20 text-3xl" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                <MdPlayArrow className="text-white text-2xl" />
              </div>
              {m.rating && (
                <div className="absolute top-2 right-2 bg-black/70 rounded-badge px-1.5 py-0.5 text-xs text-gold flex items-center gap-0.5">
                  <MdStar className="text-xs" />{m.rating}
                </div>
              )}
            </div>
            <p className="text-xs font-medium mt-2 w-28 truncate text-left">{m.title}</p>
            <p className="text-xs text-white/40">{m.genre}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const { channels } = useFeaturedChannels();
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/vod/movies/?is_featured=true&page_size=8").then((r) => setMovies(r.data.results || r.data)).catch(() => {});
    api.get("/vod/series/?is_featured=true&page_size=6").then((r) => setSeries(r.data.results || r.data)).catch(() => {});
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-8 animate-fade-in">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/50 text-sm">Bienvenue sur</p>
          <h1 className="text-2xl font-black">
            <span className="text-gold">FASO</span> TV
          </h1>
        </div>
        {user && !user.has_active_subscription && (
          <button
            onClick={() => navigate("/plans")}
            className="btn-primary text-sm flex items-center gap-1"
          >
            <MdStar className="text-base" />
            S'abonner
          </button>
        )}
      </div>

      {/* Hero */}
      <HeroSlider channels={channels} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={MdLiveTv} value="30+" label="Chaînes live" />
        <StatCard icon={MdMovie} value="12+" label="Films" />
        <StatCard icon={MdStar} value="8+" label="Séries" />
      </div>

      {/* Subscription banner */}
      {user && !user.has_active_subscription && (
        <div className="card p-5 border-gold/20 bg-gold/5 flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-gold">Activez votre abonnement</p>
            <p className="text-sm text-white/50">Dès 200 FCFA/jour • Orange Money • Moov Money • Coris Money</p>
          </div>
          <button onClick={() => navigate("/plans")} className="btn-primary text-sm flex-shrink-0">
            Voir les forfaits
          </button>
        </div>
      )}

      {/* Live TV carrousel */}
      {channels.length > 0 && <ChannelCarousel title="Chaînes en direct" channels={channels} />}

      {/* Movies */}
      {movies.length > 0 && <MovieCarousel title="Films à la une" movies={movies} />}

      {/* Series */}
      {series.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="w-1 h-5 bg-gold rounded-full inline-block" />
              Séries populaires
            </h2>
            <button onClick={() => navigate("/series")} className="text-gold text-sm flex items-center gap-1 hover:underline">
              Tout voir <MdArrowForward />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {series.slice(0, 4).map((s) => (
              <button
                key={s.id}
                onClick={() => navigate(`/series/${s.id}`)}
                className="group text-left"
              >
                <div className="aspect-[2/3] rounded-card overflow-hidden bg-card relative">
                  {s.poster_url ? (
                    <img src={s.poster_url} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MdMovie className="text-white/20 text-4xl" />
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium mt-2 truncate">{s.title}</p>
                <p className="text-xs text-white/40">{s.total_seasons} saison{s.total_seasons > 1 ? "s" : ""}</p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
