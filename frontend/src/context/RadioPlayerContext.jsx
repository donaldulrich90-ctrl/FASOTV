import { createContext, useContext, useState, useRef, useCallback } from "react";

const RadioContext = createContext(null);

export function RadioPlayerProvider({ children }) {
  const audioRef = useRef(null);
  const [station, setStation] = useState(null);
  const [playing, setPlaying] = useState(false);

  const play = useCallback((s) => {
    setStation(s);
    if (audioRef.current) {
      audioRef.current.src = s.stream_url;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  const toggle = useCallback(() => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setStation(null);
    setPlaying(false);
  }, []);

  return (
    <RadioContext.Provider value={{ station, playing, play, toggle, stop }}>
      <audio
        ref={audioRef}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setPlaying(false)}
      />
      {children}
    </RadioContext.Provider>
  );
}

export function useRadioPlayer() {
  return useContext(RadioContext);
}
