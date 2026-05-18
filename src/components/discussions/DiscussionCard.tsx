import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Clock, MessageCircle, Eye, ThumbsUp, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { timeAgo, timeRemaining } from '@/lib/timeHelpers';
import type { DiscussionDetail } from '@/services/api';
import { StanceBar } from './StanceBar';

export type DiscussionCardVariant = 'full' | 'compact';

interface DiscussionCardProps {
  discussion: DiscussionDetail;
  variant: DiscussionCardVariant;
}

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export function DiscussionCard({ discussion, variant }: DiscussionCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isFounder = discussion.author.isFoundingMember;
  const isExpired = discussion.isExpired;

  if (variant === 'compact') {
    return (
      <motion.div
        layout
        variants={itemVariants}
        whileHover={{ x: -2, transition: { duration: 0.2 } }}
        onClick={() => navigate(`/discussion/${discussion._id}`)}
        className="group flex items-center gap-4 p-4 rounded-xl bg-card/40 border border-border/40 hover:border-amber-500/40 hover:bg-card/70 transition-colors cursor-pointer"
      >
        <Link
          to={`/profile/${discussion.author._id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex-shrink-0"
        >
          <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/10 grid place-items-center text-sm font-bold text-amber-400 overflow-hidden ${isFounder ? 'ring-2 ring-amber-400/60' : ''}`}>
            {discussion.author.avatar ? (
              <img src={discussion.author.avatar} alt={discussion.author.name} className="w-full h-full object-cover" />
            ) : (
              discussion.author.name.charAt(0)
            )}
            {isFounder && (
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-400 grid place-items-center">
                <Sparkles className="w-2 h-2 text-black" />
              </div>
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {discussion.category && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">
                {discussion.category}
              </span>
            )}
            {discussion.duration && discussion.expiresAt && !isExpired && (
              <span className="inline-flex items-center gap-1 text-[10px] text-blue-400">
                <Clock className="w-2.5 h-2.5" />
                {timeRemaining(t, discussion.expiresAt)}
              </span>
            )}
            {isExpired && <span className="text-[10px] text-slate-400">{t('discussionsPage.expired')}</span>}
            <span className="text-[10px] text-muted-foreground/60">·</span>
            <span className="text-[10px] text-muted-foreground">{timeAgo(t, discussion.createdAt)}</span>
          </div>

          <h3 className="text-sm font-bold text-foreground truncate group-hover:text-amber-400 transition-colors mb-1">
            {discussion.title}
          </h3>

          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
            {discussion.content}
          </p>

          {discussion.stanceStats && <StanceBar stats={discussion.stanceStats} />}
        </div>

        <div className="flex flex-col items-end gap-1 text-[10px] text-muted-foreground font-mono flex-shrink-0">
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            {discussion.commentCount || 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {discussion.views || 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <ThumbsUp className="w-3 h-3" />
            {discussion.upvotes?.length || 0}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      variants={itemVariants}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      onClick={() => navigate(`/discussion/${discussion._id}`)}
      className="group relative p-5 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-sm hover:border-amber-500/40 hover:shadow-[0_8px_30px_-12px_rgba(251,191,36,0.25)] transition-colors cursor-pointer overflow-hidden"
    >
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {discussion.category && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {discussion.category}
            </span>
          )}
          {discussion.duration && discussion.expiresAt && !isExpired && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <Clock className="w-2.5 h-2.5" />
              {timeRemaining(t, discussion.expiresAt)}
            </span>
          )}
          {isExpired && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/30">
              {t('discussionsPage.expired')}
            </span>
          )}
        </div>

        {discussion.editsCount && discussion.editsCount > 0 && (
          <span className="text-[10px] text-muted-foreground/70">
            {t('discussionsPage.edited')}
          </span>
        )}
      </div>

      <h3 className="text-base md:text-lg font-bold mb-2 line-clamp-2 group-hover:text-amber-400 transition-colors leading-snug">
        {discussion.title}
      </h3>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
        {discussion.content}
      </p>

      {discussion.tags && discussion.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {discussion.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-secondary/40 text-muted-foreground">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {discussion.stanceStats && (
        <div className="mb-4">
          <StanceBar stats={discussion.stanceStats} />
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-border/30">
        <Link
          to={`/profile/${discussion.author._id}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 group/author min-w-0"
        >
          <div className={`relative w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/10 grid place-items-center text-[10px] font-bold text-amber-400 overflow-hidden flex-shrink-0 ${isFounder ? 'ring-1 ring-amber-400/60' : ''}`}>
            {discussion.author.avatar ? (
              <img src={discussion.author.avatar} alt={discussion.author.name} className="w-full h-full object-cover" />
            ) : (
              discussion.author.name.charAt(0)
            )}
            {isFounder && (
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 grid place-items-center">
                <Sparkles className="w-1.5 h-1.5 text-black" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate group-hover/author:text-amber-400 transition-colors">
              {discussion.author.name}
            </p>
            <p className="text-[9px] text-muted-foreground font-mono">
              {timeAgo(t, discussion.createdAt)}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono flex-shrink-0">
          <span className="inline-flex items-center gap-1">
            <ThumbsUp className="w-3 h-3" />
            {discussion.upvotes?.length || 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            {discussion.commentCount || 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {discussion.views || 0}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function DiscussionCardSkeleton({ variant }: { variant: DiscussionCardVariant }) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-4 p-4 rounded-xl bg-card/40 border border-border/40">
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex gap-2">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-card/60 border border-border/50">
      <div className="flex gap-2 mb-3">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-4 w-20 rounded-full" />
      </div>
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <div className="flex gap-1.5 mb-4">
        <Skeleton className="h-4 w-14 rounded-md" />
        <Skeleton className="h-4 w-12 rounded-md" />
        <Skeleton className="h-4 w-16 rounded-md" />
      </div>
      <Skeleton className="h-1.5 w-full rounded-full mb-4" />
      <div className="flex justify-between items-center pt-3 border-t border-border/30">
        <div className="flex items-center gap-2">
          <Skeleton className="w-7 h-7 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-2 w-12" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
    </div>
  );
}
