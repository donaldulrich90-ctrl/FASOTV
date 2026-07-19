import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isAdmin } from "../utils/store";
import useTranslation from "../hooks/useTranslation";
import {
  MdHome, MdLiveTv, MdMusicNote, MdVpnKey, MdStar,
  MdMenu, MdClose, MdMovie, MdVideoLibrary, MdSearch,
  MdMonetizationOn, MdSettings, MdLogout, MdCampaign,
  MdAdminPanelSettings, MdLanguage,
} from "react-icons/md";

const LANGS = [
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "more", flag: "🇧🇫", label: "Mooré" },
  { code: "dioula", flag: "🇬🇳", label: "Dioula" },
];

const MAIN_NAV = [
  { to: "/", icon: MdHome, label: "Accueil", end: true },
  { to: "/live", icon: MdLiveTv, label: "Live" },
  { to: "/clips", icon: MdMusicNote, label: "Clips" },
  { to: "/vpn", icon: MdVpnKey, label: "VPN" },
  { to: "/plans", icon: MdStar, label: "Forfaits" },
];

export default function MobileNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, lang, changeLang } = useTranslation();
  const admin = isAdmin(user);

  const handleLogout = () => { logout(); navigate("/login"); setMenuOpen(false); };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur border-t border-border z-50">
        <div className="flex">
          {MAIN_NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-2.5 text-xs transition-colors ${
                  isActive ? "text-gold" : "text-white/50"
                }`
              }
            >
              <Icon className="text-xl" />
              <span>{label}</span>
            </NavLink>
          ))}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 text-xs text-white/50"
          >
            <MdMenu className="text-xl" />
            <span>Plus</span>
          </button>
        </div>
      </nav>

      {/* Slide-up menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <div className="relative bg-surface border-t border-border rounded-t-2xl p-4 space-y-1 pb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-sm">Menu</p>
              <button onClick={() => setMenuOpen(false)} className="text-white/40 hover:text-white">
                <MdClose className="text-xl" />
              </button>
            </div>

            {[
              { to: "/movies", icon: MdMovie, label: "Films" },
              { to: "/series", icon: MdVideoLibrary, label: "Séries" },
              { to: "/search", icon: MdSearch, label: "Recherche" },
              { to: "/promote", icon: MdCampaign, label: "Promouvoir" },
              { to: "/reseller", icon: MdMonetizationOn, label: "Espace Revendeur" },
              { to: "/settings", icon: MdSettings, label: "Paramètres" },
            ].map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <Icon className="text-xl flex-shrink-0" />
                <span className="text-sm font-medium">{label}</span>
              </NavLink>
            ))}

            {admin && (
              <NavLink to="/admin" onClick={() => setMenuOpen(false)} className="sidebar-link text-gold">
                <MdAdminPanelSettings className="text-xl flex-shrink-0 text-gold" />
                <span className="text-sm font-medium">Administration</span>
              </NavLink>
            )}

            {/* Language selector */}
            <div className="border-t border-border pt-2 mt-1">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="sidebar-link w-full text-left"
              >
                <MdLanguage className="text-xl flex-shrink-0 text-white/60" />
                <span className="text-sm font-medium flex-1">
                  {LANGS.find((l) => l.code === lang)?.flag} {LANGS.find((l) => l.code === lang)?.label}
                </span>
              </button>
              {langOpen && (
                <div className="grid grid-cols-2 gap-1 mt-1 px-2">
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { changeLang(l.code); setLangOpen(false); }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-btn text-sm transition-colors ${lang === l.code ? "bg-gold/20 text-gold font-semibold" : "bg-card text-white/60 hover:text-white"}`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleLogout} className="sidebar-link w-full text-left text-live/70 hover:text-live">
              <MdLogout className="text-xl flex-shrink-0" />
              <span className="text-sm font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
