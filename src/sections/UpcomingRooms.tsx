import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mic, ArrowLeft } from 'lucide-react';
import { api } from '@/services/api';
import type { AudioRoom } from '@/services/api';
import { RoomCard } from '@/components/rooms/RoomCard';

export function UpcomingRooms() {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<AudioRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.getRooms({ status: 'upcoming', limit: 3 }).then(res => {
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

  if (isLoading || rooms.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="py-12 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 mb-2 text-xs text-amber-400">
              <Mic className="w-3.5 h-3.5" />
              <span>{t('rooms.heading')}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-1">
              <span className="gradient-text">{t('rooms.upcomingHeading')}</span>
            </h2>
            <p className="text-sm text-muted-foreground">{t('rooms.upcomingSubtitle')}</p>
          </div>
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 text-sm text-amber-400 hover:underline group"
          >
            {t('rooms.viewAll')}
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(room => (
            <RoomCard key={room._id} room={room} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
