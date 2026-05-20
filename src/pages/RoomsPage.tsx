import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';
import { api } from '@/services/api';
import type { AudioRoom } from '@/services/api';
import { RoomCard } from '@/components/rooms/RoomCard';
import { EmptyState } from '@/components/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';

export function RoomsPage() {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<AudioRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = t('rooms.pageTitle');
  }, [t]);

  useEffect(() => {
    let cancelled = false;
    api.getRooms({ status: 'upcoming', limit: 30 }).then(res => {
      if (cancelled) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = res as any;
      const list: AudioRoom[] = r.rooms || r.data?.rooms || [];
      setRooms(list);
      setIsLoading(false);
    }).catch(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 mb-3">
            <Mic className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] font-medium text-amber-400">{t('app.name')}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-1">
            <span className="gradient-text">{t('rooms.heading')}</span>
          </h1>
          <p className="text-sm text-muted-foreground">{t('rooms.subtitle')}</p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-5 rounded-2xl bg-card/60 border border-border/50 space-y-3">
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-20 rounded-full" />
                  <Skeleton className="h-4 w-24 rounded-full" />
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <EmptyState
            icon={Mic}
            title={t('rooms.noUpcoming')}
            description={t('rooms.noUpcomingHint')}
          />
        ) : (
          <div className="space-y-3">
            {rooms.map(room => (
              <RoomCard key={room._id} room={room} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RoomsPage;
