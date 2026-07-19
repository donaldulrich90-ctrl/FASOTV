import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import {
  MdPlayArrow, MdPause, MdVolumeUp, MdVolumeOff,
  MdFullscreen, MdFullscreenExit, MdHd, MdSignalCellularAlt,
} from "react-icons/md";

export default function VideoPlayer({ src, title, onNext, onPrev, autoPlay = true }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const containerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [showControls, setShowControls] = useState(true);
  const [buffering, setBuffering] = useState(true);
  const [error, setError] = useState(null);
  const controlsTimer = useRef(null);

  // Init HLS
  useEffect(() => {
    if (!src || !videoRef.current) return;
    setError(null);
    setBuffering(true);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setLevels(data.levels);
        if (autoPlay) video.play().catch(() => {});
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => setCurrentLevel(data.level));

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError("Erreur de lecture du flux. Vérifiez votre connexion.");
          setBuffering(false);
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      if (autoPlay) video.play().catch(() => {});
    } else {
      setError("Votre navigateur ne supporte pas la lecture HLS.");
    }

    return () => {
      hlsRef.current?.destroy();
    };
  }, [src, autoPlay]);

  // Video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onWaiting = () => setBuffering(true);
    const onPlaying = () => setBuffering(false);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
    };
  }, []);

  // Fullscreen change
  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    playing ? v.pause() : v.play();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    v.muted = !muted;
    setMuted(!muted);
  };

  const handleVolume = (e) => {
    const vol = parseFloat(e.target.value);
    videoRef.current.volume = vol;
    setVolume(vol);
    setMuted(vol === 0);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const setQuality = (level) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
      setCurrentLevel(level);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-black w-full aspect-video rounded-card overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <video ref={videoRef} className="w-full h-full" playsInline />

      {/* Buffering spinner */}
      {buffering && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="w-12 h-12 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-center p-4">
          <MdSignalCellularAlt className="text-live text-4xl mb-3" />
          <p className="text-white font-medium mb-1">Erreur de lecture</p>
          <p className="text-white/50 text-sm">{error}</p>
        </div>
      )}

      {/* Title */}
      {title && showControls && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity">
          <p className="font-semibold">{title}</p>
        </div>
      )}

      {/* Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${showControls || !playing ? "opacity-100" : "opacity-0"}`}>
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button onClick={togglePlay} className="text-white hover:text-gold transition-colors">
            {playing ? <MdPause className="text-2xl" /> : <MdPlayArrow className="text-2xl" />}
          </button>

          {/* Prev/Next */}
          {onPrev && (
            <button onClick={onPrev} className="text-white/60 hover:text-white text-sm">◀</button>
          )}
          {onNext && (
            <button onClick={onNext} className="text-white/60 hover:text-white text-sm">▶</button>
          )}

          {/* Volume */}
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="text-white hover:text-gold transition-colors">
              {muted || volume === 0 ? <MdVolumeOff className="text-xl" /> : <MdVolumeUp className="text-xl" />}
            </button>
            <input
              type="range" min="0" max="1" step="0.05"
              value={muted ? 0 : volume}
              onChange={handleVolume}
              className="w-20 accent-gold"
            />
          </div>

          <div className="flex-1" />

          {/* Quality selector */}
          {levels.length > 1 && (
            <div className="relative group/qual">
              <button className="text-white/60 hover:text-white flex items-center gap-1 text-sm">
                <MdHd className="text-base" />
                {currentLevel === -1 ? "Auto" : levels[currentLevel]?.height + "p"}
              </button>
              <div className="absolute bottom-8 right-0 bg-surface border border-border rounded-btn p-1 hidden group-hover/qual:block min-w-[80px] z-10">
                <button
                  onClick={() => setQuality(-1)}
                  className="block w-full text-left px-3 py-1.5 text-sm hover:text-gold"
                >
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
          <button onClick={toggleFullscreen} className="text-white hover:text-gold transition-colors">
            {fullscreen ? <MdFullscreenExit className="text-xl" /> : <MdFullscreen className="text-xl" />}
          </button>
        </div>
      </div>
    </div>
  );
}
