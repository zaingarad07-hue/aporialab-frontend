import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Search,
  Plus,
  Loader2,
  Sparkles,
  Filter,
  X,
  TrendingUp,
  Calendar,
  Eye,
  Award,
  AlertCircle,
  Inbox,
  ChevronDown,
} from 'lucide-react';
import { api } from '@/services/api';
import type { DiscussionDetail } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { CreateDiscussionDialog } from '@/components/CreateDiscussionDialog';
import { JoinDialog } from '@/components/JoinDialog';
import { Sidebar } from '@/Sidebar';
import { Navbar } from '@/sections/Navbar';
import { LoginDialog } from '@/components/LoginDialog';
import { Footer } from '@/sections/Footer';
import { DiscussionCard, DiscussionCardSkeleton } from '@/components/discussions/DiscussionCard';
import { EmptyState } from '@/components/EmptyState';

type StanceFilter = 'all' | 'pro' | 'con' | 'neutral';
type SortOption = 'newest' | 'oldest' | 'popular' | 'mostViewed';

const SORT_OPTIONS: { value: SortOption; labelKey: string; icon: React.ElementType }[] = [
  { value: 'newest', labelKey: 'discussionsPage.sort.newest', icon: Calendar },
  { value: 'popular', labelKey: 'discussionsPage.sort.popular', icon: TrendingUp },
  { value: 'mostViewed', labelKey: 'discussionsPage.sort.mostViewed', icon: Eye },
  { value: 'oldest', labelKey: 'discussionsPage.sort.oldest', icon: Award },
];

const STANCE_FILTERS: { value: StanceFilter; labelKey: string; bgClass: string }[] = [
  { value: 'all', labelKey: 'discussionsPage.stance.all', bgClass: 'bg-amber-500/10 border-amber-500/40 text-amber-400' },
  { value: 'pro', labelKey: 'discussionsPage.stance.pro', bgClass: 'bg-green-500/10 border-green-500/40 text-green-400' },
  { value: 'con', labelKey: 'discussionsPage.stance.con', bgClass: 'bg-red-500/10 border-red-500/40 text-red-400' },
  { value: 'neutral', labelKey: 'discussionsPage.stance.neutral', bgClass: 'bg-slate-500/10 border-slate-500/40 text-slate-400' },
];

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const MAX_AUTO_LOADS = 3;

