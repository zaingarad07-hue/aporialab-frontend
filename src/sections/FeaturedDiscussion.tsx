import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, MessageCircle, Eye, ThumbsUp } from 'lucide-react';
import { api } from '@/services/api';
import type { DiscussionDetail } from '@/services/api';
import { StanceBar } from '@/components/discussions/StanceBar';
import { useDiscussionPresence } from '@/hooks/useDiscussionPresence';
import { timeAgo } from '@/lib/timeHelpers';

export function FeaturedDiscussion() {
  const { t } = useTranslation();
  const [discussion, setDiscussion] = useState<DiscussionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.getFeaturedDiscussions(1).then(res => {
      if (cancelled) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = res as any;
      const list: DiscussionDetail[] = r.discussions || r.data?.discussions || [];
      setDiscussion(list[0] || null);
      setIsLoading(false);
    }).catch(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const { count: viewerCount } = useDiscussionPresence(discussion?._id);

  if (isLoading || !discussion) return null;

  const isFounder = discussion.author.isFoundingMember;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-10"
    >
      <Link
        to={`/discussion/${discussion._id}`}
        className="group block relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/[0.08] via-card/40 to-card/40 backdrop-blur-sm hover:border-amber-500/60 hover:shadow-[0_20px_60px_-20px_rgba(251,191,36,0.35)] transition-all"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

        <div className="relative p-6 md:p-8">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                {t('homepage.featuredLabel')}
              </span>
            </div>
            {viewerCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                {t('homepage.viewersNow', { count: viewerCount })}
              </span>
            )}
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-tight group-hover:text-amber-400 transition-colors">
            {discussion.title}
          </h2>

          <p className="text-sm md:text-base text-muted-foreground mb-5 line-clamp-3 leading-relaxed">
            {discussion.content}
          </p>

          {discussion.stanceStats && (
            <div className="mb-5 max-w-md">
              <StanceBar stats={discussion.stanceStats} />
            </div>
          )}

          <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/40 flex-wrap">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`relative w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/10 grid place-items-center text-xs font-bold text-amber-400 overflow-hidden flex-shrink-0 ${isFounder ? 'ring-1 ring-amber-400/60' : ''}`}>
                {discussion.author.avatar ? (
                  <img src={discussion.author.avatar} alt={discussion.author.name} className="w-full h-full object-cover" />
                ) : (
                  discussion.author.name.charAt(0)
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {discussion.author.name}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  {timeAgo(t, discussion.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-mono">
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

            <div className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400 group-hover:gap-3 transition-all">
              <span>{t('homepage.featuredCta')}</span>
              <ArrowLeft className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
