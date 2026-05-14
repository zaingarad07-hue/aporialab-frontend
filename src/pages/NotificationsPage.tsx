import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCheck, Trash2, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api, type NotificationItem, type NotificationFilter } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import { NotificationIcon, timeAgo } from '@/components/notifications/notificationDisplay';

const FILTER_KEYS: { value: NotificationFilter; labelKey: string }[] = [
  { value: 'all', labelKey: 'notifications.filters.all' },
  { value: 'unread', labelKey: 'notifications.filters.unread' },
  { value: 'comment', labelKey: 'notifications.filters.comments' },
  { value: 'upvote', labelKey: 'notifications.filters.likes' },
  { value: 'reaction', labelKey: 'notifications.filters.reactions' },
  { value: 'circle', labelKey: 'notifications.filters.circles' },
];

const PAGE_SIZE = 20;

export function NotificationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { setCount } = useUnreadNotifications();
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = t('notifications.pageTitle');
  }, [t]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getNotifications(filter, page, PAGE_SIZE);
      if (res.success) {
        setItems(res.notifications);
        setPages(res.pagination.pages || 1);
        setTotal(res.pagination.total || 0);
        setUnread(res.unreadCount);
        setCount(res.unreadCount);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('notifications.loadFailed');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [filter, page, isAuthenticated, setCount, t]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const handleOpen = async (n: NotificationItem) => {
    if (!n.isRead) {
      try {
        await api.markNotificationRead(n._id);
        setItems(prev => prev.map(p => p._id === n._id ? { ...p, isRead: true } : p));
        const newUnread = Math.max(0, unread - 1);
        setUnread(newUnread);
        setCount(newUnread);
      } catch {
        // best-effort
      }
    }
    if (n.link) navigate(n.link);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await api.deleteNotification(id);
      setItems(prev => prev.filter(p => p._id !== id));
      setTotal(t => Math.max(0, t - 1));
    } catch {
      // best-effort
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setItems(prev => prev.map(p => ({ ...p, isRead: true })));
      setUnread(0);
      setCount(0);
    } catch {
      // best-effort
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 grid place-items-center">
            <Bell className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{t('notifications.title')}</h1>
            <p className="text-xs text-muted-foreground">
              {unread > 0
                ? t('notifications.summaryWithUnread', { total, unread })
                : t('notifications.summary', { total })}
            </p>
          </div>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="gap-1.5">
            <CheckCheck className="w-4 h-4" />
            {t('notifications.markAllRead')}
          </Button>
        )}
      </div>

      <Tabs value={filter} onValueChange={v => setFilter(v as NotificationFilter)} className="mb-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          {FILTER_KEYS.map(f => (
            <TabsTrigger key={f.value} value={f.value} className="text-xs">
              {t(f.labelKey)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin ml-2" />
          {t('notifications.loading')}
        </div>
      ) : error ? (
        <div className="py-16 text-center text-sm text-rose-400">{error}</div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          {t('notifications.empty')}
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map(n => (
            <li
              key={n._id}
              onClick={() => handleOpen(n)}
              className={`group cursor-pointer flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                n.isRead
                  ? 'bg-card border-border hover:bg-secondary/40'
                  : 'bg-amber-500/5 border-amber-500/30 hover:bg-amber-500/10'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-9 h-9 rounded-full bg-secondary/60 grid place-items-center overflow-hidden">
                  {n.sender?.avatar ? (
                    <img src={n.sender.avatar} alt={n.sender.name} className="w-full h-full object-cover" />
                  ) : (
                    <NotificationIcon type={n.type} />
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <NotificationIcon type={n.type} />
                  <span className="text-sm font-semibold truncate">{n.title}</span>
                  {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />}
                </div>
                {n.message && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                )}
                <p className="mt-1 text-[11px] text-muted-foreground/70">{timeAgo(n.createdAt)}</p>
              </div>
              <button
                type="button"
                onClick={(e) => handleDelete(e, n._id)}
                aria-label={t('notifications.delete')}
                title={t('notifications.delete')}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-md text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="gap-1"
          >
            <ChevronRight className="w-4 h-4" />
            {t('common.previous')}
          </Button>
          <span className="text-xs text-muted-foreground px-3">
            {page} / {pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pages}
            onClick={() => setPage(p => Math.min(pages, p + 1))}
            className="gap-1"
          >
            {t('common.next')}
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
