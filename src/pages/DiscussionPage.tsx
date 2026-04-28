import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/services/api';
import type { DiscussionDetail, Comment, Stance, ReactionType, StanceStats } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowRight,
  MessageCircle,
  Eye,
  Send,
  Loader2,
  Sparkles,
  Trash2,
  Lightbulb,
  BookOpen,
  Zap,
  HelpCircle,
  ChevronUp,
  Lock,
  Clock,
  Users,
} from 'lucide-react';

const REACTION_CONFIG: Record<ReactionType, {
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
  bgClass: string;
  activeBgClass: string;
}> = {
  logical: {
    icon: Lightbulb,
    label: 'منطقي',
    description: 'حجة محكمة وعقلانية',
    color: '#a78bfa',
    bgClass: 'hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-300',
    activeBgClass: 'bg-purple-500/15 border-purple-500/50 text-purple-300',
  },
  evidenced: {
    icon: BookOpen,
    label: 'مدعوم',
    description: 'يستند لمصادر أو أمثلة',
    color: '#60a5fa',
    bgClass: 'hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-300',
    activeBgClass: 'bg-blue-500/15 border-blue-500/50 text-blue-300',
  },
  insightful: {
    icon: Zap,
    label: 'مثير',
    description: 'يفتح زاوية جديدة للنقاش',
    color: '#fbbf24',
    bgClass: 'hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-300',
    activeBgClass: 'bg-amber-500/15 border-amber-500/50 text-amber-300',
  },
  clarify: {
    icon: HelpCircle,
    label: 'يحتاج توضيح',
    description: 'غامض أو ينقصه شرح',
    color: '#f472b6',
    bgClass: 'hover:bg-pink-500/10 hover:border-pink-500/30 hover:text-pink-300',
    activeBgClass: 'bg-pink-500/15 border-pink-500/50 text-pink-300',
  },
};

const STANCE_CONFIG: Record<Stance, {
  label: string;
  symbol: string;
  color: string;
  bgClass: string;
  activeBgClass: string;
  borderClass: string;
}> = {
  pro: {
    label: 'أوافق',
    symbol: '⊕',
    color: '#22c55e',
    bgClass: 'hover:bg-green-500/10 hover:border-green-500/40',
    activeBgClass: 'bg-green-500/15 border-green-500 shadow-[0_0_24px_rgba(34,197,94,0.25)]',
    borderClass: 'border-r-green-500',
  },
  con: {
    label: 'أعارض',
    symbol: '⊖',
    color: '#ef4444',
    bgClass: 'hover:bg-red-500/10 hover:border-red-500/40',
    activeBgClass: 'bg-red-500/15 border-red-500 shadow-[0_0_24px_rgba(239,68,68,0.25)]',
    borderClass: 'border-r-red-500',
  },
  neutral: {
    label: 'محايد',
    symbol: '◐',
    color: '#f59e0b',
    bgClass: 'hover:bg-amber-500/10 hover:border-amber-500/40',
    activeBgClass: 'bg-amber-500/15 border-amber-500 shadow-[0_0_24px_rgba(245,158,11,0.25)]',
    borderClass: 'border-r-amber-500',
  },
};

