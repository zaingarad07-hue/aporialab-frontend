import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { timeAgo, timeRemaining } from '@/lib/timeHelpers';
import { 
  Search,
  Plus,
  Loader2,
  Clock,
  MessageCircle,
  Eye,
  ThumbsUp,
  Sparkles,
  Filter,
  X,
  TrendingUp,
  Calendar,
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

type StanceFilter = 'all' | 'pro' | 'con' | 'neutral';
type SortOption = 'newest' | 'oldest' | 'popular' | 'mostViewed';

const SORT_OPTIONS: { value: SortOption; labelKey: string; icon: React.ElementType }[] = [
  { value: 'newest', labelKey: 'discussionsPage.sort.newest', icon: Calendar },
  { value: 'popular', labelKey: 'discussionsPage.sort.popular', icon: TrendingUp },
  { value: 'mostViewed', labelKey: 'discussionsPage.sort.mostViewed', icon: Eye },
  { value: 'oldest', labelKey: 'discussionsPage.sort.oldest', icon: Award },
];

const STANCE_FILTERS: { value: StanceFilter; labelKey: string; color: string; bgClass: string }[] = [
  { value: 'all', labelKey: 'discussionsPage.stance.all', color: '#daa520', bgClass: 'bg-amber-500/10 border-amber-500/40 text-amber-400' },
  { value: 'pro', labelKey: 'discussionsPage.stance.pro', color: '#22c55e', bgClass: 'bg-green-500/10 border-green-500/40 text-green-400' },
  { value: 'con', labelKey: 'discussionsPage.stance.con', color: '#ef4444', bgClass: 'bg-red-500/10 border-red-500/40 text-red-400' },
  { value: 'neutral', labelKey: 'discussionsPage.stance.neutral', color: '#94a3b8', bgClass: 'bg-slate-500/10 border-slate-500/40 text-slate-400' },
];

// Stance bar component
function StanceBar({ stats }: { stats?: { pro: number; con: number; neutral: number } }) {
  const { t } = useTranslation();
  if (!stats) return null;
  const total = stats.pro + stats.con + stats.neutral;
  if (total === 0) return null;
  
  const proPercent = (stats.pro / total) * 100;
  const conPercent = (stats.con / total) * 100;
  const neutralPercent = (stats.neutral / total) * 100;
  
  return (
    <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-secondary/30">
      {proPercent > 0 && (
        <div 
          className="bg-green-500 transition-all" 
          style={{ width: `${proPercent}%` }}
          title={`${t('discussionsPage.stance.pro')}: ${stats.pro}`}
        />
      )}
      {neutralPercent > 0 && (
        <div 
          className="bg-slate-400 transition-all" 
          style={{ width: `${neutralPercent}%` }}
          title={`${t('discussionsPage.stance.neutral')}: ${stats.neutral}`}
        />
      )}
      {conPercent > 0 && (
        <div 
          className="bg-red-500 transition-all" 
          style={{ width: `${conPercent}%` }}
          title={`${t('discussionsPage.stance.con')}: ${stats.con}`}
        />
      )}
    </div>
  );
}

// Discussion Card (Mobile)
function DiscussionCard({ discussion }: { discussion: DiscussionDetail }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isFounder = discussion.author.isFoundingMember;
  const isExpired = discussion.isExpired;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => navigate(`/discussion/${discussion._id}`)}
      className="group relative p-5 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-sm hover:border-amber-500/40 hover:shadow-[0_8px_30px_-12px_rgba(251,191,36,0.25)] transition-all cursor-pointer overflow-hidden"
    >
      {/* Top badges row */}
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

      {/* Title */}
      <h3 className="text-base md:text-lg font-bold mb-2 line-clamp-2 group-hover:text-amber-400 transition-colors leading-snug">
        {discussion.title}
      </h3>

      {/* Snippet */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
        {discussion.content}
      </p>

      {/* Tags */}
      {discussion.tags && discussion.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {discussion.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-secondary/40 text-muted-foreground">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Stance bar */}
      {discussion.stanceStats && (
        <div className="mb-4">
          <StanceBar stats={discussion.stanceStats} />
        </div>
      )}

      {/* Footer: Author + Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-border/30">
        {/* Author */}
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

        {/* Stats */}
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

// Discussion Row (Desktop compact)
function DiscussionRow({ discussion }: { discussion: DiscussionDetail }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isFounder = discussion.author.isFoundingMember;
  const isExpired = discussion.isExpired;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.3 }}
      whileHover={{ x: -3 }}
      onClick={() => navigate(`/discussion/${discussion._id}`)}
      className="group flex items-center gap-4 p-4 rounded-xl bg-card/40 border border-border/40 hover:border-amber-500/40 hover:bg-card/70 transition-all cursor-pointer"
    >
      {/* Author avatar */}
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

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top row: Category + Status badges */}
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

        {/* Title */}
        <h3 className="text-sm font-bold text-foreground truncate group-hover:text-amber-400 transition-colors mb-1">
          {discussion.title}
        </h3>

        {/* Snippet */}
        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
          {discussion.content}
        </p>

        {/* Stance bar */}
        {discussion.stanceStats && (
          <StanceBar stats={discussion.stanceStats} />
        )}
      </div>

      {/* Right: Stats */}
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

// Skeleton Loader
function DiscussionSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-card/40 border border-border/40 animate-pulse">
      <div className="flex gap-2 mb-3">
        <div className="h-4 w-16 rounded-full bg-muted/50" />
        <div className="h-4 w-20 rounded-full bg-muted/50" />
      </div>
      <div className="h-5 w-3/4 rounded bg-muted/50 mb-2" />
      <div className="h-4 w-full rounded bg-muted/40 mb-1" />
      <div className="h-4 w-2/3 rounded bg-muted/40 mb-4" />
      <div className="flex justify-between items-center pt-3 border-t border-border/30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-muted/50" />
          <div className="h-3 w-20 rounded bg-muted/50" />
        </div>
        <div className="h-3 w-24 rounded bg-muted/50" />
      </div>
    </div>
  );
}

