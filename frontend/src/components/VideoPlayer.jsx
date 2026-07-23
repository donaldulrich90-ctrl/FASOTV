import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import {
  MdPlayArrow, MdPause, MdVolumeUp, MdVolumeOff,
  MdFullscreen, MdFullscreenExit, MdHd, MdReplay, MdSignalCellularAlt,
} from "react-icons/md";
import useTranslation from "../hooks/useTranslation";

const LIVE_RE = /\/live\/[^/]+\/[^/]+\/(\d+)\.m3u8/;

function getProxyUrl(url) {
  if (!url) return "";
  const m = url.match(LIVE_RE);
  return m ? `/api/xtream/proxy/${m[1]}/` : url;
}

export default function VideoPlayer({ src, title, onNext, onPrev, autoPlay = true }) {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const containerRef = useRef(null);
  const tapTimerRef = useRef(null);
  const touchStartRef = useRef(null);
  const controlsTimerRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [showControls, setShowControls] = useState(true);
  const [buffering, setBuffering] = useState(true);
  const [error, setError] = useState(false);
  const [bandwidth, setBandwidth] = useState(0);
  const [seekHint, setSeekHint] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  const showCtrlsBriefly = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
        await screen.orientation?.lock("landscape").catch(() => {});
      } else {
        await document.exitFullscreen();
        screen.orientation?.unlock();
      }
    } catch (_) {}
  }, []);

  // HLS / native init
  useEffect(() => {
    if (!src || !videoRef.current) return;
    const url = getProxyUrl(src);
    const video = videoRef.current;
    let retries = 0;
    let destroyed = false;

    setError(false);
    setBuffering(true);
    setLevels([]);
    setCurrentLevel(-1);
    setBandwidth(0);

    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 60,
        maxMaxBufferLength: 120,
        maxBufferSize: 120 * 1000 * 1000,
        liveSyncDurationCount: 6,
        liveMaxLatencyDurationCount: 15,
        manifestLoadingTimeOut: 20000,
        manifestLoadingMaxRetry: 4,
        levelLoadingTimeOut: 20000,
        fragLoadingTimeOut: 60000,
        fragLoadingMaxRetry: 6,
        fragLoadingRetryDelay: 1000,
        startLevel: -1,
        abrEwmaDefaultEstimate: 1000000,
        lowLatencyMode: false,
      });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, d) => {
        setLevels(d.levels);
        if (autoPlay) video.play().catch(() => {});
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, d) => setCurrentLevel(d.level));

      hls.on(Hls.Events.FRAG_LOADED, (_, d) => {
        const bw = d.frag.stats.bwEstimate;
        if (bw) setBandwidth(Math.round(bw / 1000));
      });

      hls.on(Hls.Events.BUFFER_EMPTIED, () => setBuffering(true));

      hls.on(Hls.Events.ERROR, (_, d) => {
        if (d.fatal) {
          if (retries < 3) {
            retries++;
            setTimeout(() => {
              if (!destroyed) { hls.loadSource(url); hls.startLoad(); }
            }, retries * 2000);
          } else {
            setError(true);
            setBuffering(false);
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari / iOS native HLS
      video.src = url;
      if (autoPlay) video.play().catch(() => {});
    } else {
      setError(true);
      setBuffering(false);
    }

    return () => {
      destroyed = true;
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [src, autoPlay, retryKey]);

  // Video element events
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const h = {
      play: () => setPlaying(true),
      pause: () => setPlaying(false),
      waiting: () => setBuffering(true),
      playing: () => setBuffering(false),
    };
    Object.entries(h).forEach(([e, fn]) => v.addEventListener(e, fn));
    return () => Object.entries(h).forEach(([e, fn]) => v.removeEventListener(e, fn));
  }, []);

  // Fullscreen event
  useEffect(() => {
    const h = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  // Keyboard — desktop + TV remote
  useEffect(() => {
    const onKey = (e) => {
      const v = videoRef.current;
      if (!v) return;
      switch (e.key) {
        case " ": case "k":
          e.preventDefault(); v.paused ? v.play() : v.pause(); break;
        case "f": case "F":
          e.preventDefault(); toggleFullscreen(); break;
        case "ArrowLeft":
          e.preventDefault(); v.currentTime = Math.max(0, v.currentTime - 10); break;
        case "ArrowRight":
          e.preventDefault(); v.currentTime += 10; break;
        case "ArrowUp":
          e.preventDefault(); if (onPrev) onPrev(); break;
        case "ArrowDown":
          e.preventDefault(); if (onNext) onNext(); break;
        case "Escape":
          if (document.fullscreenElement) document.exitFullscreen(); break;
        default: return;
      }
      showCtrlsBriefly();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onNext, onPrev, toggleFullscreen, showCtrlsBriefly]);

  // Touch start — record position for swipe detection
  const handleTouchStart = (e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      t: Date.now(),
    };
    showCtrlsBriefly();
  };

  // Touch end — swipe (channel) or tap (play) or double-tap (seek)
  const handleTouchEnd = (e) => {
    const start = touchStartRef.current;
    if (!start) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const dt = Date.now() - start.t;

    // Horizontal swipe → channel change
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 2 && dt < 400) {
      if (dx > 0 && onPrev) { onPrev(); return; }
      if (dx < 0 && onNext) { onNext(); return; }
    }

    // Tap with minimal movement
    if (Math.abs(dx) < 15 && Math.abs(dy) < 15) {
      if (tapTimerRef.current) {
        // Double-tap → seek ±10s
        clearTimeout(tapTimerRef.current);
        tapTimerRef.current = null;
        const rect = containerRef.current.getBoundingClientRect();
        const fwd = touch.clientX > rect.left + rect.width / 2;
        const v = videoRef.current;
        if (v && isFinite(v.duration)) {
          v.currentTime = Math.max(0, v.currentTime + (fwd ? 10 : -10));
        }
        setSeekHint(fwd ? "+10s" : "-10s");
        setTimeout(() => setSeekHint(null), 700);
      } else {
        tapTimerRef.current = setTimeout(() => {
          tapTimerRef.current = null;
          const v = videoRef.current;
          if (v) v.paused ? v.play().catch(() => {}) : v.pause();
        }, 250);
      }
    }
  };

  const handleVolume = (e) => {
    const vol = parseFloat(e.target.value);
    videoRef.current.volume = vol;
    setVolume(vol);
    setMuted(vol === 0);
  };

  const setQuality = (lvl) => {
    if (hlsRef.current) { hlsRef.current.currentLevel = lvl; setCurrentLevel(lvl); }
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-black w-full aspect-video rounded-card overflow-hidden select-none"
      onMouseMove={showCtrlsBriefly}
      onMouseLeave={() => setShowControls(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <video ref={videoRef} className="w-full h-full" playsInline />

      {/* Buffering spinner + label */}
      {buffering && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 pointer-events-none gap-3">
          <div className="w-12 h-12 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
          <p className="text-white/70 text-sm">{t("player_buffering")}</p>
        </div>
      )}

      {/* Double-tap seek feedback */}
      {seekHint && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white text-3xl font-bold bg-black/60 rounded-2xl px-5 py-2">{seekHint}</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 text-center p-4">
          <MdSignalCellularAlt className="text-live text-4xl mb-3" />
          <p className="text-white font-semibold mb-1">Erreur de lecture</p>
          <p className="text-white/50 text-sm mb-4">Vérifiez votre connexion ou réessayez</p>
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gold text-black rounded-btn font-semibold text-sm"
          >
            <MdReplay /> Réessayer
          </button>
        </div>
      )}

      {/* Title bar */}
      {title && showControls && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity">
          <p className="font-semibold">{title}</p>
        </div>
      )}

      {/* Controls bar */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${showControls || !playing ? "opacity-100" : "opacity-0"}`}>
        <div className="flex items-center gap-3">

          {/* Play / Pause */}
          <button
            onClick={() => { const v = videoRef.current; v && (v.paused ? v.play().catch(() => {}) : v.pause()); }}
            className="text-white hover:text-gold transition-colors touch-manipulation"
          >
            {playing
              ? <MdPause className="text-3xl md:text-2xl" />
              : <MdPlayArrow className="text-3xl md:text-2xl" />}
          </button>

          {/* Prev / Next */}
          {onPrev && (
            <button onClick={onPrev} className="text-white/60 hover:text-white touch-manipulation px-1 text-lg">◀</button>
          )}
          {onNext && (
            <button onClick={onNext} className="text-white/60 hover:text-white touch-manipulation px-1 text-lg">▶</button>
          )}

          {/* Volume */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { const v = videoRef.current; if (v) { v.muted = !muted; setMuted(!muted); } }}
              className="text-white hover:text-gold transition-colors touch-manipulation"
            >
              {muted || volume === 0
                ? <MdVolumeOff className="text-2xl md:text-xl" />
                : <MdVolumeUp className="text-2xl md:text-xl" />}
            </button>
            <input
              type="range" min="0" max="1" step="0.05"
              value={muted ? 0 : volume}
              onChange={handleVolume}
              className="w-20 accent-gold hidden md:block"
            />
          </div>

          <div className="flex-1" />

          {/* Bandwidth (desktop only) */}
          {bandwidth > 0 && (
            <span className="text-white/40 text-xs">
              {bandwidth >= 1000 ? `${(bandwidth / 1000).toFixed(1)} Mb/s` : `${bandwidth} kb/s`}
            </span>
          )}

          {/* Quality selector */}
          {levels.length > 1 && (
            <div className="relative group/qual">
              <button className="text-white/60 hover:text-white flex items-center gap-1 text-sm touch-manipulation">
                <MdHd className="text-base" />
                {currentLevel === -1 ? "Auto" : `${levels[currentLevel]?.height}p`}
              </button>
              <div className="absolute bottom-8 right-0 bg-surface border border-border rounded-btn p-1 hidden group-hover/qual:block min-w-[80px] z-10">
                <button onClick={() => setQuality(-1)} className="block w-full text-left px-3 py-1.5 text-sm hover:text-gold">
                  Auto
                </button>
                {levels.map((l, i) => (
                  <button
                    key={i}
                    onClick={() => setQuality(i)}
                    className={`block w-full text-left px-3 py-1.5 text-sm hover:text-gold ${currentLevel === i ? "text-gold" : ""}`}
                  >
                    {l.height}p
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fullscreen */}
          <button onClick={toggleFullscreen} className="text-white hover:text-gold transition-colors touch-manipulation">
            {fullscreen
              ? <MdFullscreenExit className="text-2xl md:text-xl" />
              : <MdFullscreen className="text-2xl md:text-xl" />}
          </button>

        </div>
      </div>
    </div>
  );
}
