import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { isAdmin } from "../../utils/store";
import {
  MdDashboard, MdStar, MdVpnKey, MdCampaign, MdPeople,
  MdMonetizationOn, MdMusicVideo, MdSettings, MdArrowBack,
  MdMenu, MdClose, MdTv,
} from "react-icons/md";

const SECTIONS = [
  { id: "dashboard", icon: MdDashboard, label: "Dashboard" },
  { id: "plans_iptv", icon: MdStar, label: "Forfaits IPTV" },
  { id: "plans_vpn", icon: MdVpnKey, label: "Forfaits VPN" },
  { id: "plans_promo", icon: MdCampaign, label: "Tarifs Promo" },
  { id: "users", icon: MdPeople, label: "Utilisateurs" },
  { id: "resellers", icon: MdMonetizationOn, label: "Revendeurs" },
  { id: "clips", icon: MdMusicVideo, label: "Clips & Promos" },
  { id: "settings", icon: MdSettings, label: "Paramètres serveur" },
];

export default function AdminLayout({ section, onSection, children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAdmin(user)) {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4 text-center p-6">
        <MdTv className="text-gold text-5xl" />
        <h2 className="text-xl font-bold">Accès refusé</h2>
        <p className="text-white/40 text-sm">Cette section est réservée à l'administrateur.</p>
        <button onClick={() => navigate("/")} className="btn-primary">Retour à l'accueil</button>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
        <MdTv className="text-gold text-2xl" />
        <div>
          <span className="text-gold font-black text-lg">FASO</span>
          <span className="text-white font-black text-lg"> TV</span>
          <p className="text-white/30 text-xs -mt-0.5">Administration</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {SECTIONS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => { onSection(id); setMobileOpen(false); }}
            className={`sidebar-link w-full text-left ${section === id ? "active" : ""}`}
          >
            <Icon className="text-xl flex-shrink-0" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </nav>

      <div className="px-3 pb-4 border-t border-border pt-3">
        <button
          onClick={() => navigate("/")}
          className="sidebar-link w-full text-left text-white/40"
        >
          <MdArrowBack className="text-xl flex-shrink-0" />
          <span className="text-sm font-medium">Retour au site</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-surface border-r border-border">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-surface border-r border-border">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-surface sticky top-0 z-10">
          <button onClick={() => setMobileOpen(true)} className="text-white/60 hover:text-white">
            <MdMenu className="text-2xl" />
          </button>
          <span className="font-semibold text-sm">
            {SECTIONS.find((s) => s.id === section)?.label || "Admin"}
          </span>
        </div>
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
