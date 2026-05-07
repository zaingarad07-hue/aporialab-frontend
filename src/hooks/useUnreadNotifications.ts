import { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const POLL_INTERVAL_MS = 60_000;

export function useUnreadNotifications() {
  const { isAuthenticated } = useAuth();
  const [count, setCount] = useState(0);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || inFlight.current) return;
    inFlight.current = true;
    try {
      const res = await api.getUnreadCount();
      if (res.success) setCount(res.count);
    } catch {
      // silent: keep last known value
    } finally {
      inFlight.current = false;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setCount(0);
      return;
    }
    refresh();
    const interval = window.setInterval(refresh, POLL_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [isAuthenticated, refresh]);

  return { count, refresh, setCount };
}
