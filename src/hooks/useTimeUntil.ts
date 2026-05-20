import { useEffect, useState } from 'react';
import { formatDistance, formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

function getLocale(lang: string) {
  return lang.startsWith('ar') ? ar : enUS;
}

export function useTimeUntil(dateString: string | undefined, lang: string): string {
  const computeLabel = () => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return formatDistanceToNow(d, { addSuffix: true, locale: getLocale(lang) });
  };

  const [label, setLabel] = useState(computeLabel);

  useEffect(() => {
    setLabel(computeLabel());
    if (!dateString) return;
    const interval = window.setInterval(() => {
      setLabel(computeLabel());
    }, 60_000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateString, lang]);

  return label;
}

export function formatTimeUntil(dateString: string, lang: string): string {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  return formatDistance(d, new Date(), { addSuffix: true, locale: getLocale(lang) });
}
