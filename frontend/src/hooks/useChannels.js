import { useState, useEffect } from "react";
import api from "../services/api";

export function useChannels() {
  const [channels, setChannels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/channels/"),
      api.get("/channels/categories/"),
    ])
      .then(([ch, cat]) => {
        setChannels(ch.data.results || ch.data);
        setCategories(cat.data.results || cat.data);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { channels, categories, loading, error };
}

export function useFeaturedChannels() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/channels/featured/")
      .then((r) => setChannels(r.data.results || r.data))
      .finally(() => setLoading(false));
  }, []);

  return { channels, loading };
}
