import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isAdmin } from "../utils/store";
import useTranslation from "../hooks/useTranslation";
import {
  MdHome, MdLiveTv, MdMovie, MdVideoLibrary,
  MdFavorite, MdSearch, MdSettings, MdLogout,
  MdStar, MdTv, MdMonetizationOn, MdMusicNote,
  MdVpnKey, MdCampaign, MdAdminPanelSettings,
  MdPerson, MdKeyboardArrowDown, MdLanguage,
} from "react-icons/md";

const LANGS = [
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "more", flag: "🇧🇫", label: "Mooré" },
  { code: "dioula", flag: "🇬🇳", label: "Dioula" },
];

const NAV_ITEMS = [
  { to: "/", icon: MdHome, label: "Accueil", end: true },
  { to: "/live", icon: MdLiveTv, label: "TV Direct" },
  { to: "/movies", icon: MdMovie, label: "Films" },
  { to: "/series", icon: MdVideoLibrary, label: "Séries" },
  { to: "/clips", icon: MdMusicNote, label: "Clips" },
  { to: "/vpn", icon: MdVpnKey, label: "VPN" },
  { to: "/plans", icon: MdStar, label: "Forfaits" },
  { to: "/reseller", icon: MdMonetizationOn, label: "Revendeur" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, lang, changeLang } = useTranslation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const profileRef = useRef(null);
  const langRef = useRef(null);
  const admin = isAdmin(user);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="flex flex-col h-full bg-surface border-r border-border w-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
        <MdTv className="text-gold text-3xl" />
        <div>
          <span className="text-gold font-black text-xl tracking-tight">FASO</span>
          <span className="text-white font-black text-xl tracking-tight"> TV</span>
          <p className="text-white/30 text-xs -mt-0.5">FAEST Ouagadougou</p>
        </div>
      </div>

      {/* User profile dropdown */}
      {user && (
        <div ref={profileRef} className="px-4 py-3 border-b border-border relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 w-full hover:bg-card rounded-btn px-2 py-1.5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
              <span className="text-gold text-sm font-bold">
                {(user.name || user.phone).charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium truncate">{user.name || user.phone}</p>
              {user.plan_actif ? (
                <p className="text-xs text-success truncate">{user.plan_actif}</p>
              ) : (
                <p className="text-xs text-white/40">Aucun abonnement</p>
              )}
            </div>
            <MdKeyboardArrowDown className={`text-white/40 flex-shrink-0 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
          </button>

          {profileOpen && (
            <div className="absolute left-4 right-4 top-full mt-1 bg-surface border border-border rounded-card shadow-xl shadow-black/50 z-50 py-1">
              <NavLink to="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-card transition-colors">
                <MdPerson className="text-white/40" /> Mon compte
              </NavLink>
              <NavLink to="/vpn" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-card transition-colors">
                <MdVpnKey className="text-blue-400" /> Mon VPN
              </NavLink>
              <NavLink to="/favorites" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-card transition-colors">
                <MdFavorite className="text-live/70" /> Mes favoris
              </NavLink>
              <NavLink to="/promote" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-card transition-colors">
                <MdCampaign className="text-purple-400" /> Promouvoir un contenu
              </NavLink>
              {admin && (
                <NavLink to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-card text-gold transition-colors">
                  <MdAdminPanelSettings className="text-gold" /> Administration
                </NavLink>
              )}
              <div className="border-t border-border my-1" />
              <NavLink to="/become-reseller" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-card transition-colors text-white/60">
                <MdMonetizationOn className="text-success/70" /> Devenir revendeur
              </NavLink>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-card text-live/70 transition-colors w-full text-left">
                <MdLogout /> Déconnexion
              </button>
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <Icon className="text-xl flex-shrink-0" />
            <span className="text-sm font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-1 border-t border-border pt-3">
        <NavLink to="/search" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
          <MdSearch className="text-xl flex-shrink-0" />
          <span className="text-sm font-medium">{t("nav_recherche")}</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
          <MdSettings className="text-xl flex-shrink-0" />
          <span className="text-sm font-medium">{t("nav_parametres")}</span>
        </NavLink>

        {/* Language selector */}
        <div ref={langRef} className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="sidebar-link w-full text-left"
          >
            <MdLanguage className="text-xl flex-shrink-0 text-white/60" />
            <span className="text-sm font-medium flex-1">
              {LANGS.find((l) => l.code === lang)?.flag} {LANGS.find((l) => l.code === lang)?.label}
            </span>
            <MdKeyboardArrowDown className={`text-white/40 text-sm transition-transform ${langOpen ? "rotate-180" : ""}`} />
          </button>
          {langOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-surface border border-border rounded-card shadow-xl z-50 py-1 overflow-hidden">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { changeLang(l.code); setLangOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-card transition-colors text-left ${lang === l.code ? "text-gold font-semibold" : "text-white/70"}`}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                  {lang === l.code && <span className="ml-auto text-gold text-xs">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={handleLogout} className="sidebar-link w-full text-left text-live/70 hover:text-live">
          <MdLogout className="text-xl flex-shrink-0" />
          <span className="text-sm font-medium">{t("nav_deconnexion")}</span>
        </button>
      </div>
    </div>
  );
}
