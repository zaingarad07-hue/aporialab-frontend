import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import type { DiscussionDetail } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { CreateDiscussionDialog } from '@/components/CreateDiscussionDialog';
import {
  MessageCircle,
  TrendingUp,
  Clock,
  Star,
  Heart,
  Loader2,
  Plus,
  Sparkles,
  Lock,
  Eye,
  ArrowLeft,
} from 'lucide-react';

const filterIcons = {
  trending: TrendingUp,
  featured: Star,
  live: MessageCircle,
  timed: Clock,
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffMin < 1) return 'الآن';
  if (diffMin < 60) return `منذ ${diffMin}د`;
  if (diffHour < 24) return `منذ ${diffHour}س`;
  if (diffDay < 7) return `منذ ${diffDay}ي`;
  return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
}

function calculateStancePercents(stats?: { pro: number; con: number; neutral: number }) {
  if (!stats) return null;
  const total = stats.pro + stats.con + stats.neutral;
  if (total === 0) return null;
  return {
    pro: (stats.pro / total) * 100,
    con: (stats.con / total) * 100,
    neutral: (stats.neutral / total) * 100,
  };
}

export function Discussions() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('trending');
  const [discussions, setDiscussions] = useState<DiscussionDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.getDiscussions({
          sort: activeFilter,
          page: 1,
        });
        if (response.success) {
          const data = response.data || response;
          const list = (data as { discussions?: DiscussionDetail[] }).discussions || [];
          setDiscussions(list);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'فشل تحميل النقاشات';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDiscussions();
  }, [activeFilter, refreshKey]);

  const handleLike = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    try {
      await api.likeDiscussion(id);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleAuthorClick = (authorId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (authorId) {
      navigate(`/profile/${authorId}`);
    }
  };

  const handleCreateSuccess = () => {
    setRefreshKey((k) => k + 1);
  };

  const getLevelColor = (category: string) => {
    if (category === 'advanced') return 'bg-red-500/15 text-red-400 border-red-500/30';
    if (category === 'intermediate') return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  };

  const getLevelText = (category: string) => {
    if (category === 'advanced') return 'متقدم';
    if (category === 'intermediate') return 'متوسط';
    return 'مبتدئ';
  };

  const filters = ['trending', 'featured', 'live', 'timed'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section id="discussions" className="py-20 px-4 relative">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-medium text-amber-400">النقاشات النشطة</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('discussions.title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('discussions.subtitle')}
          </p>
        </motion.div>

        {/* Filters + Create Button */}
        <motion.div 
          className="flex flex-wrap justify-between items-center gap-4 mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const Icon = filterIcons[filter as keyof typeof filterIcons];
              return (
                <motion.div
                  key={filter}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={() => setActiveFilter(filter)}
                    variant={activeFilter === filter ? 'default' : 'outline'}
                    className="gap-2"
                    size="sm"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t(`discussions.filters.${filter}`)}
                  </Button>
                </motion.div>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {!isLoading && discussions.length > 0 && (
              <span className="text-xs text-muted-foreground font-mono">
                {discussions.length} نقاش
              </span>
            )}
            
            {isAuthenticated ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  size="sm"
                  className="gap-2 bg-gradient-to-r from-amber-400 to-amber-600 text-background hover:opacity-90 shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                >
                  <Plus className="w-4 h-4" />
                  ابدأ نقاشاً جديداً
                </Button>
              </motion.div>
            ) : (
              <Link to="/" className="text-sm text-amber-400 hover:underline">
                سجّل للمشاركة →
              </Link>
            )}
          </div>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">جاري تحميل النقاشات...</p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => setRefreshKey(k => k + 1)} variant="outline" size="sm">
              إعادة المحاولة
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && discussions.length === 0 && (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6">
              <MessageCircle className="w-10 h-10 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">لا توجد نقاشات بعد</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              كن أول من يطرح سؤالاً فلسفياً عميقاً ويجمع المفكرين حوله
            </p>
            {isAuthenticated && (
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="gap-2 bg-gradient-to-r from-amber-400 to-amber-600 text-background"
              >
                <Plus className="w-4 h-4" />
                ابدأ النقاش الأول
              </Button>
            )}
          </motion.div>
        )}

        {/* Discussion Cards */}
        {!isLoading && discussions.length > 0 && (
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {discussions.map((discussion) => {
              const isAuthorFounder = discussion.author.isFoundingMember;
              const stancePercents = calculateStancePercents(discussion.stanceStats);
              const hasTimer = !!discussion.expiresAt;
              const isExpired = discussion.isExpired;
              
              return (
                <motion.div
                  key={discussion._id}
                  variants={cardVariants}
                  whileHover={{ 
                    y: -6,
                    transition: { type: 'spring', stiffness: 300, damping: 20 }
                  }}
                >
                  <Link
                    to={`/discussion/${discussion._id}`}
                    className="group relative flex flex-col rounded-2xl bg-card border border-border/50 overflow-hidden hover:border-primary/50 transition-all duration-300 h-full hover:shadow-[0_15px_40px_-15px_rgba(251,191,36,0.3)]"
                  >
                    {/* Top accent bar */}
                    <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-amber-500/30 to-transparent group-hover:via-amber-500 transition-all" />
                    
                    {/* Header with badges */}
                    <div className="p-5 pb-3">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] ${getLevelColor(discussion.category)}`}>
                          {getLevelText(discussion.category)}
                        </Badge>
                        
                        {isExpired ? (
                          <Badge className="bg-red-500/10 text-red-400 border-red-500/30 gap-1 text-[10px]">
                            <Lock className="w-2.5 h-2.5" />
                            مؤرشف
                          </Badge>
                        ) : hasTimer ? (
                          <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30 gap-1 text-[10px]">
                            <Clock className="w-2.5 h-2.5" />
                            مؤقت
                          </Badge>
                        ) : null}

                        {!isExpired && discussion.commentCount > 0 && (
                          <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-green-400">
                            <span className="relative flex w-1.5 h-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                              <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-green-500" />
                            </span>
                            نشط
                          </span>
                        )}
                      </div>

                      <h3 className="text-base md:text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                        {discussion.title}
                      </h3>

                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                        {discussion.content}
                      </p>

                      {/* Tags */}
                      {discussion.tags && discussion.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {discussion.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Stance Bar (if has comments with stances) */}
                      {stancePercents && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-muted-foreground">توزيع المواقف</span>
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {(discussion.stanceStats?.pro || 0) + (discussion.stanceStats?.con || 0) + (discussion.stanceStats?.neutral || 0)} رأي
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-secondary/30 overflow-hidden flex gap-0.5 p-0.5">
                            {stancePercents.pro > 0 && (
                              <div 
                                className="h-full rounded-full bg-green-500"
                                style={{ width: `${stancePercents.pro}%` }}
                              />
                            )}
                            {stancePercents.con > 0 && (
                              <div 
                                className="h-full rounded-full bg-red-500"
                                style={{ width: `${stancePercents.con}%` }}
                              />
                            )}
                            {stancePercents.neutral > 0 && (
                              <div 
                                className="h-full rounded-full bg-amber-500"
                                style={{ width: `${stancePercents.neutral}%` }}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Author */}
                    <div
                      className="px-5 py-2.5 border-t border-border/50 bg-secondary/20 hover:bg-secondary/40 transition-colors cursor-pointer"
                      onClick={(e) => handleAuthorClick(discussion.author._id, e)}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-500/5 grid place-items-center text-[11px] font-bold text-amber-400 overflow-hidden ${isAuthorFounder ? 'ring-2 ring-amber-400/60 ring-offset-1 ring-offset-card' : ''}`}>
                          {discussion.author.avatar ? (
                            <img src={discussion.author.avatar} alt={discussion.author.name} className="w-full h-full object-cover" />
                          ) : (
                            discussion.author.name.charAt(0)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-xs font-semibold truncate hover:text-primary transition-colors">
                              {discussion.author.name}
                            </p>
                            {isAuthorFounder && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0 rounded-full bg-amber-500/15 border border-amber-500/30 text-[8px] text-amber-400 font-bold">
                                <Sparkles className="w-2 h-2" />
                                مؤسس
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {(discussion.author.reputation || 0).toLocaleString()} نقطة · {formatRelativeTime(discussion.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Footer Stats */}
                    <div className="px-5 py-2.5 border-t border-border/50 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                        <span className="flex items-center gap-1" title="التعليقات">
                          <MessageCircle className="w-3.5 h-3.5" />
                          {discussion.commentCount}
                        </span>
                        <span className="flex items-center gap-1" title="المشاهدات">
                          <Eye className="w-3.5 h-3.5" />
                          {discussion.views}
                        </span>
                      </div>
                      <motion.button
                        onClick={(e) => handleLike(discussion._id, e)}
                        className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-amber-500"
                        whileTap={{ scale: 0.9 }}
                        title="أعجبني"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-mono">{discussion.upvotes.length}</span>
                      </motion.button>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* View All Link */}
        {!isLoading && discussions.length >= 6 && (
          <motion.div 
            className="text-center mt-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link
              to="/search"
              className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 group"
            >
              عرض جميع النقاشات
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}
      </div>

      <CreateDiscussionDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleCreateSuccess}
      />
    </section>
  );
}
