import { useState } from "react";
import toast from "react-hot-toast";
import { addClip, updateClip, deleteClip, parseYoutubeId, thumbUrl } from "../../utils/store";
import {
  MdAdd, MdDelete, MdEdit, MdMusicVideo, MdCheck, MdClose, MdVisibility,
} from "react-icons/md";

const CATEGORIES = ["Musique Burkinabè", "Musique Africaine", "Gospel", "Comédie", "Documentaire", "Sport", "Événement"];
const PLACEMENTS = ["hero", "trending", "new"];
const BADGES = ["SPONSORISÉ", "NOUVEAU", "TENDANCE"];

function ClipForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: "", artist: "", category: "Musique Burkinabè", duration: "",
    youtube_id: "", is_promoted: false, promotion_badge: null, promotion_end_date: "",
    ...initial,
  });
  const [urlInput, setUrlInput] = useState(initial?.youtube_id || "");
  const [previewOk, setPreviewOk] = useState(!!initial?.youtube_id);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const handleUrl = (e) => {
    const url = e.target.value;
    setUrlInput(url);
    const id = parseYoutubeId(url);
    if (id) {
      setForm((f) => ({ ...f, youtube_id: id }));
      setPreviewOk(true);
    } else {
      setPreviewOk(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.youtube_id) { toast.error("URL YouTube invalide"); return; }
    if (!form.title || !form.artist) { toast.error("Titre et artiste requis"); return; }
    onSave({ ...form, thumbnail: thumbUrl(form.youtube_id) });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="text-xs text-white/50 mb-1 block">URL YouTube *</label>
        <input value={urlInput} onChange={handleUrl} placeholder="https://youtube.com/watch?v=..." className="input" />
        {previewOk && (
          <div className="mt-2 flex items-center gap-3">
            <img src={thumbUrl(form.youtube_id)} alt="preview" className="w-32 h-18 object-cover rounded-btn" onError={(e) => e.target.style.display = "none"} />
            <span className="text-xs text-success">ID: {form.youtube_id}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-white/50 mb-1 block">Titre *</label>
          <input value={form.title} onChange={set("title")} className="input" required />
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">Artiste *</label>
          <input value={form.artist} onChange={set("artist")} className="input" required />
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">Catégorie</label>
          <select value={form.category} onChange={set("category")} className="input">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1 block">Durée (ex: 4:32)</label>
          <input value={form.duration} onChange={set("duration")} placeholder="4:32" className="input" />
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <label className="flex items-center gap-2 cursor-pointer mb-3">
          <input type="checkbox" checked={form.is_promoted} onChange={set("is_promoted")} className="accent-gold" />
          <span className="text-sm font-medium">Clip promu (sponsorisé)</span>
        </label>

        {form.is_promoted && (
          <div className="grid grid-cols-2 gap-3 pl-6">
            <div>
              <label className="text-xs text-white/50 mb-1 block">Badge</label>
              <select value={form.promotion_badge || ""} onChange={set("promotion_badge")} className="input">
                <option value="">Aucun</option>
                {BADGES.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">Date de fin</label>
              <input type="date" value={form.promotion_end_date || ""} onChange={set("promotion_end_date")} className="input" />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" className="btn-primary flex items-center gap-1 text-sm py-2">
          <MdCheck /> {initial ? "Sauvegarder" : "Ajouter le clip"}
        </button>
        {onCancel && <button type="button" onClick={onCancel} className="btn-outline text-sm py-2">Annuler</button>}
      </div>
    </form>
  );
}

export default function AdminClipsManager({ clips, onRefresh }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterCat, setFilterCat] = useState("Tous");

  const handleAdd = (data) => {
    addClip(data);
    onRefresh();
    setShowAdd(false);
    toast.success("Clip ajouté !");
  };

  const handleUpdate = (id, data) => {
    updateClip(id, data);
    onRefresh();
    setEditing(null);
    toast.success("Clip mis à jour !");
  };

  const handleDelete = (id) => {
    if (!confirm("Supprimer ce clip ?")) return;
    deleteClip(id);
    onRefresh();
    toast.success("Clip supprimé");
  };

  const filtered = filterCat === "Tous" ? clips : clips.filter((c) => c.category === filterCat);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Clips & Promos</h2>
          <p className="text-white/40 text-sm">{clips.length} clip(s) au total</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-2 text-sm py-2">
          <MdAdd /> Ajouter
        </button>
      </div>

      {showAdd && (
        <div className="card p-5">
          <p className="font-semibold mb-4 flex items-center gap-2"><MdMusicVideo className="text-gold" /> Nouveau clip</p>
          <ClipForm onSave={handleAdd} onCancel={() => setShowAdd(false)} />
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-1 flex-wrap">
        {["Tous", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setFilterCat(c)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              filterCat === c ? "bg-gold text-black" : "bg-card text-white/50 hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Clips table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-white/40 text-left">
                <th className="pb-3 pr-4 font-medium pl-4 py-3">Clip</th>
                <th className="pb-3 pr-4 font-medium hidden md:table-cell">Catégorie</th>
                <th className="pb-3 pr-4 font-medium">
                  <MdVisibility className="inline mr-1" />Vues
                </th>
                <th className="pb-3 pr-4 font-medium hidden lg:table-cell">Promu</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((clip) => (
                <>
                  <tr key={clip.id} className="border-b border-border/50 hover:bg-white/2 group">
                    <td className="py-3 pr-4 pl-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={thumbUrl(clip.youtube_id)}
                          alt={clip.title}
                          className="w-14 h-9 object-cover rounded-btn flex-shrink-0"
                          onError={(e) => { e.target.src = ""; e.target.className = "w-14 h-9 bg-card rounded-btn flex-shrink-0"; }}
                        />
                        <div>
                          <p className="font-medium leading-tight">{clip.title}</p>
                          <p className="text-white/40 text-xs">{clip.artist}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-white/50 text-xs hidden md:table-cell">{clip.category}</td>
                    <td className="py-3 pr-4 text-white/70">{clip.views_count?.toLocaleString()}</td>
                    <td className="py-3 pr-4 hidden lg:table-cell">
                      {clip.is_promoted ? (
                        <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded-full">{clip.promotion_badge || "Promu"}</span>
                      ) : (
                        <span className="text-white/20 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditing(editing === clip.id ? null : clip.id)} className="text-gold hover:text-gold-dark">
                          <MdEdit className="text-lg" />
                        </button>
                        <button onClick={() => handleDelete(clip.id)} className="text-live/60 hover:text-live">
                          <MdDelete className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editing === clip.id && (
                    <tr key={`edit-${clip.id}`} className="border-b border-border bg-card">
                      <td colSpan={5} className="p-4">
                        <ClipForm
                          initial={clip}
                          onSave={(data) => handleUpdate(clip.id, data)}
                          onCancel={() => setEditing(null)}
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
