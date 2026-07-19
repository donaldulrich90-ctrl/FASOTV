import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  MdSettings, MdPerson, MdLock, MdTv, MdLink, MdLogout,
  MdSave, MdVisibility, MdVisibilityOff, MdSync,
} from "react-icons/md";

function Section({ title, icon: Icon, children }) {
  return (
    <div className="card p-5 space-y-4">
      <h2 className="font-semibold flex items-center gap-2 text-gold">
        <Icon className="text-lg" />{title}
      </h2>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Profile form
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  // Xtream form
  const [xtreamUrl, setXtreamUrl] = useState(localStorage.getItem("xtream_url") || "");
  const [xtreamUser, setXtreamUser] = useState(localStorage.getItem("xtream_user") || "");
  const [xtreamPass, setXtreamPass] = useState(localStorage.getItem("xtream_pass") || "");
  const [m3uUrl, setM3uUrl] = useState(localStorage.getItem("m3u_url") || "");
  const [syncingXtream, setSyncingXtream] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await authService.updateProfile({ name, email });
      await refreshUser();
      toast.success("Profil mis à jour");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setSavingPwd(true);
    try {
      await authService.changePassword(oldPwd, newPwd);
      toast.success("Mot de passe modifié");
      setOldPwd(""); setNewPwd("");
    } catch (err) {
      toast.error(err.response?.data?.old_password?.[0] || "Erreur");
    } finally {
      setSavingPwd(false);
    }
  };

  const saveXtream = () => {
    localStorage.setItem("xtream_url", xtreamUrl);
    localStorage.setItem("xtream_user", xtreamUser);
    localStorage.setItem("xtream_pass", xtreamPass);
    localStorage.setItem("m3u_url", m3uUrl);
    toast.success("Configuration sauvegardée");
  };

  const syncXtream = async () => {
    setSyncingXtream(true);
    try {
      const { data } = await api.post("/xtream/sync/", {
        server_url: xtreamUrl, username: xtreamUser, password: xtreamPass,
      });
      toast.success(`Sync terminé : ${data.synced.live} chaînes, ${data.synced.vod} films`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Erreur sync Xtream");
    } finally {
      setSyncingXtream(false);
    }
  };

  const importM3U = async () => {
    if (!m3uUrl) return;
    try {
      const { data } = await api.post("/m3u/import/url/", { url: m3uUrl });
      toast.success(`${data.imported} chaînes importées`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Erreur import M3U");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-2xl animate-fade-in">
      <div className="flex items-center gap-3">
        <MdSettings className="text-gold text-2xl" />
        <h1 className="text-2xl font-bold">Paramètres</h1>
      </div>

      {/* Profile */}
      <Section title="Mon profil" icon={MdPerson}>
        <div className="text-sm text-white/40 mb-2">
          Téléphone : <span className="text-white">{user?.phone}</span>
        </div>
        <form onSubmit={saveProfile} className="space-y-3">
          <div>
            <label className="text-sm text-white/60 mb-1 block">Nom complet</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Votre nom" />
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1 block">Email (optionnel)</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="email@exemple.com" />
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary flex items-center gap-2">
            <MdSave />{savingProfile ? "Enregistrement…" : "Sauvegarder"}
          </button>
        </form>
      </Section>

      {/* Password */}
      <Section title="Mot de passe" icon={MdLock}>
        <form onSubmit={changePassword} className="space-y-3">
          <div>
            <label className="text-sm text-white/60 mb-1 block">Mot de passe actuel</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={oldPwd}
                onChange={(e) => setOldPwd(e.target.value)}
                className="input pr-10"
                placeholder="••••••"
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                {showPwd ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1 block">Nouveau mot de passe</label>
            <input
              type={showPwd ? "text" : "password"}
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              className="input"
              placeholder="Min. 6 caractères"
            />
          </div>
          <button type="submit" disabled={savingPwd || !oldPwd || !newPwd} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            <MdLock />{savingPwd ? "Modification…" : "Changer le mot de passe"}
          </button>
        </form>
      </Section>

      {/* Xtream / M3U */}
      <Section title="Serveur Xtream Codes / M3U" icon={MdTv}>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-white/60 mb-1 block">URL du serveur Xtream</label>
            <input value={xtreamUrl} onChange={(e) => setXtreamUrl(e.target.value)} className="input" placeholder="http://panel.exemple.com:8080" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm text-white/60 mb-1 block">Utilisateur</label>
              <input value={xtreamUser} onChange={(e) => setXtreamUser(e.target.value)} className="input" placeholder="username" />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1 block">Mot de passe</label>
              <input type="password" value={xtreamPass} onChange={(e) => setXtreamPass(e.target.value)} className="input" placeholder="••••••" />
            </div>
          </div>
          <div>
            <label className="text-sm text-white/60 mb-1 block flex items-center gap-2">
              <MdLink className="text-base" />URL M3U / M3U8
            </label>
            <input value={m3uUrl} onChange={(e) => setM3uUrl(e.target.value)} className="input" placeholder="http://…/playlist.m3u" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={saveXtream} className="btn-primary flex items-center gap-2 text-sm">
              <MdSave />Sauvegarder
            </button>
            <button
              onClick={syncXtream}
              disabled={syncingXtream || !xtreamUrl}
              className="btn-outline flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <MdSync className={syncingXtream ? "animate-spin" : ""} />
              {syncingXtream ? "Sync…" : "Synchroniser Xtream"}
            </button>
            <button
              onClick={importM3U}
              disabled={!m3uUrl}
              className="btn-outline flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <MdLink />Importer M3U
            </button>
          </div>
        </div>
      </Section>

      {/* Logout */}
      <div className="card p-4 border-live/20">
        <button onClick={handleLogout} className="flex items-center gap-3 text-live hover:text-live/80 transition-colors w-full">
          <MdLogout className="text-xl" />
          <span className="font-medium">Se déconnecter</span>
        </button>
      </div>
    </div>
  );
}
