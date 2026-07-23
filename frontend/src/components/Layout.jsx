import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import useTranslation from "../hooks/useTranslation";

export default function Layout() {
  const { t } = useTranslation();
  const [installPrompt, setInstallPrompt] = useState(null);
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setBannerVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setBannerVisible(false);
      setInstallPrompt(null);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <MobileNav />

      {/* PWA Install Banner */}
      {bannerVisible && (
        <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-[100] bg-surface border border-gold/40 rounded-card shadow-2xl shadow-black/60 p-4 flex items-center gap-3 animate-fade-in">
          <div className="flex-1">
            <button
              onClick={handleInstall}
              className="btn-primary w-full text-sm font-semibold"
            >
              {t("pwa_install")}
            </button>
          </div>
          <button
            onClick={() => setBannerVisible(false)}
            className="text-white/40 hover:text-white text-xl leading-none flex-shrink-0"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
