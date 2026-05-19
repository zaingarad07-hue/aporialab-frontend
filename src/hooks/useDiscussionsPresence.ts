import { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '@/services/api';

const POLL_INTERVAL_MS = 30_000;

export function useDiscussionsPresence(ids: string[]) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const inFlight = useRef(false);
  const idsKey = ids.slice().sort().join(',');

  const refresh = useCallback(async () => {
    if (!idsKey || inFlight.current) return;
    inFlight.current = true;
    try {
      const list = idsKey.split(',').filter(Boolean);
      const res = await api.getDiscussionsPresence(list);
      if (res.success) setCounts(res.counts);
    } catch {
      // silent
    } finally {
      inFlight.current = false;
    }
  }, [idsKey]);

  useEffect(() => {
    if (!idsKey) {
      setCounts({});
      return;
    }
    refresh();
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, POLL_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [idsKey, refresh]);

  return counts;
}
