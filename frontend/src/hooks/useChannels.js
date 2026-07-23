import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

export function usePaginatedChannels(search, categoryId) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setPage(1);
    setItems([]);
    setHasMore(false);
  }, [search, categoryId]);

  useEffect(() => {
    let cancelled = false;
    if (page === 1) setLoading(true);
    else setLoadingMore(true);

    const params = { page };
    if (search) params.search = search;
    if (categoryId) params.category = categoryId;

    api.get("/channels/", { params }).then((r) => {
      if (cancelled) return;
      const results = r.data.results || [];
      setItems((prev) => (page === 1 ? results : [...prev, ...results]));
      setHasMore(!!r.data.next);
    }).catch(() => {}).finally(() => {
      if (!cancelled) { setLoading(false); setLoadingMore(false); }
    });

    return () => { cancelled = true; };
  }, [page, search, categoryId]);

  const loadMore = useCallback(() => setPage((p) => p + 1), []);

  return { items, hasMore, loading, loadingMore, loadMore };
}

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
