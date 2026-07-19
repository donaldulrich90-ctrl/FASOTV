import { createContext, useContext, useState, useCallback } from "react";

const SUPPORTED = ["fr", "en", "mo", "di", "more", "dioula"];

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const stored = localStorage.getItem("fasotv_lang");
  const [lang, setLangState] = useState(SUPPORTED.includes(stored) ? stored : "fr");

  const changeLang = useCallback((newLang) => {
    if (!SUPPORTED.includes(newLang)) return;
    localStorage.setItem("fasotv_lang", newLang);
    setLangState(newLang);
  }, []);

  return (
    <LangContext.Provider value={{ lang, changeLang }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
};
