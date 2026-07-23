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
  { code: "fr", flag: "🇫🇷", labelKey: "lang_fr" },
  { code: "en", flag: "🇬🇧", labelKey: "lang_en" },
  { code: "mo", flag: "🇧🇫", labelKey: "lang_mo" },
  { code: "di", flag: "🇬🇳", labelKey: "lang_di" },
];

const NAV_ITEMS = [
  { to: "/", icon: MdHome, key: "nav_home", end: true },
  { to: "/live", icon: MdLiveTv, key: "nav_live_tv" },
  { to: "/movies", icon: MdMovie, key: "nav_movies" },
  { to: "/series", icon: MdVideoLibrary, key: "nav_series" },
  { to: "/clips", icon: MdMusicNote, key: "nav_clips" },
  { to: "/vpn", icon: MdVpnKey, key: "nav_vpn" },
  { to: "/plans", icon: MdStar, key: "nav_plans" },
  { to: "/reseller", icon: MdMonetizationOn, key: "nav_reseller" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, lang, changeLang } = useTranslation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [pendingLang, setPendingLang] = useState(null);
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
                  <p className="text-xs text-white/40">{t("plans_subscribe")}</p>
                )}
              </div>
              <MdKeyboardArrowDown className={`text-white/40 flex-shrink-0 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {profileOpen && (
              <div className="absolute left-4 right-4 top-full mt-1 bg-surface border border-border rounded-card shadow-xl shadow-black/50 z-50 py-1">
                <NavLink to="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-card transition-colors">
                  <MdPerson className="text-white/40" /> {t("nav_account")}
                </NavLink>
                <NavLink to="/vpn" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-card transition-colors">
                  <MdVpnKey className="text-blue-400" /> {t("vpn_my")}
                </NavLink>
                <NavLink to="/favorites" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-card transition-colors">
                  <MdFavorite className="text-live/70" /> {t("msg_favorites")}
                </NavLink>
                <NavLink to="/promote" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-card transition-colors">
                  <MdCampaign className="text-purple-400" /> {t("promo_title")}
                </NavLink>
                {admin && (
                  <NavLink to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-card text-gold transition-colors">
                    <MdAdminPanelSettings className="text-gold" /> {t("nav_admin")}
                  </NavLink>
                )}
                <div className="border-t border-border my-1" />
                <NavLink to="/become-reseller" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-card transition-colors text-white/60">
                  <MdMonetizationOn className="text-success/70" /> {t("reseller_become")}
                </NavLink>
                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-card text-live/70 transition-colors w-full text-left">
                  <MdLogout /> {t("nav_logout")}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, key, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            >
              <Icon className="text-xl flex-shrink-0" />
              <span className="text-sm font-medium">{t(key)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-4 space-y-1 border-t border-border pt-3">
          <NavLink to="/search" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <MdSearch className="text-xl flex-shrink-0" />
            <span className="text-sm font-medium">{t("nav_search")}</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
            <MdSettings className="text-xl flex-shrink-0" />
            <span className="text-sm font-medium">{t("nav_settings")}</span>
          </NavLink>

          {/* Language selector */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="sidebar-link w-full text-left"
            >
              <MdLanguage className="text-xl flex-shrink-0 text-white/60" />
              <span className="text-sm font-medium flex-1">
                {currentLang.flag} {t(currentLang.labelKey)}
              </span>
              <MdKeyboardArrowDown className={`text-white/40 text-sm transition-transform ${langOpen ? "rotate-180" : ""}`} />
            </button>
            {langOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-surface border border-border rounded-card shadow-xl z-50 py-1 overflow-hidden">
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => requestLangChange(l.code)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-card transition-colors text-left ${lang === l.code ? "text-gold font-semibold" : "text-white/70"}`}
                  >
                    <span>{l.flag}</span>
                    <span>{t(l.labelKey)}</span>
                    {lang === l.code && <span className="ml-auto text-gold text-xs">✓</span>}
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
              <button
                onClick={confirmLangChange}
                className="btn-primary flex-1"
              >
                {t("msg_confirm")}
              </button>
              <button
                onClick={() => setPendingLang(null)}
                className="btn-outline flex-1"
              >
                {t("btn_cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
