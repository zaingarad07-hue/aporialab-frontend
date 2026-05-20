import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CalendarClock, Mic, Users, Sparkles } from 'lucide-react';
import type { AudioRoom } from '@/services/api';
import { useTimeUntil } from '@/hooks/useTimeUntil';

interface RoomCardProps {
  room: AudioRoom;
}

const statusStyle: Record<string, string> = {
  scheduled: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  live: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  ended: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export function RoomCard({ room }: RoomCardProps) {
  const { t, i18n } = useTranslation();
  const whenLabel = useTimeUntil(room.scheduledAt, i18n.language);

  const host = room.host;
  const hostInitial = host?.name ? host.name.charAt(0) : '?';
  const isFounder = !!host?.isFoundingMember;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
    >
      <Link
        to={`/rooms/${room._id}`}
        className="group block p-5 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-sm hover:border-amber-500/40 hover:shadow-[0_8px_30px_-12px_rgba(251,191,36,0.25)] transition-colors"
      >
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full border ${statusStyle[room.status] || statusStyle.scheduled}`}>
            {room.status === 'live' && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
            )}
            {t(`rooms.status.${room.status}`)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <CalendarClock className="w-3 h-3" />
            {room.status === 'live' && room.startedAt
              ? t('rooms.startedAt', { when: whenLabel })
              : t('rooms.startsIn', { when: whenLabel })}
          </span>
        </div>

        <h3 className="text-base md:text-lg font-bold mb-2 line-clamp-2 group-hover:text-amber-400 transition-colors leading-snug">
          <span className="inline-flex items-center gap-2">
            <Mic className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{room.title}</span>
          </span>
        </h3>

        {room.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
            {room.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border/30">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`relative w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/10 grid place-items-center text-[10px] font-bold text-amber-400 overflow-hidden flex-shrink-0 ${isFounder ? 'ring-1 ring-amber-400/60' : ''}`}>
              {host?.avatar ? (
                <img src={host.avatar} alt={host.name} className="w-full h-full object-cover" />
              ) : (
                hostInitial
              )}
              {isFounder && (
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 grid place-items-center">
                  <Sparkles className="w-1.5 h-1.5 text-black" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {t('rooms.hostedBy', { name: host?.name || '—' })}
            </p>
          </div>
          <div className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-mono flex-shrink-0">
            <Users className="w-3 h-3" />
            {t('rooms.rsvpCount', { count: room.rsvpCount || 0 })}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
