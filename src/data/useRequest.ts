
import { useCallback, useEffect, useRef, useState } from "react";

interface RequestState<T> {
  data: T | null;
  isLoading: boolean;
  error: unknown;
}

/**
 * Runs `fetcher` whenever `key` changes (pass null to skip the request).
 * - reload():  refetch and show the loading state (e.g. "Try Again")
 * - refresh(): refetch quietly, keeping the current data on screen
 * Stale responses from an earlier key are ignored.
 */
export const useRequest = <T>(key: string | null, fetcher: () => Promise<T>) => {
  const [state, setState] = useState<RequestState<T>>({
    data: null,
    isLoading: key !== null,
    error: null,
  });
  const [attempt, setAttempt] = useState(0);
  const silentRef = useRef(false);

  useEffect(() => {
    const silent = silentRef.current;
    silentRef.current = false;

    if (key === null) {
      setState({ data: null, isLoading: false, error: null });
      return;
    }

    let cancelled = false;
    if (!silent) setState({ data: null, isLoading: true, error: null });

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, isLoading: false, error: null });
      })
      .catch((error) => {
        if (cancelled) return;
        // a failed quiet refresh keeps what's already on screen
        setState((prev) =>
          silent ? prev : { data: null, isLoading: false, error }
        );
      });

    return () => {
      cancelled = true;
    };
    // fetcher is recreated every render; key + attempt decide when to refetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  const refresh = useCallback(() => {
    silentRef.current = true;
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, reload, refresh };
};