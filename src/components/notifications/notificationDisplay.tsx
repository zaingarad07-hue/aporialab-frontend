import { MessageSquare, Reply, ThumbsUp, Sparkles, Lightbulb, Users, CheckCircle2, XCircle } from 'lucide-react';
import type { NotificationType } from '@/services/api';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const ICON_BY_TYPE: Record<NotificationType, typeof MessageSquare> = {
  comment: MessageSquare,
  reply: Reply,
  discussion_upvote: ThumbsUp,
  comment_upvote: ThumbsUp,
  reaction_logical: Lightbulb,
  reaction_inspiring: Sparkles,
  circle_join_request: Users,
  circle_approved: CheckCircle2,
  circle_rejected: XCircle,
};

const COLOR_BY_TYPE: Record<NotificationType, string> = {
  comment: 'text-sky-400',
  reply: 'text-sky-400',
  discussion_upvote: 'text-amber-400',
  comment_upvote: 'text-amber-400',
  reaction_logical: 'text-emerald-400',
  reaction_inspiring: 'text-pink-400',
  circle_join_request: 'text-violet-400',
  circle_approved: 'text-emerald-400',
  circle_rejected: 'text-rose-400',
};

export function NotificationIcon({ type }: { type: NotificationType }) {
  const Icon = ICON_BY_TYPE[type] || MessageSquare;
  return <Icon className={`w-4 h-4 ${COLOR_BY_TYPE[type] || 'text-muted-foreground'}`} />;
}

export function timeAgo(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ar });
  } catch {
    return '';
  }
}
