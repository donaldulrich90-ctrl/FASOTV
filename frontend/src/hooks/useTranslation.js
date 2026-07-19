import { useCallback } from "react";
import { useLang } from "../context/LangContext";
import { getTranslation } from "../utils/translations";

// Map les anciens codes langue vers les nouveaux (rétrocompatibilité)
const LANG_MAP = { more: 'mo', dioula: 'di' };

export default function useTranslation() {
  const { lang, changeLang } = useLang();
  const resolvedLang = LANG_MAP[lang] || lang;

  const t = useCallback(
    (key, fallback) => {
      const val = getTranslation(key, resolvedLang);
      return val !== key ? val : (fallback ?? key);
    },
    [resolvedLang]
  );

  return { t, lang, changeLang };
}
