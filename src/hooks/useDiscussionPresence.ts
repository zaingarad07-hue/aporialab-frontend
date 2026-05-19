import { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '@/services/api';

const HEARTBEAT_INTERVAL_MS = 30_000;
const POLL_INTERVAL_MS = 30_000;

export function useDiscussionPresence(discussionId: string | undefined) {
  const [count, setCount] = useState(0);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (!discussionId || inFlight.current) return;
    inFlight.current = true;
    try {
      const res = await api.getDiscussionsPresence([discussionId]);
      if (res.success) setCount(res.counts[discussionId] || 0);
    } catch {
      // silent: keep last known value
    } finally {
      inFlight.current = false;
    }
  }, [discussionId]);

  useEffect(() => {
    if (!discussionId) return;

    api.sendPresenceHeartbeat(discussionId);
    refresh();

    const heartbeatTimer = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        api.sendPresenceHeartbeat(discussionId);
      }
    }, HEARTBEAT_INTERVAL_MS);

    const pollTimer = window.setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, POLL_INTERVAL_MS);

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        api.sendPresenceHeartbeat(discussionId);
        refresh();
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(heartbeatTimer);
      window.clearInterval(pollTimer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [discussionId, refresh]);

  return { count };
}
