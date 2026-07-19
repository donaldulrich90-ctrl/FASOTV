import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { MdFavorite, MdLiveTv, MdMovie, MdVideoLibrary, MdDelete } from "react-icons/md";
import toast from "react-hot-toast";

function FavoriteCard({ item, onRemove }) {
  const navigate = useNavigate();
  const type = item.content_type_name;
  const obj = item.object_repr;

  const handlePlay = () => {
    if (type === "channel") navigate(`/player/live/${item.object_id}`);
    else if (type === "movie") navigate(`/player/movie/${item.object_id}`);
    else if (type === "series") navigate(`/series/${item.object_id}`);
  };

  const TypeIcon = type === "channel" ? MdLiveTv : type === "series" ? MdVideoLibrary : MdMovie;

  return (
    <div className="card p-3 flex items-center gap-3 group">
      <button onClick={handlePlay} className="flex items-center gap-3 flex-1 min-w-0 text-left">
        <div className="w-12 h-12 rounded-btn bg-bg flex items-center justify-center flex-shrink-0 overflow-hidden">
          {obj?.poster_url ? (
            <img src={obj.poster_url} alt={obj.title} className="w-full h-full object-cover" />
          ) : (
            <TypeIcon className="text-gold text-xl" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate group-hover:text-gold transition-colors">
            {obj?.title || "Contenu"}
          </p>
          <span className="text-xs text-white/40 capitalize">
            {type === "channel" ? "Chaîne live" : type === "movie" ? "Film" : "Série"}
          </span>
        </div>
      </button>
      <button
        onClick={() => onRemove(item)}
        className="p-2 text-white/20 hover:text-live transition-colors"
      >
        <MdDelete className="text-lg" />
      </button>
    </div>
  );
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/vod/favorites/")
      .then((r) => setFavorites(r.data.results || r.data))
      .finally(() => setLoading(false));
  }, []);

  const removeFavorite = async (item) => {
    try {
      await api.post("/vod/favorites/toggle/", {
        content_type: item.content_type_name,
        object_id: item.object_id,
      });
      setFavorites((prev) => prev.filter((f) => f.id !== item.id));
      toast.success("Retiré des favoris");
    } catch {
      toast.error("Erreur");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <MdFavorite className="text-gold text-2xl" />
        <h1 className="text-2xl font-bold">Mes favoris</h1>
        <span className="ml-auto text-white/40 text-sm">{favorites.length} éléments</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-card rounded-card animate-pulse" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-16 text-white/40">
          <MdFavorite className="text-5xl mx-auto mb-3" />
          <p className="font-medium">Aucun favori</p>
          <p className="text-sm mt-1">Ajoutez des chaînes, films ou séries à vos favoris</p>
        </div>
      ) : (
        <div className="space-y-2">
          {favorites.map((item) => (
            <FavoriteCard key={item.id} item={item} onRemove={removeFavorite} />
          ))}
        </div>
      )}
    </div>
  );
}
