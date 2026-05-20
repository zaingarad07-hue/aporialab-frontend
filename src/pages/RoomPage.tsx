import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  CalendarClock,
  Mic,
  Users,
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/services/api';
import type { AudioRoom } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { EmptyState } from '@/components/EmptyState';
import { useTimeUntil } from '@/hooks/useTimeUntil';

const statusStyle: Record<string, string> = {
  scheduled: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  live: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  ended: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export function RoomPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [room, setRoom] = useState<AudioRoom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const whenLabel = useTimeUntil(room?.scheduledAt, i18n.language);

  const fetchRoom = useCallback(async () => {
    if (!id) return;
    try {
      const res = await api.getRoom(id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = res as any;
      const data = r.room || r.data?.room;
      if (res.success && data) {
        setRoom(data);
        setError(null);
      } else {
        setError(res.message || t('rooms.notFound'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('rooms.notFound'));
    } finally {
      setIsLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  useEffect(() => {
    if (room) {
      document.title = `${room.title} · ${t('rooms.heading')}`;
    }
  }, [room, t]);

  const isHost = !!(room?.host?._id && user && room.host._id === user.id);
  const isRsvped = !!(user && room?.rsvpedUserIds.includes(user.id));
  const isFull = room ? (room.rsvpCount >= room.maxParticipants) : false;
  const canRsvp = room && (room.status === 'scheduled' || room.status === 'live');

  const handleRsvp = async () => {
    if (!room) return;
    if (!isAuthenticated) {
      toast.error(t('discussion.toast.loginToInteract'));
      return;
    }
    if (!isRsvped && isFull) {
      toast.error(t('rooms.rsvpFull'));
      return;
    }
    setIsToggling(true);
    try {
      const res = await api.toggleRoomRsvp(room._id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = res as any;
      const updated = r.room || r.data?.room;
      if (res.success && updated) {
        setRoom(updated);
      } else {
        toast.error(res.message || t('rooms.errors.saveFailed'));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('rooms.errors.saveFailed'));
    } finally {
      setIsToggling(false);
    }
  };

  const handleCancel = async () => {
    if (!room) return;
    if (!window.confirm(t('rooms.cancelConfirm'))) return;
    setIsCancelling(true);
    try {
      const res = await api.cancelRoom(room._id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = res as any;
      const updated = r.room || r.data?.room;
      if (res.success && updated) {
        setRoom(updated);
        toast.success(t('rooms.cancelled'));
      } else {
        toast.error(res.message || t('rooms.errors.saveFailed'));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('rooms.errors.saveFailed'));
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-4">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-12 w-40 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <EmptyState
            icon={AlertCircle}
            iconClassName="w-8 h-8 text-red-400"
            title={t('rooms.notFound')}
            description={error || ''}
            action={
              <Link to="/rooms">
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  {t('rooms.viewAll')}
                </Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const host = room.host;
  const isFounder = !!host?.isFoundingMember;

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${statusStyle[room.status] || statusStyle.scheduled}`}>
              {room.status === 'live' && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
              )}
              {t(`rooms.status.${room.status}`)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarClock className="w-3.5 h-3.5" />
              {room.status === 'live' && room.startedAt
                ? t('rooms.startedAt', { when: whenLabel })
                : t('rooms.startsIn', { when: whenLabel })}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold leading-relaxed mb-3 inline-flex items-center gap-2">
            <Mic className="w-6 h-6 text-amber-400 flex-shrink-0" />
            <span>{room.title}</span>
          </h1>

          {room.description && (
            <p className="text-base text-muted-foreground mb-6 leading-relaxed whitespace-pre-wrap">
              {room.description}
            </p>
          )}

          {/* Host */}
          <div className="flex items-center gap-3 py-4 border-y border-border/40 mb-6">
            <div className={`relative w-11 h-11 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/10 grid place-items-center text-sm font-bold text-amber-400 overflow-hidden flex-shrink-0 ${isFounder ? 'ring-2 ring-amber-400/60' : ''}`}>
              {host?.avatar ? (
                <img src={host.avatar} alt={host.name} className="w-full h-full object-cover" />
              ) : (
                host?.name?.charAt(0) || '?'
              )}
              {isFounder && (
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-400 grid place-items-center">
                  <Sparkles className="w-2 h-2 text-black" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{t('rooms.hostedBy', { name: host?.name || '—' })}</p>
              <p className="text-xs text-muted-foreground">
                {t('rooms.maxParticipants', { count: room.maxParticipants })}
              </p>
            </div>
          </div>

          {/* RSVP block */}
          <div className="p-5 rounded-2xl bg-card/40 border border-border/40 mb-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="inline-flex items-center gap-2 text-sm text-foreground">
                <Users className="w-4 h-4 text-amber-400" />
                {t('rooms.rsvpCount', { count: room.rsvpCount || 0 })}
              </div>

              {canRsvp ? (
                <Button
                  onClick={handleRsvp}
                  disabled={isToggling || (!isRsvped && isFull)}
                  variant={isRsvped ? 'outline' : 'default'}
                  className={isRsvped ? '' : 'bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:opacity-90'}
                >
                  {isToggling ? (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  ) : isRsvped ? (
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                  ) : null}
                  {isRsvped ? t('rooms.rsvped') : isFull ? t('rooms.rsvpFull') : t('rooms.rsvp')}
                </Button>
              ) : null}
            </div>

            {room.status === 'live' && (
              <p className="text-xs text-muted-foreground mt-3">{t('rooms.joinSoon')}</p>
            )}
            {room.status === 'ended' && (
              <p className="text-xs text-muted-foreground mt-3">{t('rooms.recordingComingSoon')}</p>
            )}
          </div>

          {/* Linked discussion */}
          {room.discussionId && (
            <div className="mb-6">
              <p className="text-[11px] text-muted-foreground mb-2 uppercase tracking-wider">
                {t('rooms.linkedDiscussion')}
              </p>
              <Link
                to={`/discussion/${room.discussionId}`}
                className="inline-flex items-center gap-2 text-sm text-amber-400 hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('rooms.openDiscussion')}
              </Link>
            </div>
          )}

          {/* Host actions */}
          {isHost && room.status === 'scheduled' && (
            <div className="pt-4 border-t border-border/30">
              <Button
                onClick={handleCancel}
                disabled={isCancelling}
                variant="outline"
                size="sm"
                className="gap-2 text-red-400 hover:text-red-300 hover:border-red-400/40"
              >
                {isCancelling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {t('rooms.cancelRoom')}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default RoomPage;
