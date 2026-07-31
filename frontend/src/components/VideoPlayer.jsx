import { useEffect, useRef, useState, useCallback } from "react";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import Hls from "hls.js";
import {
  MdPlayArrow, MdPause, MdVolumeUp, MdVolumeOff,
  MdFullscreen, MdFullscreenExit, MdHd, MdReplay, MdSignalCellularAlt,
  MdReplay10, MdForward10, MdSkipNext, MdSkipPrevious,
} from "react-icons/md";
import useTranslation from "../hooks/useTranslation";

const STREAM_RE = /\/(live|movie|series)\/[^/]+\/[^/]+\/(\d+)\.(m3u8|mp4|mkv|ts|avi)/;

function PlayerBtn({ onClick, onFocus, children, className = '' }) {
  const { ref, focused } = useFocusable({ onEnterPress: onClick, onFocus });
  return (
    <div
      ref={ref}
      className={`inline-flex items-center justify-center ${focused ? 'ring-2 ring-gold rounded-full shadow-md shadow-gold/40 scale-110' : ''} outline-none transition-all duration-150`}
    >
      <button onClick={onClick} tabIndex={-1} className={className}>
        {children}
      </button>
    </div>
  );
}

function PlayerSeekBar({ barRef, onProgressDown, onSeekBy, onFocus, progressPct, bufferedPct }) {
  const { ref, focused } = useFocusable({
    onFocus,
    onArrowPress: (dir) => {
      if (dir === 'left') { onSeekBy(-10); return false; }
      if (dir === 'right') { onSeekBy(10); return false; }
      return true;
    },
  });
  return (
    <div
      ref={ref}
      className={`mb-2 rounded ${focused ? 'ring-2 ring-gold' : ''} outline-none transition-all`}
    >
      <div
        ref={barRef}
        onMouseDown={onProgressDown}
        onTouchStart={onProgressDown}
        className="relative h-3 flex items-center cursor-pointer group/bar touch-manipulation"
      >
        <div className="absolute left-0 right-0 h-1 bg-white/20 rounded-full" />
        <div className="absolute left-0 h-1 bg-white/30 rounded-full" style={{ width: `${bufferedPct}%` }} />
        <div className="absolute left-0 h-1 bg-gold rounded-full" style={{ width: `${progressPct}%` }} />
        <div
          className="absolute w-3 h-3 bg-gold rounded-full -ml-1.5 opacity-0 group-hover/bar:opacity-100 transition-opacity"
          style={{ left: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}

function getProxyUrl(url) {
  if (!url) return "";
  let m = url.match(STREAM_RE);
  if (!m) {
    m = url.match(/\/(live|movie|series)\/.*?\/(\d+)\.(\w+)/);
  }
  if (!m) return url;
  const type = m[1];
  const id = m[2];
  const ext = m[3];
  if (type === "live") {
    return `/api/xtream/proxy/${id}/?type=live&t=${Date.now()}`;
  }
  return `/api/xtream/vod/${id}/?type=${type}&ext=${ext}`;
}

function fmtTime(sec) {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const ss = String(s).padStart(2, "0");
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${ss}`;
  return `${m}:${ss}`;
}

export default function VideoPlayer({ src, title, onNext, onPrev, autoPlay = true }) {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const containerRef = useRef(null);
  const tapTimerRef = useRef(null);
  const touchStartRef = useRef(null);
  const controlsTimerRef = useRef(null);
  const progressRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [showControls, setShowControls] = useState(true);
  const [buffering, setBuffering] = useState(true);
  const [error, setError] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [bandwidth, setBandwidth] = useState(0);
  const [seekHint, setSeekHint] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [dragging, setDragging] = useState(false);

  const proxyUrl = src ? getProxyUrl(src) : "";
  const isVOD = proxyUrl.includes("/api/xtream/vod/");
  const isLive = proxyUrl.includes("/api/xtream/proxy/");

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

  const seekBy = useCallback((delta) => {
    const v = videoRef.current;
    if (!v || !isFinite(v.duration)) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + delta));
    setSeekHint(delta > 0 ? `+${delta}s` : `${delta}s`);
    setTimeout(() => setSeekHint(null), 700);
    showCtrlsBriefly();
  }, [showCtrlsBriefly]);

  useEffect(() => {
    setError(false);
    setUnavailable(false);
    setBuffering(true);
    setCurrentTime(0);
    setDuration(0);
    setBufferedEnd(0);
    if (isVOD) {
      const video = videoRef.current;
      if (!video) return;
      let done = false;
      const timer = setTimeout(() => {
        if (!done && video.readyState < 2 && video.currentTime === 0) {
          setUnavailable(true);
          setBuffering(false);
        }
      }, 15000);
      const clear = () => { done = true; clearTimeout(timer); };
      video.addEventListener("loadeddata", clear);
      video.addEventListener("playing", clear);
      return () => {
        clearTimeout(timer);
        video.removeEventListener("loadeddata", clear);
        video.removeEventListener("playing", clear);
      };
    }
  }, [src, retryKey, isVOD]);

  useEffect(() => {
    if (!src || isVOD) return;
    const video = videoRef.current;
    if (!video) return;
    const url = getProxyUrl(src);
    let retries = 0;
    let destroyed = false;

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
      video.src = url;
      if (autoPlay) video.play().catch(() => {});
    } else {
      setError(true);
      setBuffering(false);
    }

    return () => {
      destroyed = true;
      if (hlsRef.current) {
        hlsRef.current.stopLoad();
        hlsRef.current.detachMedia();
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoPlay, retryKey, isVOD]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onWaiting = () => setBuffering(true);
    const onPlaying = () => setBuffering(false);
    const onTimeUpdate = () => {
      if (!dragging) setCurrentTime(v.currentTime);
      try {
        if (v.buffered.length) setBufferedEnd(v.buffered.end(v.buffered.length - 1));
      } catch (_) {}
    };
    const onLoadedMeta = () => setDuration(v.duration || 0);
    const onDurationChange = () => setDuration(v.duration || 0);
    const onEnded = () => { if (onNext) onNext(); };

    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("waiting", onWaiting);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("loadedmetadata", onLoadedMeta);
    v.addEventListener("durationchange", onDurationChange);
    v.addEventListener("ended", onEnded);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("waiting", onWaiting);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("loadedmetadata", onLoadedMeta);
      v.removeEventListener("durationchange", onDurationChange);
      v.removeEventListener("ended", onEnded);
    };
  }, [src, dragging, onNext]);

  useEffect(() => {
    const h = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const v = videoRef.current;
      if (!v) return;
      switch (e.key) {
        case " ": case "k":
          e.preventDefault(); v.paused ? v.play() : v.pause(); break;
        case "f": case "F":
          e.preventDefault(); toggleFullscreen(); break;
        case "n": case "N":
          e.preventDefault(); if (onNext) onNext(); break;
        case "p": case "P":
          e.preventDefault(); if (onPrev) onPrev(); break;
        case "Escape":
          if (document.fullscreenElement) document.exitFullscreen(); break;
        default: return;
      }
      showCtrlsBriefly();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onNext, onPrev, toggleFullscreen, showCtrlsBriefly, seekBy]);

  const seekToClientX = useCallback((clientX) => {
    const bar = progressRef.current;
    const v = videoRef.current;
    if (!bar || !v || !isFinite(v.duration)) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newTime = ratio * v.duration;
    setCurrentTime(newTime);
    v.currentTime = newTime;
  }, []);

  const onProgressDown = (e) => {
    if (isLive) return;
    setDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    seekToClientX(clientX);
  };

  useEffect(() => {
    if (!dragging) return;
    const move = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      seekToClientX(clientX);
    };
    const up = () => setDragging(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, [dragging, seekToClientX]);

  const handleTouchStart = (e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      t: Date.now(),
    };
    showCtrlsBriefly();
  };

  const handleTouchEnd = (e) => {
    const start = touchStartRef.current;
    if (!start) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;

    if (Math.abs(dx) < 15 && Math.abs(dy) < 15) {
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
        tapTimerRef.current = null;
        const rect = containerRef.current.getBoundingClientRect();
        const fwd = touch.clientX > rect.left + rect.width / 2;
        seekBy(fwd ? 10 : -10);
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

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (bufferedEnd / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative bg-black w-full aspect-video rounded-card overflow-hidden select-none"
      onMouseMove={showCtrlsBriefly}
      onMouseLeave={() => !dragging && setShowControls(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        playsInline
        src={isVOD ? proxyUrl : undefined}
        autoPlay={isVOD ? autoPlay : undefined}
        onError={() => { if (isVOD) { setUnavailable(true); setBuffering(false); } }}
        onLoadedData={() => { if (isVOD) setBuffering(false); }}
        onPlaying={() => { if (isVOD) setBuffering(false); }}
        onWaiting={() => { if (isVOD) setBuffering(true); }}
      />

      {buffering && !error && !unavailable && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 pointer-events-none gap-3">
          <div className="w-12 h-12 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
          <p className="text-white/70 text-sm">{t("player_buffering")}</p>
        </div>
      )}

      {seekHint && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white text-3xl font-bold bg-black/60 rounded-2xl px-5 py-2">{seekHint}</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 text-center p-4">
          <MdSignalCellularAlt className="text-live text-4xl mb-3" />
          <p className="text-white font-semibold mb-1">Erreur de lecture</p>
          <p className="text-white/50 text-sm mb-4">Verifiez votre connexion ou reessayez</p>
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gold text-black rounded-btn font-semibold text-sm"
          >
            <MdReplay /> Reessayer
          </button>
        </div>
      )}

      {unavailable && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 text-center p-4">
          <MdSignalCellularAlt className="text-white/30 text-4xl mb-3" />
          <p className="text-white font-semibold">{t("player_vod_unavailable")}</p>
        </div>
      )}

      {title && showControls && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity">
          <p className="font-semibold">{title}</p>
        </div>
      )}

      {/* Center controls: prev / -10 / play / +10 / next (VOD only) */}
      {isVOD && showControls && !error && !unavailable && (
        <div className="absolute inset-0 flex items-center justify-center gap-6 pointer-events-none">
          {onPrev && (
            <PlayerBtn onClick={onPrev} onFocus={showCtrlsBriefly} className="pointer-events-auto text-white/80 hover:text-white bg-black/40 rounded-full p-2 touch-manipulation">
              <MdSkipPrevious className="text-3xl" />
            </PlayerBtn>
          )}
          <PlayerBtn onClick={() => seekBy(-10)} onFocus={showCtrlsBriefly} className="pointer-events-auto text-white/80 hover:text-white bg-black/40 rounded-full p-2 touch-manipulation">
            <MdReplay10 className="text-3xl" />
          </PlayerBtn>
          <PlayerBtn
            onClick={() => { const v = videoRef.current; v && (v.paused ? v.play().catch(() => {}) : v.pause()); }}
            onFocus={showCtrlsBriefly}
            className="pointer-events-auto bg-gold/90 hover:bg-gold rounded-full p-3 touch-manipulation"
          >
            {playing ? <MdPause className="text-4xl text-black" /> : <MdPlayArrow className="text-4xl text-black" />}
          </PlayerBtn>
          <PlayerBtn onClick={() => seekBy(10)} onFocus={showCtrlsBriefly} className="pointer-events-auto text-white/80 hover:text-white bg-black/40 rounded-full p-2 touch-manipulation">
            <MdForward10 className="text-3xl" />
          </PlayerBtn>
          {onNext && (
            <PlayerBtn onClick={onNext} onFocus={showCtrlsBriefly} className="pointer-events-auto text-white/80 hover:text-white bg-black/40 rounded-full p-2 touch-manipulation">
              <MdSkipNext className="text-3xl" />
            </PlayerBtn>
          )}
        </div>
      )}

      {/* Bottom controls bar */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 pb-3 pt-6 transition-opacity duration-300 ${showControls || !playing ? "opacity-100" : "opacity-0"}`}>

        {isVOD && (
          <PlayerSeekBar
            barRef={progressRef}
            onProgressDown={onProgressDown}
            onSeekBy={seekBy}
            onFocus={showCtrlsBriefly}
            progressPct={progressPct}
            bufferedPct={bufferedPct}
          />
        )}

        <div className="flex items-center gap-3">

          <PlayerBtn
            onClick={() => { const v = videoRef.current; v && (v.paused ? v.play().catch(() => {}) : v.pause()); }}
            onFocus={showCtrlsBriefly}
            className="text-white hover:text-gold transition-colors touch-manipulation"
          >
            {playing ? <MdPause className="text-2xl" /> : <MdPlayArrow className="text-2xl" />}
          </PlayerBtn>

          {isVOD && (
            <span className="text-white/80 text-xs tabular-nums">
              {fmtTime(currentTime)} / {fmtTime(duration)}
            </span>
          )}

          {isLive && (
            <span className="flex items-center gap-1.5 text-xs text-white/80">
              <span className="w-2 h-2 bg-live rounded-full animate-pulse" /> LIVE
            </span>
          )}

          <div className="flex items-center gap-2">
            <PlayerBtn
              onClick={() => { const v = videoRef.current; if (v) { v.muted = !muted; setMuted(!muted); } }}
              onFocus={showCtrlsBriefly}
              className="text-white hover:text-gold transition-colors touch-manipulation"
            >
              {muted || volume === 0
                ? <MdVolumeOff className="text-xl" />
                : <MdVolumeUp className="text-xl" />}
            </PlayerBtn>
            <input
              type="range" min="0" max="1" step="0.05"
              value={muted ? 0 : volume}
              onChange={handleVolume}
              className="w-20 accent-gold hidden md:block"
            />
          </div>

          <div className="flex-1" />

          {bandwidth > 0 && (
            <span className="text-white/40 text-xs hidden md:inline">
              {bandwidth >= 1000 ? `${(bandwidth / 1000).toFixed(1)} Mb/s` : `${bandwidth} kb/s`}
            </span>
          )}

          {levels.length > 1 && (
            <div className="relative group/qual">
              <PlayerBtn
                onClick={() => {}}
                onFocus={showCtrlsBriefly}
                className="text-white/60 hover:text-white flex items-center gap-1 text-sm touch-manipulation"
              >
                <MdHd className="text-base" />
                {currentLevel === -1 ? "Auto" : `${levels[currentLevel]?.height}p`}
              </PlayerBtn>
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

          <PlayerBtn onClick={toggleFullscreen} onFocus={showCtrlsBriefly} className="text-white hover:text-gold transition-colors touch-manipulation">
            {fullscreen
              ? <MdFullscreenExit className="text-xl" />
              : <MdFullscreen className="text-xl" />}
          </PlayerBtn>

        </div>
      </div>
    </div>
  );
}
