import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { MdSearch, MdLiveTv, MdMovie, MdVideoLibrary } from "react-icons/md";

function ResultSection({ title, icon: Icon, items, onClick }) {
  if (!items?.length) return null;
  return (
    <section>
      <h2 className="text-sm font-semibold text-white/50 flex items-center gap-2 mb-3">
        <Icon className="text-base" />{title}
      </h2>
      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onClick(item)}
            className="w-full card p-3 flex items-center gap-3 text-left hover:border-gold/20"
          >
            <div className="w-10 h-10 rounded-btn bg-bg flex items-center justify-center flex-shrink-0 overflow-hidden">
              {(item.logo_url || item.poster_url) ? (
                <img src={item.logo_url || item.poster_url} alt={item.name || item.title} className="w-full h-full object-cover" />
              ) : (
                <Icon className="text-gold text-lg" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.name || item.title}</p>
              <p className="text-xs text-white/40 truncate">
                {item.category_name || item.genre || ""}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults({});
      return;
    }
    const timer = setTimeout(() => {
      setLoading(true);
      api.get(`/vod/search/?q=${encodeURIComponent(query)}`)
        .then((r) => setResults(r.data))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const total = (results.channels?.length || 0) + (results.movies?.length || 0) + (results.series?.length || 0);

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <MdSearch className="text-gold text-2xl" />
        <h1 className="text-2xl font-bold">Recherche</h1>
      </div>

      <div className="relative">
        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-xl" />
        <input
          ref={inputRef}
          type="search"
          placeholder="Chaînes, films, séries…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input pl-11 text-lg"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 border border-gold/40 border-t-gold rounded-full animate-spin" />
        )}
      </div>

      {query.length >= 2 && !loading && total === 0 && (
        <div className="text-center py-12 text-white/40">
          <MdSearch className="text-5xl mx-auto mb-3" />
          <p>Aucun résultat pour <span className="text-white/60">"{query}"</span></p>
        </div>
      )}

      {total > 0 && (
        <div className="space-y-6">
          <ResultSection
            title="Chaînes live"
            icon={MdLiveTv}
            items={results.channels}
            onClick={(ch) => navigate(`/player/live/${ch.id}`)}
          />
          <ResultSection
            title="Films"
            icon={MdMovie}
            items={results.movies}
            onClick={(m) => navigate(`/player/movie/${m.id}`)}
          />
          <ResultSection
            title="Séries"
            icon={MdVideoLibrary}
            items={results.series}
            onClick={(s) => navigate(`/series/${s.id}`)}
          />
        </div>
      )}

      {!query && (
        <div className="text-center py-12 text-white/30">
          <MdSearch className="text-6xl mx-auto mb-3" />
          <p>Tapez au moins 2 caractères pour rechercher</p>
        </div>
      )}
    </div>
  );
}