// Main Page Component
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
  
  // Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  // Set page title
  useEffect(() => {
    document.title = t('discussionsPage.pageTitle');
  }, [t]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch discussions
  const fetchDiscussions = useCallback(async (pageNum: number, replace: boolean) => {
    try {
      if (replace) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }
      
      const response = await api.getDiscussions({
  sort: sortBy,
  page: pageNum,
});

// Cast to any to handle both response shapes (root or data)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const r = response as any;
const discussionsList: DiscussionDetail[] = r.discussions || r.data?.discussions || [];
const pagination = r.pagination || r.data?.pagination;

if (response.success && discussionsList.length >= 0) {
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
  }, [sortBy, t]);

  // Initial fetch + refetch on sort change
  useEffect(() => {
    setPage(1);
    fetchDiscussions(1, true);
  }, [fetchDiscussions]);

  // Filter client-side (search + stance)
  const filteredDiscussions = useMemo(() => {
    let result = discussions;
    
    // Search filter
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase().trim();
      result = result.filter(d => 
        d.title.toLowerCase().includes(q) ||
        d.content.toLowerCase().includes(q) ||
        d.tags?.some(t => t.toLowerCase().includes(q)) ||
        d.author.name.toLowerCase().includes(q)
      );
    }
    
    // Stance filter (filter by majority stance)
    if (stanceFilter !== 'all') {
      result = result.filter(d => {
        if (!d.stanceStats) return false;
        const { pro, con, neutral } = d.stanceStats;
        const max = Math.max(pro, con, neutral);
        if (max === 0) return false;
        if (stanceFilter === 'pro' && pro === max) return true;
        if (stanceFilter === 'con' && con === max) return true;
        if (stanceFilter === 'neutral' && neutral === max) return true;
        return false;
      });
    }
    
    return result;
  }, [discussions, debouncedQuery, stanceFilter]);

  // Counts per stance
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

  // Load more
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchDiscussions(nextPage, false);
  };

  // Create discussion
  const handleCreateClick = () => {
    if (isAuthenticated) {
      setIsCreateOpen(true);
    } else {
      setIsJoinOpen(true);
    }
  };

  const currentSort = SORT_OPTIONS.find(s => s.value === sortBy) || SORT_OPTIONS[0];
  const SortIcon = currentSort.icon;

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
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 mb-3">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] font-medium text-amber-400">{t('app.name')}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-1">
                <span className="gradient-text">{t('discussionsPage.heading')}</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                {total > 0 ? `${total.toLocaleString()}` : t('discussionsPage.subtitle')}
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
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
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
                  className={`inline-flex items-center gap-2 px-3 h-9 rounded-full text-xs font-medium border transition-all ${
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
              className="inline-flex items-center gap-2 px-3 h-9 rounded-lg bg-card/40 border border-border/40 text-xs text-foreground hover:bg-card/60 transition-all"
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
        {(debouncedQuery || stanceFilter !== 'all') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <Filter className="w-3 h-3" />
            <span>{t('discussionsPage.filterIndicator', { shown: filteredDiscussions.length, total: discussions.length })}</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setStanceFilter('all');
              }}
              className="text-amber-400 hover:underline"
            >
              {t('discussionsPage.clearFilters')}
            </button>
          </motion.div>
        )}
      </div>

      {/* Discussions List */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <DiscussionSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/10 grid place-items-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">{t('discussionsPage.errorTitle')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => fetchDiscussions(1, true)} variant="outline" size="sm">
              {t('common.retry')}
            </Button>
          </motion.div>
        )}

        {/* Empty state - no results from filter */}
        {!isLoading && !error && filteredDiscussions.length === 0 && discussions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-amber-500/10 grid place-items-center mb-4">
              <Search className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">{t('discussionsPage.noResults')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('discussionsPage.noResultsHint')}</p>
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
          </motion.div>
        )}

        {/* Empty state - no discussions at all */}
        {!isLoading && !error && discussions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-amber-500/10 grid place-items-center mb-4">
              <Inbox className="w-10 h-10 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">{t('discussionsPage.empty')}</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              {t('discussionsPage.emptyHint')}
            </p>
            <Button
              onClick={handleCreateClick}
              size="lg"
              className="bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:opacity-90 gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('discussionsPage.startFirst')}
            </Button>
          </motion.div>
        )}

        {/* Discussions list */}
        {!isLoading && !error && filteredDiscussions.length > 0 && (
          <>
            {/* Mobile: Cards */}
            <div className="md:hidden space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredDiscussions.map(discussion => (
                  <DiscussionCard key={discussion._id} discussion={discussion} />
                ))}
              </AnimatePresence>
            </div>

            {/* Desktop: Compact rows */}
            <div className="hidden md:block space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredDiscussions.map(discussion => (
                  <DiscussionRow key={discussion._id} discussion={discussion} />
                ))}
              </AnimatePresence>
            </div>

            {/* Load more */}
            {hasMore && !debouncedQuery && stanceFilter === 'all' && (
              <div className="mt-8 text-center">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  variant="outline"
                  size="lg"
                  className="min-w-[180px]"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      {t('discussionsPage.loadingMore')}
                    </>
                  ) : (
                    t('discussionsPage.loadMoreLabel')
                  )}
                </Button>
              </div>
            )}

            {/* End of list */}
            {!hasMore && filteredDiscussions.length >= 10 && (
              <div className="mt-8 text-center text-xs text-muted-foreground">
                {t('discussionsPage.endOfList')}
              </div>
            )}
          </>
        )}
      </div>

      {/* Dialogs */}
      <LoginDialog open={false} onOpenChange={() => {}} />
      <JoinDialog open={isJoinOpen} onOpenChange={setIsJoinOpen} />
      <CreateDiscussionDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}

// Wrapper with Sidebar + Navbar (matching App.tsx pattern)
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
