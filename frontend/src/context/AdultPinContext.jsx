import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../services/api";

const STORAGE_KEY = "adult_unlocked_until";
const UNLOCK_MS = 30 * 60 * 1000;

const AdultPinContext = createContext(null);

export function AdultPinProvider({ children }) {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    const until = Number(localStorage.getItem(STORAGE_KEY));
    return until > Date.now();
  });

  // Re-check every minute so the UI locks automatically when session expires
  useEffect(() => {
    const iv = setInterval(() => {
      const until = Number(localStorage.getItem(STORAGE_KEY));
      setIsUnlocked(until > Date.now());
    }, 60_000);
    return () => clearInterval(iv);
  }, []);

  const unlock = useCallback(() => {
    const until = Date.now() + UNLOCK_MS;
    localStorage.setItem(STORAGE_KEY, String(until));
    setIsUnlocked(true);
  }, []);

  const lock = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEY);
    setIsUnlocked(false);
    try { await api.post("/accounts/adult-pin/lock/"); } catch {}
  }, []);

  return (
    <AdultPinContext.Provider value={{ isUnlocked, unlock, lock }}>
      {children}
    </AdultPinContext.Provider>
  );
}

export function useAdultPin() {
  return useContext(AdultPinContext);
}
