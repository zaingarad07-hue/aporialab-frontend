import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api, type NotificationItem } from '@/services/api';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import { NotificationIcon, timeAgo } from '@/components/notifications/notificationDisplay';

export function NotificationsBell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { count, refresh, setCount } = useUnreadNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.getNotifications('all', 1, 10);
        if (cancelled) return;
        if (res.success) {
          setItems(res.notifications);
          setCount(res.unreadCount);
        }
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : t('notifications.loadFailed');
        setError(msg);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isOpen, setCount]);

  const handleClickItem = async (n: NotificationItem) => {
    setIsOpen(false);
    if (!n.isRead) {
      try {
        await api.markNotificationRead(n._id);
        setItems(prev => prev.map(p => p._id === n._id ? { ...p, isRead: true } : p));
        setCount(c => Math.max(0, c - 1));
      } catch {
        // best-effort
      }
    }
    if (n.link) navigate(n.link);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setItems(prev => prev.map(p => ({ ...p, isRead: true })));
      setCount(0);
    } catch {
      // best-effort
    }
  };

  const badgeText = count > 99 ? '99+' : count > 0 ? String(count) : '';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t('notifications.title')}
          title={t('notifications.title')}
          className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
        >
          <Bell className="w-4 h-4 md:w-5 md:h-5" />
          {badgeText && (
            <span className="absolute -top-0.5 -left-0.5 min-w-[16px] h-4 px-1 grid place-items-center rounded-full bg-amber-500 text-[10px] font-bold text-black">
              {badgeText}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[360px] p-0 bg-popover border-border"
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <span className="text-sm font-semibold">{t('notifications.title')}</span>
          {count > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleMarkAllRead}
              className="h-7 px-2 text-[11px] gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              {t('notifications.markAllRead')}
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-xs">
              <Loader2 className="w-4 h-4 animate-spin ml-2" />
              {t('notifications.loading')}
            </div>
          ) : error ? (
            <div className="px-3 py-8 text-center text-xs text-rose-400">{error}</div>
          ) : items.length === 0 ? (
            <div className="px-3 py-12 text-center text-xs text-muted-foreground">
              {t('notifications.empty')}
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map(n => (
                <li key={n._id}>
                  <button
                    type="button"
                    onClick={() => handleClickItem(n)}
                    className={`w-full text-right flex items-start gap-3 px-3 py-3 hover:bg-secondary/40 transition-colors ${!n.isRead ? 'bg-amber-500/5' : ''}`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-8 h-8 rounded-full bg-secondary/60 grid place-items-center overflow-hidden">
                        {n.sender?.avatar ? (
                          <img src={n.sender.avatar} alt={n.sender.name} className="w-full h-full object-cover" />
                        ) : (
                          <NotificationIcon type={n.type} />
                        )}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <NotificationIcon type={n.type} />
                        <span className="text-xs font-semibold text-foreground truncate">{n.title}</span>
                        {!n.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      {n.message && (
                        <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">{n.message}</p>
                      )}
                      <p className="mt-1 text-[10px] text-muted-foreground/70">{timeAgo(n.createdAt)}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>

        <div className="px-3 py-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs"
            onClick={() => {
              setIsOpen(false);
              refresh();
              navigate('/notifications');
            }}
          >
            {t('notifications.viewAll')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
