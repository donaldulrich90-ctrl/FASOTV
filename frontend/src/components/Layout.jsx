import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import useTranslation from "../hooks/useTranslation";
import { RadioPlayerProvider, useRadioPlayer } from "../context/RadioPlayerContext";
import { MdRadio, MdPause, MdPlayArrow, MdClose } from "react-icons/md";

function RadioBar() {
  const { station, playing, toggle, stop } = useRadioPlayer();
  if (!station) return null;
  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 md:left-64 right-0 z-40 bg-surface/95 backdrop-blur border-t border-gold/20 px-4 py-2 flex items-center gap-3">
      <MdRadio className="text-gold text-lg flex-shrink-0" />
      <p className="flex-1 text-sm font-medium truncate min-w-0">{station.name}</p>
      <span className={`text-xs flex items-center gap-1 ${playing ? "text-gold" : "text-white/40"}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${playing ? "bg-gold animate-pulse" : "bg-white/30"}`} />
        {playing ? "LIVE" : "Pause"}
      </span>
      <button onClick={toggle} className="w-8 h-8 rounded-full bg-gold text-black flex items-center justify-center flex-shrink-0">
        {playing ? <MdPause className="text-base" /> : <MdPlayArrow className="text-base" />}
      </button>
      <button onClick={stop} className="text-white/30 hover:text-white flex-shrink-0">
        <MdClose className="text-lg" />
      </button>
    </div>
  );
}

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
    <RadioPlayerProvider>
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

      {/* Radio persistent player */}
      <RadioBar />

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
    </RadioPlayerProvider>
  );
}