function formatTimeRemaining(expiresAt: string): { text: string; urgent: boolean; expired: boolean } {
  const now = new Date().getTime();
  const expires = new Date(expiresAt).getTime();
  const diff = expires - now;

  if (diff <= 0) return { text: 'انتهى الوقت', urgent: false, expired: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const urgent = diff < 60 * 60 * 1000; // أقل من ساعة

  if (days > 0) return { text: `${days}ي ${hours}س متبقية`, urgent: false, expired: false };
  if (hours > 0) return { text: `${hours}س ${minutes}د متبقية`, urgent, expired: false };
  if (minutes > 0) return { text: `${minutes}د ${seconds}ث متبقية`, urgent: true, expired: false };
  return { text: `${seconds}ث متبقية`, urgent: true, expired: false };
}

function calculateProgress(createdAt: string, expiresAt: string): number {
  const start = new Date(createdAt).getTime();
  const end = new Date(expiresAt).getTime();
  const now = new Date().getTime();
  const total = end - start;
  const elapsed = now - start;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

export function DiscussionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [discussion, setDiscussion] = useState<DiscussionDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newComment, setNewComment] = useState('');
  const [selectedStance, setSelectedStance] = useState<Stance | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [activeFilter, setActiveFilter] = useState<'all' | Stance>('all');
  const [newCommentId, setNewCommentId] = useState<string | null>(null);
  
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  
  const [timeRemaining, setTimeRemaining] = useState<{ text: string; urgent: boolean; expired: boolean } | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    document.title = discussion ? `${discussion.title} - AporiaLab` : 'نقاش - AporiaLab';
  }, [discussion]);

  useEffect(() => {
    const fetchDiscussion = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.getDiscussion(id);
        if (response.success && response.discussion) {
          setDiscussion(response.discussion);
          setComments(response.discussion.comments || []);
        } else {
          setError('لم يتم العثور على النقاش');
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'حدث خطأ';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDiscussion();
  }, [id]);

  // Live timer
  useEffect(() => {
    if (!discussion?.expiresAt) return;
    
    const updateTimer = () => {
      const remaining = formatTimeRemaining(discussion.expiresAt!);
      setTimeRemaining(remaining);
      setProgress(calculateProgress(discussion.createdAt, discussion.expiresAt!));
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [discussion?.expiresAt, discussion?.createdAt]);

  useEffect(() => {
    if (newCommentId) {
      const timer = setTimeout(() => setNewCommentId(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [newCommentId]);

  const isExpired = useMemo(() => {
    if (!discussion?.expiresAt) return false;
    return new Date() > new Date(discussion.expiresAt);
  }, [discussion?.expiresAt]);

  const stanceStats: StanceStats = useMemo(() => {
    const stats = { pro: 0, con: 0, neutral: 0 };
    comments.forEach(c => { if (c.stance) stats[c.stance]++; });
    return stats;
  }, [comments]);

  const totalComments = stanceStats.pro + stanceStats.con + stanceStats.neutral;
  
  const stancePercentages = useMemo(() => {
    if (totalComments === 0) return { pro: 0, con: 0, neutral: 0 };
    return {
      pro: (stanceStats.pro / totalComments) * 100,
      con: (stanceStats.con / totalComments) * 100,
      neutral: (stanceStats.neutral / totalComments) * 100,
    };
  }, [stanceStats, totalComments]);

  const filteredComments = useMemo(() => {
    if (activeFilter === 'all') return comments;
    return comments.filter(c => c.stance === activeFilter);
  }, [comments, activeFilter]);

  const groupedComments = useMemo(() => {
    if (activeFilter !== 'all') return null;
    return {
      pro: comments.filter(c => c.stance === 'pro'),
      con: comments.filter(c => c.stance === 'con'),
      neutral: comments.filter(c => c.stance === 'neutral'),
    };
  }, [comments, activeFilter]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !discussion) return;
    
    if (!selectedStance) {
      toast.warning('اختر موقفك أولاً', {
        description: 'هل أنت مع، ضد، أم محايد؟',
      });
      return;
    }
    
    if (!newComment.trim()) {
      toast.warning('اكتب تعليقك أولاً');
      return;
    }
    
    if (isSubmitting || isExpired) return;

    setIsSubmitting(true);
    try {
      const response = await api.addComment(discussion._id, newComment.trim(), selectedStance);
      if (response.success && response.comment) {
        const addedComment = response.comment;
        setComments([addedComment, ...comments]);
        setNewCommentId(addedComment._id);
        setNewComment('');
        setSelectedStance(null);
        setDiscussion({ ...discussion, commentCount: discussion.commentCount + 1 });
        toast.success('تم نشر تعليقك', {
          description: 'شكراً على مشاركتك في النقاش',
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل إرسال التعليق';
      toast.error('فشل نشر التعليق', { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvoteComment = async (commentId: string) => {
    if (!isAuthenticated) {
      toast.info('سجّل دخولك للتفاعل مع التعليقات');
      return;
    }
    if (isExpired) {
      toast.warning('انتهى وقت النقاش');
      return;
    }
    try {
      const response = await api.upvoteComment(commentId);
      if (response.success) {
        setComments(prev => prev.map(c => {
          if (c._id !== commentId) return c;
          const userId = user?.id || '';
          const upvoted = response.upvoted;
          const newUpvotes = upvoted
            ? [...c.upvotes, userId]
            : c.upvotes.filter(u => u !== userId);
          return {
            ...c,
            upvotes: newUpvotes,
            qualityScore: response.qualityScore || c.qualityScore,
          };
        }));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل التصويت';
      toast.error(msg);
    }
  };

  const handleReact = async (commentId: string, type: ReactionType) => {
    if (!isAuthenticated) {
      toast.info('سجّل دخولك للتفاعل مع التعليقات');
      return;
    }
    if (isExpired) {
      toast.warning('انتهى وقت النقاش');
      return;
    }
    try {
      const response = await api.reactToComment(commentId, type);
      if (response.success) {
        setComments(prev => prev.map(c => {
          if (c._id !== commentId) return c;
          const userId = user?.id || '';
          const isActive = response.active;
          const newReactions = { ...c.reactions };
          newReactions[type] = isActive
            ? [...(c.reactions[type] || []), userId]
            : (c.reactions[type] || []).filter(u => u !== userId);
          return {
            ...c,
            reactions: newReactions,
            qualityScore: response.qualityScore || c.qualityScore,
          };
        }));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل التفاعل';
      toast.error(msg);
    }
  };

  const handleDeleteComment = async () => {
    if (!deleteCommentId || isDeletingComment) return;
    setIsDeletingComment(true);
    try {
      const response = await api.deleteComment(deleteCommentId);
      if (response.success) {
        setComments(comments.filter(c => c._id !== deleteCommentId));
        if (discussion) {
          setDiscussion({ ...discussion, commentCount: Math.max(0, discussion.commentCount - 1) });
        }
        toast.success('تم حذف التعليق');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل حذف التعليق';
      toast.error(msg);
    } finally {
      setIsDeletingComment(false);
      setDeleteCommentId(null);
    }
  };

  const getLevelColor = (category: string) => {
    if (category === 'advanced') return 'bg-red-500/20 text-red-400';
    if (category === 'intermediate') return 'bg-amber-500/20 text-amber-400';
    return 'bg-emerald-500/20 text-emerald-400';
  };

  const getLevelText = (category: string) => {
    if (category === 'advanced') return 'متقدم';
    if (category === 'intermediate') return 'متوسط';
    return 'مبتدئ';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !discussion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">{error || 'النقاش غير موجود'}</h1>
          <Button onClick={() => navigate('/')}>العودة للرئيسية</Button>
        </div>
      </div>
    );
  }

  const isAuthorFounder = discussion.author.isFoundingMember;
  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Back link */}
      <div className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للنقاشات
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        
        {/* Discussion Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge className={getLevelColor(discussion.category)}>
                {getLevelText(discussion.category)}
              </Badge>
              {discussion.tags?.slice(0, 5).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {isExpired && (
                <Badge className="bg-red-500/15 text-red-400 border-red-500/30 gap-1">
                  <Lock className="w-3 h-3" />
                  مؤرشف
                </Badge>
              )}
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold leading-relaxed mb-4">
              {discussion.title}
            </h1>
            
            <div className="prose prose-invert max-w-none mb-5">
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {discussion.content}
              </p>
            </div>
            
            <div className="flex items-center gap-3 pt-4 border-t border-border flex-wrap">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-500/5 flex items-center justify-center text-amber-400 font-bold text-sm relative ${isAuthorFounder ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-background' : ''}`}>
                {discussion.author.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm flex items-center gap-2 flex-wrap">
                  {discussion.author.name}
                  {isAuthorFounder && (
                    <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px] px-2 py-0">
                      <Sparkles className="w-2.5 h-2.5 ml-1" />
                      مؤسس
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground font-mono mt-0.5">
                  {formatDate(discussion.createdAt)}
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {discussion.views}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {totalComments}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Live Timer Card */}
        {discussion.expiresAt && timeRemaining && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={`bg-card border rounded-xl p-4 ${
              timeRemaining.expired 
                ? 'border-red-500/30 bg-red-500/5' 
                : timeRemaining.urgent 
                ? 'border-orange-500/40 bg-orange-500/5' 
                : 'border-border'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {timeRemaining.expired ? (
                  <Lock className="w-4 h-4 text-red-400" />
                ) : (
                  <Clock className={`w-4 h-4 ${timeRemaining.urgent ? 'text-orange-400 animate-pulse' : 'text-amber-400'}`} />
                )}
                <span className={`font-semibold text-sm font-mono ${
                  timeRemaining.expired ? 'text-red-400' : timeRemaining.urgent ? 'text-orange-400' : 'text-foreground'
                }`}>
                  {timeRemaining.expired ? 'أرشيف - النقاش مغلق' : timeRemaining.text}
                </span>
              </div>
              {!timeRemaining.expired && (
                <span className="text-xs text-muted-foreground font-mono">
                  {Math.floor(progress)}% منقضي
                </span>
              )}
            </div>
            {!timeRemaining.expired && (
              <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full ${timeRemaining.urgent ? 'bg-orange-500' : 'bg-amber-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </motion.div>
        )}

        {/* Stance Meter Card */}
        {totalComments > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                توزيع المواقف
              </span>
              <span className="text-xs font-mono font-semibold">{totalComments} رأي</span>
            </div>
            <div className="h-2 bg-secondary/30 rounded-full overflow-hidden flex gap-0.5 p-0.5 mb-3">
              {stancePercentages.pro > 0 && (
                <motion.div 
                  className="h-full rounded-full relative overflow-hidden"
                  style={{ backgroundColor: STANCE_CONFIG.pro.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${stancePercentages.pro}%` }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_3s_infinite]" />
                </motion.div>
              )}
              {stancePercentages.con > 0 && (
                <motion.div 
                  className="h-full rounded-full"
                  style={{ backgroundColor: STANCE_CONFIG.con.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${stancePercentages.con}%` }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                />
              )}
              {stancePercentages.neutral > 0 && (
                <motion.div 
                  className="h-full rounded-full"
                  style={{ backgroundColor: STANCE_CONFIG.neutral.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${stancePercentages.neutral}%` }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                />
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['pro', 'con', 'neutral'] as Stance[]).map(stance => (
                <div 
                  key={stance}
                  className="flex items-center gap-2 p-2 bg-secondary/20 rounded-lg border border-border/50"
                >
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ 
                      backgroundColor: STANCE_CONFIG[stance].color,
                      boxShadow: `0 0 8px ${STANCE_CONFIG[stance].color}`
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-muted-foreground">{STANCE_CONFIG[stance].label}</div>
                    <div className="font-mono font-bold text-sm">
                      {stanceStats[stance]}
                      <span className="text-[10px] text-muted-foreground mr-1">
                        {Math.round(stancePercentages[stance])}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Comment Input - with stance selector */}
        {!isExpired && isAuthenticated && (
          <motion.form 
            onSubmit={handleSubmitComment}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card border border-border rounded-2xl p-5 space-y-4"
          >
            <div>
              <h3 className="text-sm font-semibold mb-1">شاركنا رأيك</h3>
              <p className="text-xs text-muted-foreground">اختر موقفك ثم اكتب تعليقك</p>
            </div>
            
            {/* Stance Selector */}
            <div className="grid grid-cols-3 gap-2">
              {(['pro', 'con', 'neutral'] as Stance[]).map(stance => {
                const cfg = STANCE_CONFIG[stance];
                const isSelected = selectedStance === stance;
                return (
                  <button
                    key={stance}
                    type="button"
                    onClick={() => setSelectedStance(isSelected ? null : stance)}
                    className={`relative p-3 rounded-xl border-2 transition-all ${
                      isSelected ? cfg.activeBgClass : `bg-secondary/20 border-border ${cfg.bgClass}`
                    }`}
                  >
                    {isSelected && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 left-2 w-4 h-4 rounded-full grid place-items-center text-[10px] font-bold"
                        style={{ backgroundColor: cfg.color, color: '#000' }}
                      >
                        ✓
                      </motion.div>
                    )}
                    <div className="text-2xl mb-1" style={{ color: cfg.color }}>
                      {cfg.symbol}
                    </div>
                    <div className="text-xs font-semibold">{cfg.label}</div>
                  </button>
                );
              })}
            </div>
            
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={selectedStance ? 'اكتب حجتك بوضوح...' : 'اختر موقفك أولاً ثم اكتب رأيك'}
              className="w-full min-h-24 p-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y text-sm"
              maxLength={5000}
              disabled={isSubmitting || !selectedStance}
            />
            
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground font-mono">
                {newComment.length}/5000
              </span>
              <Button
                type="submit"
                disabled={isSubmitting || !selectedStance || !newComment.trim()}
                className="gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                نشر التعليق
              </Button>
            </div>
          </motion.form>
        )}

        {/* Expired notice */}
        {isExpired && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-center">
            <Lock className="w-6 h-6 mx-auto mb-2 text-red-400/70" />
            <p className="text-sm text-red-400/80">
              انتهى وقت النقاش - لا يمكن إضافة تعليقات أو التصويت
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              يمكنك قراءة التعليقات والاستفادة من النقاش كأرشيف
            </p>
          </div>
        )}

        {/* Login prompt */}
        {!isAuthenticated && !isExpired && (
          <div className="bg-secondary/30 border border-border rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">
              <Link to="/" className="text-primary hover:underline">سجّل دخولك</Link>
              {' '}للمشاركة في النقاش
            </p>
          </div>
        )}

        {/* Filter Tabs */}
        {totalComments > 0 && (
          <div className="bg-card border border-border rounded-xl p-1.5 flex gap-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeFilter === 'all' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              الكل
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-secondary/50 rounded-full">
                {totalComments}
              </span>
            </button>
            {(['pro', 'con', 'neutral'] as Stance[]).map(stance => (
              <button
                key={stance}
                onClick={() => setActiveFilter(stance)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                  activeFilter === stance ? 'bg-secondary' : 'text-muted-foreground hover:text-foreground'
                }`}
                style={activeFilter === stance ? { color: STANCE_CONFIG[stance].color } : {}}
              >
                <span 
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: STANCE_CONFIG[stance].color }}
                />
                {STANCE_CONFIG[stance].label}
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-secondary/50 rounded-full">
                  {stanceStats[stance]}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Comments */}
        <div className="space-y-3">
          {totalComments === 0 ? (
            <div className="bg-card border border-border border-dashed rounded-xl p-12 text-center">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground">لا توجد تعليقات بعد</p>
              <p className="text-xs text-muted-foreground/70 mt-1">كن أول من يشارك برأيه</p>
            </div>
          ) : activeFilter === 'all' && groupedComments ? (
            <>
              {(['pro', 'con', 'neutral'] as Stance[]).map(stance => {
                const stanceComments = groupedComments[stance];
                if (stanceComments.length === 0) return null;
                
                return (
                  <div key={stance} className="space-y-3">
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-border to-transparent" />
                      <div 
                        className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
                        style={{ color: STANCE_CONFIG[stance].color }}
                      >
                        <span className="text-base">{STANCE_CONFIG[stance].symbol}</span>
                        الموقف: {STANCE_CONFIG[stance].label}
                        <span className="text-[10px] opacity-60 font-mono">({stanceComments.length})</span>
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                    </div>
                    
                    <AnimatePresence>
                      {stanceComments.map(comment => (
                        <CommentCard 
                          key={comment._id}
                          comment={comment}
                          isNew={newCommentId === comment._id}
                          isOwner={user?.id === comment.author._id}
                          currentUserId={user?.id || ''}
                          isExpired={isExpired}
                          onUpvote={() => handleUpvoteComment(comment._id)}
                          onReact={(type) => handleReact(comment._id, type)}
                          onDelete={() => setDeleteCommentId(comment._id)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                );
              })}
            </>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredComments.map(comment => (
                <CommentCard 
                  key={comment._id}
                  comment={comment}
                  isNew={newCommentId === comment._id}
                  isOwner={user?.id === comment.author._id}
                  currentUserId={user?.id || ''}
                  isExpired={isExpired}
                  onUpvote={() => handleUpvoteComment(comment._id)}
                  onReact={(type) => handleReact(comment._id, type)}
                  onDelete={() => setDeleteCommentId(comment._id)}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteCommentId} onOpenChange={(open) => !open && setDeleteCommentId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف التعليق؟</AlertDialogTitle>
            <AlertDialogDescription>
              لا يمكن التراجع عن هذا الإجراء. سيتم حذف التعليق نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteComment}
              disabled={isDeletingComment}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeletingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style>{`
        @keyframes shimmer {
          0%, 50% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}

// ===========================================
// CommentCard - Premium Design
// ===========================================

interface CommentCardProps {
  comment: Comment;
  isNew: boolean;
  isOwner: boolean;
  currentUserId: string;
  isExpired: boolean;
  onUpvote: () => void;
  onReact: (type: ReactionType) => void;
  onDelete: () => void;
}

function CommentCard({ comment, isNew, isOwner, currentUserId, isExpired, onUpvote, onReact, onDelete }: CommentCardProps) {
  const stanceCfg = STANCE_CONFIG[comment.stance];
  const isFounder = comment.author.isFoundingMember;
  const userUpvoted = comment.upvotes?.includes(currentUserId);
  
  const formatRelative = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffMin < 1) return 'الآن';
    if (diffMin < 60) return `${diffMin}د`;
    if (diffHour < 24) return `${diffHour}س`;
    if (diffDay < 7) return `${diffDay}ي`;
    return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isNew ? [1, 1.02, 1] : 1,
      }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className={`group relative bg-card border border-border rounded-xl p-4 hover:bg-secondary/20 transition-all overflow-hidden ${
        isNew ? 'ring-2 ring-amber-500/50 shadow-[0_0_20px_rgba(251,191,36,0.2)]' : ''
      }`}
    >
      {/* Stance indicator stripe */}
      <div 
        className="absolute top-0 right-0 w-1 h-full transition-all group-hover:w-1.5"
        style={{ backgroundColor: stanceCfg.color }}
      />

      <div className="relative pr-2">
        {/* Top row */}
        <div className="flex items-start gap-3 mb-3">
          <div 
            className={`w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-500/5 grid place-items-center text-xs font-bold text-amber-400 shrink-0 ${
              isFounder ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-card' : ''
            }`}
          >
            {comment.author.name.charAt(0)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{comment.author.name}</span>
              {isFounder && (
                <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[9px] px-1.5 py-0 gap-0.5">
                  <Sparkles className="w-2 h-2" />
                  مؤسس
                </Badge>
              )}
              <span 
                className="text-[10px] px-1.5 py-0 rounded font-mono"
                style={{ 
                  backgroundColor: `${stanceCfg.color}15`,
                  color: stanceCfg.color
                }}
              >
                {stanceCfg.symbol} {stanceCfg.label}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground/70 font-mono mt-0.5">
              {formatRelative(comment.createdAt)}
            </div>
          </div>
          
          {/* Quality Score */}
          {comment.qualityScore > 0 && (
            <div className="flex flex-col items-center px-2.5 py-1 bg-secondary/40 border border-border rounded-lg shrink-0">
              <div className="font-mono font-bold text-base leading-none bg-gradient-to-br from-amber-300 to-amber-600 bg-clip-text text-transparent">
                {comment.qualityScore}
              </div>
              <div className="text-[8px] text-muted-foreground tracking-wider uppercase font-semibold mt-0.5">
                جودة
              </div>
            </div>
          )}
        </div>
        
        {/* Content */}
        <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap mb-3">
          {comment.content}
        </p>
        
        {/* Reactions Bar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['logical', 'evidenced', 'insightful', 'clarify'] as ReactionType[]).map(type => {
            const cfg = REACTION_CONFIG[type];
            const Icon = cfg.icon;
            const count = (comment.reactions?.[type] || []).length;
            const isActive = (comment.reactions?.[type] || []).includes(currentUserId);
            
            return (
              <button
                key={type}
                onClick={() => onReact(type)}
                disabled={isExpired}
                title={cfg.description}
                className={`group/btn inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] transition-all ${
                  isActive 
                    ? cfg.activeBgClass
                    : `bg-secondary/30 border-border text-muted-foreground ${cfg.bgClass}`
                } ${isExpired ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{cfg.label}</span>
                {count > 0 && (
                  <span className="font-mono font-semibold text-[10px]">{count}</span>
                )}
              </button>
            );
          })}
          
          {/* Upvote */}
          <button
            onClick={onUpvote}
            disabled={isExpired}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-all mr-auto ${
              userUpvoted
                ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                : 'bg-secondary/30 border-border hover:border-amber-500/50 hover:text-amber-400'
            } ${isExpired ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <ChevronUp className={`w-3.5 h-3.5 ${userUpvoted ? 'animate-bounce' : ''}`} />
            <span className="font-mono">{comment.upvotes?.length || 0}</span>
          </button>
          
          {/* Delete (owner only) */}
          {isOwner && (
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] text-muted-foreground/50 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              title="حذف"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

