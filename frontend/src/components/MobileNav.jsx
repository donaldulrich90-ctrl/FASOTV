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
  { code: "fr", flag: "🇫🇷", labelKey: "lang_fr" },
  { code: "en", flag: "🇬🇧", labelKey: "lang_en" },
  { code: "mo", flag: "🇧🇫", labelKey: "lang_mo" },
  { code: "di", flag: "🇬🇳", labelKey: "lang_di" },
];

const MAIN_NAV = [
  { to: "/", icon: MdHome, key: "nav_home", end: true },
  { to: "/live", icon: MdLiveTv, key: "nav_live_tv" },
  { to: "/clips", icon: MdMusicNote, key: "nav_clips" },
  { to: "/vpn", icon: MdVpnKey, key: "nav_vpn" },
  { to: "/plans", icon: MdStar, key: "nav_plans" },
];

const MORE_NAV = [
  { to: "/movies", icon: MdMovie, key: "nav_movies" },
  { to: "/series", icon: MdVideoLibrary, key: "nav_series" },
  { to: "/search", icon: MdSearch, key: "nav_search" },
  { to: "/promote", icon: MdCampaign, key: "promo_title" },
  { to: "/reseller", icon: MdMonetizationOn, key: "nav_reseller" },
  { to: "/settings", icon: MdSettings, key: "nav_settings" },
];

export default function MobileNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [pendingLang, setPendingLang] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, lang, changeLang } = useTranslation();
  const admin = isAdmin(user);

  const handleLogout = () => { logout(); navigate("/login"); setMenuOpen(false); };

  const requestLangChange = (code) => {
    if (code === lang) { setLangOpen(false); return; }
    setPendingLang(code);
    setLangOpen(false);
  };

  const confirmLangChange = () => {
    changeLang(pendingLang);
    setPendingLang(null);
  };

  const currentLang = LANGS.find((l) => l.code === lang) || LANGS[0];
  const pendingLangInfo = LANGS.find((l) => l.code === pendingLang);

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur border-t border-border z-50">
        <div className="flex">
          {MAIN_NAV.map(({ to, icon: Icon, key, end }) => (
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
              <span>{t(key)}</span>
            </NavLink>
          ))}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 text-xs text-white/50"
          >
            <MdMenu className="text-xl" />
            <span>{t("nav_more")}</span>
          </button>
        </div>
      </nav>

      {/* Slide-up menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMenuOpen(false)} />
          <div className="relative bg-surface border-t border-border rounded-t-2xl p-4 space-y-1 pb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-sm">{t("nav_more")}</p>
              <button onClick={() => setMenuOpen(false)} className="text-white/40 hover:text-white">
                <MdClose className="text-xl" />
              </button>
            </div>

            {MORE_NAV.map(({ to, icon: Icon, key }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <Icon className="text-xl flex-shrink-0" />
                <span className="text-sm font-medium">{t(key)}</span>
              </NavLink>
            ))}

            {admin && (
              <NavLink to="/admin" onClick={() => setMenuOpen(false)} className="sidebar-link text-gold">
                <MdAdminPanelSettings className="text-xl flex-shrink-0 text-gold" />
                <span className="text-sm font-medium">{t("nav_admin")}</span>
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
                  {currentLang.flag} {t(currentLang.labelKey)}
                </span>
              </button>
              {langOpen && (
                <div className="grid grid-cols-2 gap-1 mt-1 px-2">
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => requestLangChange(l.code)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-btn text-sm transition-colors ${lang === l.code ? "bg-gold/20 text-gold font-semibold" : "bg-card text-white/60 hover:text-white"}`}
                    >
                      <span>{l.flag}</span>
                      <span>{t(l.labelKey)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleLogout} className="sidebar-link w-full text-left text-live/70 hover:text-live">
              <MdLogout className="text-xl flex-shrink-0" />
              <span className="text-sm font-medium">{t("nav_logout")}</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal confirmation changement de langue */}
      {pendingLang && pendingLangInfo && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setPendingLang(null)} />
          <div className="relative bg-surface border border-border rounded-card shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-2">{t("lang_confirm_title")}</h3>
            <p className="text-white/60 text-sm mb-6">
              {t("lang_confirm_body")} <span className="text-white font-semibold">{pendingLangInfo.flag} {t(pendingLangInfo.labelKey)}</span>
            </p>
            <div className="flex gap-3">
              <button onClick={confirmLangChange} className="btn-primary flex-1">
                {t("msg_confirm")}
              </button>
              <button onClick={() => setPendingLang(null)} className="btn-outline flex-1">
                {t("btn_cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
