import { useState, useEffect } from "react";
import api from "../services/api";
import useTranslation from "./useTranslation";

export function useLanguages(type) {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useTranslation();

  useEffect(() => {
    setLoading(true);
    api
      .get("/catalog/languages/", { params: { type, ui_lang: lang } })
      .then((r) => setLanguages(r.data))
      .catch(() => setLanguages([]))
      .finally(() => setLoading(false));
  }, [type, lang]);

  return { languages, loading };
}

export function useGenres(type, langCode) {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!langCode) {
      setGenres([]);
      return;
    }
    setLoading(true);
    api
      .get("/catalog/genres/", { params: { type, lang: langCode } })
      .then((r) => setGenres(r.data))
      .catch(() => setGenres([]))
      .finally(() => setLoading(false));
  }, [type, langCode]);

  return { genres, loading };
}