function DiscussionsPageContent() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const [discussions, setDiscussions] = useState<DiscussionDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [stanceFilter, setStanceFilter] = useState<StanceFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null);
  const autoLoadCountRef = useRef(0);
  const [autoLoadPaused, setAutoLoadPaused] = useState(false);

  // Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  useEffect(() => {
    document.title = t('discussionsPage.pageTitle');
  }, [t]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const isTyping = searchQuery !== debouncedQuery;
  const isShortQuery = debouncedQuery.trim().length === 1;

  // Fetch discussions
  const fetchDiscussions = useCallback(async (pageNum: number, replace: boolean) => {
    try {
      if (replace) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      const trimmedQuery = debouncedQuery.trim();
      const response = await api.getDiscussions({
        sort: sortBy,
        page: pageNum,
        q: trimmedQuery || undefined,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = response as any;
      const discussionsList: DiscussionDetail[] = r.discussions || r.data?.discussions || [];
      const pagination = r.pagination || r.data?.pagination;

      if (response.success) {
        if (replace) {
          setDiscussions(discussionsList);
        } else {
          setDiscussions(prev => [...prev, ...discussionsList]);
        }
        if (pagination) {
          setTotal(pagination.total);
          setHasMore(pageNum < pagination.pages);
        } else {
          setTotal(discussionsList.length);
          setHasMore(false);
        }
      } else {
        setError(t('discussionsPage.loadFailed'));
      }
    } catch (err) {
      console.error('Failed to fetch discussions:', err);
      setError(t('discussionsPage.loadFailed'));
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [sortBy, debouncedQuery, t]);

  // Refetch on sort or query change; skip when query is exactly 1 char
  useEffect(() => {
    if (isShortQuery) {
      setDiscussions([]);
      setTotal(0);
      setHasMore(false);
      setIsLoading(false);
      return;
    }
    setPage(1);
    autoLoadCountRef.current = 0;
    setAutoLoadPaused(false);
    fetchDiscussions(1, true);
  }, [fetchDiscussions, isShortQuery]);

  // Stance filter is client-side (server-side filtering would need denormalization)
  const filteredDiscussions = useMemo(() => {
    if (stanceFilter === 'all') return discussions;
    return discussions.filter(d => {
      if (!d.stanceStats) return false;
      const { pro, con, neutral } = d.stanceStats;
      const max = Math.max(pro, con, neutral);
      if (max === 0) return false;
      if (stanceFilter === 'pro' && pro === max) return true;
      if (stanceFilter === 'con' && con === max) return true;
      if (stanceFilter === 'neutral' && neutral === max) return true;
      return false;
    });
  }, [discussions, stanceFilter]);

  // Counts per stance (for pill badges)
  const stanceCounts = useMemo(() => {
    const counts = { all: discussions.length, pro: 0, con: 0, neutral: 0 };
    discussions.forEach(d => {
      if (!d.stanceStats) return;
      const { pro, con, neutral } = d.stanceStats;
      const max = Math.max(pro, con, neutral);
      if (max === 0) return;
      if (pro === max) counts.pro++;
      else if (con === max) counts.con++;
      else if (neutral === max) counts.neutral++;
    });
    return counts;
  }, [discussions]);

  const handleLoadMore = useCallback((isAuto = false) => {
    const nextPage = page + 1;
    setPage(nextPage);
    if (isAuto) autoLoadCountRef.current += 1;
    fetchDiscussions(nextPage, false);
  }, [page, fetchDiscussions]);

  const handleManualLoadMore = () => {
    autoLoadCountRef.current = 0;
    setAutoLoadPaused(false);
    handleLoadMore(false);
  };

  // Auto-load on scroll (paused after MAX_AUTO_LOADS consecutive auto-loads)
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          hasMore &&
          !isLoadingMore &&
          !isLoading &&
          stanceFilter === 'all' &&
          !autoLoadPaused
        ) {
          if (autoLoadCountRef.current >= MAX_AUTO_LOADS) {
            setAutoLoadPaused(true);
            return;
          }
          handleLoadMore(true);
        }
      },
      { rootMargin: '400px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isLoading, stanceFilter, autoLoadPaused, handleLoadMore]);

  const handleCreateClick = () => {
    if (isAuthenticated) {
      setIsCreateOpen(true);
    } else {
      setIsJoinOpen(true);
    }
  };

  const currentSort = SORT_OPTIONS.find(s => s.value === sortBy) || SORT_OPTIONS[0];
  const SortIcon = currentSort.icon;

  const hasActiveFilter = debouncedQuery.trim() !== '' || stanceFilter !== 'all';
  const showLoadMore = hasMore && stanceFilter === 'all' && !isLoading && !error && filteredDiscussions.length > 0;

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 mb-3">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] font-medium text-amber-400">{t('app.name')}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-1">
                <span className="gradient-text">{t('discussionsPage.heading')}</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                {debouncedQuery.trim() && !isShortQuery
                  ? t('discussionsPage.searchResultsFor', { q: debouncedQuery.trim() })
                  : total > 0
                    ? `${total.toLocaleString()}`
                    : t('discussionsPage.subtitle')}
              </p>
            </div>

            <Button
              size="lg"
              onClick={handleCreateClick}
              className="bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:opacity-90 shadow-[0_0_20px_rgba(251,191,36,0.25)] gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.newDiscussion')}</span>
              <span className="sm:hidden">{t('common.new')}</span>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Filters Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 space-y-4">
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="relative"
        >
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('discussionsPage.searchPlaceholder')}
            className="w-full h-12 pr-11 pl-11 rounded-xl bg-card/60 border border-border/50 backdrop-blur-sm text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
          />
          {(isTyping && searchQuery) ? (
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
            </div>
          ) : searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              aria-label={t('discussionsPage.clearFilters')}
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </motion.div>

        {/* Stance Tabs + Sort */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="flex items-center justify-between gap-3 flex-wrap"
        >
          {/* Stance pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {STANCE_FILTERS.map(filter => {
              const count = stanceCounts[filter.value];
              const isActive = stanceFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  onClick={() => setStanceFilter(filter.value)}
                  className={`inline-flex items-center gap-2 px-3 h-9 rounded-full text-xs font-medium border transition-colors ${
                    isActive
                      ? filter.bgClass + ' shadow-sm'
                      : 'bg-card/40 border-border/40 text-muted-foreground hover:bg-card/60 hover:text-foreground'
                  }`}
                >
                  <span>{t(filter.labelKey)}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-black/20' : 'bg-secondary/40'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="inline-flex items-center gap-2 px-3 h-9 rounded-lg bg-card/40 border border-border/40 text-xs text-foreground hover:bg-card/60 transition-colors"
            >
              <SortIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>{t(currentSort.labelKey)}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showSortMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowSortMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-2 w-44 rounded-xl bg-card border border-border/60 shadow-xl backdrop-blur-xl z-40 overflow-hidden"
                  >
                    {SORT_OPTIONS.map(option => {
                      const Icon = option.icon;
                      const isActive = option.value === sortBy;
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setShowSortMenu(false);
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs text-right hover:bg-secondary/50 transition-colors ${
                            isActive ? 'text-amber-400 bg-amber-500/5' : 'text-foreground'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span className="flex-1">{t(option.labelKey)}</span>
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Active filters indicator */}
        <AnimatePresence>
          {hasActiveFilter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1.5"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                <Filter className="w-3 h-3" />
                <span>
                  {t('discussionsPage.filterIndicator', {
                    shown: filteredDiscussions.length,
                    total: discussions.length,
                  })}
                </span>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStanceFilter('all');
                  }}
                  className="text-amber-400 hover:underline"
                >
                  {t('discussionsPage.clearFilters')}
                </button>
              </div>
              {stanceFilter !== 'all' && (
                <p className="text-[11px] text-muted-foreground/70 pr-5">
                  {t('discussionsPage.stanceLocalNote')}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Short query hint */}
        {isShortQuery && (
          <p className="text-xs text-muted-foreground">
            {t('discussionsPage.minQueryChars')}
          </p>
        )}
      </div>

      {/* Discussions List */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <AnimatePresence mode="wait">
          {/* Loading skeletons */}
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="md:hidden space-y-3">
                {[...Array(5)].map((_, i) => (
                  <DiscussionCardSkeleton key={i} variant="full" />
                ))}
              </div>
              <div className="hidden md:block space-y-2">
                {[...Array(5)].map((_, i) => (
                  <DiscussionCardSkeleton key={i} variant="compact" />
                ))}
              </div>
            </motion.div>
          )}

          {/* Error state */}
          {!isLoading && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState
                icon={AlertCircle}
                iconClassName="w-8 h-8 text-red-400"
                title={t('discussionsPage.errorTitle')}
                description={error}
                action={
                  <Button onClick={() => fetchDiscussions(1, true)} variant="outline" size="sm">
                    {t('common.retry')}
                  </Button>
                }
              />
            </motion.div>
          )}

          {/* Empty state - filter yields nothing */}
          {!isLoading && !error && filteredDiscussions.length === 0 && discussions.length > 0 && (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState
                icon={Search}
                title={t('discussionsPage.noResults')}
                description={t('discussionsPage.noResultsHint')}
                action={
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setStanceFilter('all');
                    }}
                    variant="outline"
                    size="sm"
                  >
                    {t('discussionsPage.clearFilters')}
                  </Button>
                }
              />
            </motion.div>
          )}

          {/* Empty state - no discussions at all */}
          {!isLoading && !error && discussions.length === 0 && !isShortQuery && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState
                icon={Inbox}
                iconClassName="w-10 h-10 text-amber-400"
                title={t('discussionsPage.empty')}
                description={t('discussionsPage.emptyHint')}
                action={
                  <Button
                    onClick={handleCreateClick}
                    size="lg"
                    className="bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:opacity-90 gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {t('discussionsPage.startFirst')}
                  </Button>
                }
              />
            </motion.div>
          )}

          {/* Discussions list */}
          {!isLoading && !error && filteredDiscussions.length > 0 && (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {/* Mobile: full cards */}
              <motion.div
                className="md:hidden space-y-3"
                variants={listVariants}
                initial="hidden"
                animate="show"
              >
                <AnimatePresence mode="popLayout">
                  {filteredDiscussions.map(discussion => (
                    <DiscussionCard key={discussion._id} discussion={discussion} variant="full" />
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Desktop: compact rows */}
              <motion.div
                className="hidden md:block space-y-2"
                variants={listVariants}
                initial="hidden"
                animate="show"
              >
                <AnimatePresence mode="popLayout">
                  {filteredDiscussions.map(discussion => (
                    <DiscussionCard key={discussion._id} discussion={discussion} variant="compact" />
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Sentinel + Load more button */}
              {showLoadMore && (
                <>
                  <div ref={sentinelRef} aria-hidden className="h-1" />
                  <div className="mt-8 text-center">
                    <Button
                      onClick={handleManualLoadMore}
                      disabled={isLoadingMore}
                      variant="outline"
                      size="lg"
                      className="min-w-[200px]"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                          {t('discussionsPage.loadingMore')}
                        </>
                      ) : autoLoadPaused ? (
                        t('discussionsPage.autoLoadingPaused')
                      ) : (
                        t('discussionsPage.loadMoreLabel')
                      )}
                    </Button>
                  </div>
                </>
              )}

              {/* End of list */}
              {!hasMore && filteredDiscussions.length >= 10 && (
                <div className="mt-8 text-center text-xs text-muted-foreground">
                  {t('discussionsPage.endOfList')}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dialogs */}
      <LoginDialog open={false} onOpenChange={() => {}} />
      <JoinDialog open={isJoinOpen} onOpenChange={setIsJoinOpen} />
      <CreateDiscussionDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}

export function DiscussionsPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleCreateClick = () => {
    if (isAuthenticated) {
      setIsCreateOpen(true);
    } else {
      setIsJoinOpen(true);
    }
  };

  return (
    <>
      <Sidebar onCreateClick={handleCreateClick} />

      <Navbar
        onLoginClick={() => setIsLoginOpen(true)}
        onJoinClick={() => setIsJoinOpen(true)}
      />

      <main className="md:mr-[4.5rem] pb-20 md:pb-0">
        <DiscussionsPageContent />
      </main>

      <Footer />

      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      <JoinDialog open={isJoinOpen} onOpenChange={setIsJoinOpen} />
      <CreateDiscussionDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </>
  );
}

export default DiscussionsPage;
