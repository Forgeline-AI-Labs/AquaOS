"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Lightweight data-fetching hook with loading / error / refresh support.
 *
 * @param fetcher  Async function that returns the data.
 * @param pollMs   Optional polling interval in milliseconds. Pass 0 to disable.
 */
export function useApi<T>(fetcher: () => Promise<T>, pollMs = 0) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  // Keep the fetcher ref stable so callers don't need to memoize.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(async () => {
    try {
      const result = await fetcherRef.current();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    if (pollMs > 0) {
      const id = setInterval(load, pollMs);
      return () => clearInterval(id);
    }
  }, [load, pollMs]);

  return { data, error, loading, refresh: load } as const;
}
