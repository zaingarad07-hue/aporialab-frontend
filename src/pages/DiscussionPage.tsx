import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/services/api';
import type { DiscussionDetail, Comment, Stance, ReactionType, StanceStats, EditHistoryEntry } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
  Edit3,
  MoreVertical,
  Lightbulb,
  X,
  Zap,
  HelpCircle,
  ChevronUp,
  Lock,
  Clock,
  Users,
  History,
  Award,
  Reply,
  CornerDownLeft,
  TrendingUp,
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
  illogical: {
    icon: X,
    label: 'غير منطقي',
    description: 'حجة ضعيفة أو متناقضة',
    color: '#ef4444',
    bgClass: 'hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300',
    activeBgClass: 'bg-red-500/15 border-red-500/50 text-red-300',
  },
  inspiring: {
    icon: Zap,
    label: 'مُلهم',
    description: 'يفتح زاوية جديدة وفكرة عميقة',
    color: '#fbbf24',
    bgClass: 'hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-300',
    activeBgClass: 'bg-amber-500/15 border-amber-500/50 text-amber-300',
  },
  unclear: {
    icon: HelpCircle,
    label: 'غامض',
    description: 'يحتاج توضيح أو شرح إضافي',
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

  const urgent = diff < 60 * 60 * 1000;

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

function formatRelativeTime(dateStr: string): string {
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
  
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  
  const [showEditDiscussion, setShowEditDiscussion] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editReason, setEditReason] = useState('');
  const [isSavingDiscussion, setIsSavingDiscussion] = useState(false);
  
  const [showDeleteDiscussion, setShowDeleteDiscussion] = useState(false);
  const [isDeletingDiscussion, setIsDeletingDiscussion] = useState(false);
  
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState<EditHistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const [showReputationInfo, setShowReputationInfo] = useState(false);
  
  const [timeRemaining, setTimeRemaining] = useState<{ text: string; urgent: boolean; expired: boolean } | null>(null);
  const [progress, setProgress] = useState(0);
  
  const replyInputRef = useRef<HTMLTextAreaElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
    if (replyingToId && replyInputRef.current) {
      setTimeout(() => replyInputRef.current?.focus(), 100);
    }
  }, [replyingToId]);

  useEffect(() => {
    if (editingCommentId && editInputRef.current) {
      setTimeout(() => editInputRef.current?.focus(), 100);
    }
  }, [editingCommentId]);

  const isExpired = useMemo(() => {
    if (!discussion?.expiresAt) return false;
    return new Date() > new Date(discussion.expiresAt);
  }, [discussion?.expiresAt]);

  const isDiscussionOwner = useMemo(() => {
    if (!discussion || !user) return false;
    return discussion.author._id === user.id;
  }, [discussion, user]);

  const topLevelComments = useMemo(() => {
    return comments.filter(c => !c.isReply);
  }, [comments]);

  const repliesByParent = useMemo(() => {
    const map: Record<string, Comment[]> = {};
    comments.filter(c => c.isReply && c.parentCommentId).forEach(c => {
      const pid = c.parentCommentId!;
      if (!map[pid]) map[pid] = [];
      map[pid].push(c);
    });
    Object.keys(map).forEach(k => {
      map[k].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    });
    return map;
  }, [comments]);

  const stanceStats: StanceStats = useMemo(() => {
    const stats = { pro: 0, con: 0, neutral: 0 };
    topLevelComments.forEach(c => { if (c.stance) stats[c.stance]++; });
    return stats;
  }, [topLevelComments]);

  const totalTopLevelComments = stanceStats.pro + stanceStats.con + stanceStats.neutral;
  
  const stancePercentages = useMemo(() => {
    if (totalTopLevelComments === 0) return { pro: 0, con: 0, neutral: 0 };
    return {
      pro: (stanceStats.pro / totalTopLevelComments) * 100,
      con: (stanceStats.con / totalTopLevelComments) * 100,
      neutral: (stanceStats.neutral / totalTopLevelComments) * 100,
    };
  }, [stanceStats, totalTopLevelComments]);

  const filteredComments = useMemo(() => {
    if (activeFilter === 'all') return topLevelComments;
    return topLevelComments.filter(c => c.stance === activeFilter);
  }, [topLevelComments, activeFilter]);

  const groupedComments = useMemo(() => {
    if (activeFilter !== 'all') return null;
    return {
      pro: topLevelComments.filter(c => c.stance === 'pro'),
      con: topLevelComments.filter(c => c.stance === 'con'),
      neutral: topLevelComments.filter(c => c.stance === 'neutral'),
    };
  }, [topLevelComments, activeFilter]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !discussion) return;
    
    if (!selectedStance) {
      toast.warning('اختر موقفك أولاً', { description: 'هل أنت مع، ضد، أم محايد؟' });
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
        toast.success('تم نشر تعليقك', { description: '+2 نقاط سمعة' });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل إرسال التعليق';
      toast.error('فشل نشر التعليق', { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!isAuthenticated || !discussion) return;
    if (!replyContent.trim()) {
      toast.warning('اكتب ردّك أولاً');
      return;
    }
    if (isSubmittingReply || isExpired) return;

    const parent = comments.find(c => c._id === parentId);
    if (!parent) return;

    setIsSubmittingReply(true);
    try {
      const response = await api.addComment(discussion._id, replyContent.trim(), parent.stance, parentId);
      if (response.success && response.comment) {
        setComments([...comments, response.comment]);
        setNewCommentId(response.comment._id);
        setReplyContent('');
        setReplyingToId(null);
        setDiscussion({ ...discussion, commentCount: discussion.commentCount + 1 });
        toast.success('تم نشر ردّك', { description: '+2 نقاط سمعة' });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل إرسال الردّ';
      toast.error('فشل نشر الردّ', { description: msg });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editCommentContent.trim() || isSavingEdit) return;
    setIsSavingEdit(true);
    try {
      const response = await api.editComment(commentId, editCommentContent.trim());
      if (response.success && response.comment) {
        setComments(prev => prev.map(c => c._id === commentId ? { ...c, ...response.comment! } : c));
        setEditingCommentId(null);
        setEditCommentContent('');
        toast.success('تم تعديل التعليق');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل التعديل';
      toast.error(msg);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleSaveDiscussion = async () => {
    if (!discussion || isSavingDiscussion) return;
    if (editTitle.trim().length < 5) {
      toast.warning('العنوان قصير جداً');
      return;
    }
    if (editContent.trim().length < 10) {
      toast.warning('المحتوى قصير جداً');
      return;
    }
    if (editTitle === discussion.title && editContent === discussion.content) {
      toast.info('لم يتغير شيء');
      return;
    }
    setIsSavingDiscussion(true);
    try {
      const response = await api.editDiscussion(discussion._id, {
        title: editTitle.trim(),
        content: editContent.trim(),
        reason: editReason.trim() || undefined,
      });
      if (response.success && response.discussion) {
        setDiscussion(response.discussion);
        setShowEditDiscussion(false);
        setEditReason('');
        toast.success('تم تعديل النقاش');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل التعديل';
      toast.error(msg);
    } finally {
      setIsSavingDiscussion(false);
    }
  };

  const handleDeleteDiscussion = async () => {
    if (!discussion || isDeletingDiscussion) return;
    setIsDeletingDiscussion(true);
    try {
      const response = await api.deleteDiscussion(discussion._id);
      if (response.success) {
        toast.success('تم حذف النقاش');
        navigate('/');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل الحذف';
      toast.error(msg);
      setIsDeletingDiscussion(false);
      setShowDeleteDiscussion(false);
    }
  };

  const handleLoadHistory = async () => {
    if (!discussion) return;
    setIsLoadingHistory(true);
    try {
      const response = await api.getDiscussionHistory(discussion._id);
      if (response.success) {
        setHistoryData(response.editHistory.reverse());
        setShowHistory(true);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل جلب السجل';
      toast.error(msg);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleUpvoteComment = async (commentId: string) => {
    if (!isAuthenticated) {
      toast.info('سجّل دخولك للتفاعل');
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
            qualityScore: response.qualityScore !== undefined ? response.qualityScore : c.qualityScore,
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
      toast.info('سجّل دخولك للتفاعل');
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
          const removedType = response.removedReactionType;
          const newReactions = { ...c.reactions };
          
          if (removedType && removedType !== type) {
            newReactions[removedType] = (c.reactions[removedType] || []).filter(u => u !== userId);
          }
          
          newReactions[type] = isActive
            ? [...(c.reactions[type] || []), userId]
            : (c.reactions[type] || []).filter(u => u !== userId);
          
          return {
            ...c,
            reactions: newReactions,
            qualityScore: response.qualityScore !== undefined ? response.qualityScore : c.qualityScore,
          };
        }));
        
        if (response.removedReactionType && response.removedReactionType !== type) {
          toast.info(`تم استبدال "${REACTION_CONFIG[response.removedReactionType].label}" بـ "${REACTION_CONFIG[type].label}"`);
        }
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
        setComments(comments.filter(c => c._id !== deleteCommentId && c.parentCommentId !== deleteCommentId));
        if (discussion) {
          setDiscussion({ ...discussion, commentCount: Math.max(0, discussion.commentCount - 1) });
        }
        toast.success('تم حذف التعليق');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل الحذف';
      toast.error(msg);
    } finally {
      setIsDeletingComment(false);
      setDeleteCommentId(null);
    }
  };

  const startEditingComment = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditCommentContent(comment.content);
  };

  const startEditingDiscussion = () => {
    if (!discussion) return;
    setEditTitle(discussion.title);
    setEditContent(discussion.content);
    setEditReason('');
    setShowEditDiscussion(true);
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
  const isEdited = (discussion.editsCount || 0) > 0;

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للنقاشات
          </Link>
          
          <button
            onClick={() => setShowReputationInfo(true)}
            className="text-xs text-muted-foreground hover:text-amber-400 transition-colors flex items-center gap-1"
            title="كيف تُحسب نقاط السمعة؟"
          >
            <Award className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">نقاط السمعة</span>
          </button>
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
            <div className="flex items-start gap-2 mb-3">
              <div className="flex flex-wrap items-center gap-2 flex-1">
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
                {isEdited && (
                  <button
                    onClick={handleLoadHistory}
                    disabled={isLoadingHistory}
                    className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isLoadingHistory ? (
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    ) : (
                      <History className="w-2.5 h-2.5" />
                    )}
                    مُعدَّل · {discussion.editsCount}
                  </button>
                )}
              </div>
              
              {isDiscussionOwner && (
                <DiscussionMenu
                  onEdit={startEditingDiscussion}
                  onDelete={() => setShowDeleteDiscussion(true)}
                />
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
              <Link 
                to={`/user/${discussion.author._id}`}
                className={`w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-500/5 flex items-center justify-center text-amber-400 font-bold text-sm relative hover:scale-105 transition-transform ${isAuthorFounder ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-background' : ''}`}
              >
                {discussion.author.name.charAt(0)}
              </Link>
              <div className="flex-1 min-w-0">
                <Link 
                  to={`/user/${discussion.author._id}`}
                  className="font-semibold text-sm flex items-center gap-2 flex-wrap hover:text-amber-400 transition-colors"
                >
                  {discussion.author.name}
                  {isAuthorFounder && (
                    <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px] px-2 py-0">
                      <Sparkles className="w-2.5 h-2.5 ml-1" />
                      مؤسس
                    </Badge>
                  )}
                </Link>
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
                  {discussion.commentCount}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Live Timer */}
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

        {/* Stance Meter */}
        {totalTopLevelComments > 0 && (
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
              <span className="text-xs font-mono font-semibold">{totalTopLevelComments} رأي</span>
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

        {/* Comment Input */}
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
              <span className="text-xs text-muted-foreground font-mono">{newComment.length}/5000</span>
              <Button
                type="submit"
                disabled={isSubmitting || !selectedStance || !newComment.trim()}
                className="gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                نشر التعليق
              </Button>
            </div>
          </motion.form>
        )}

        {isExpired && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 text-center">
            <Lock className="w-6 h-6 mx-auto mb-2 text-red-400/70" />
            <p className="text-sm text-red-400/80">انتهى وقت النقاش - لا يمكن إضافة تعليقات أو التصويت</p>
            <p className="text-xs text-muted-foreground mt-1">يمكنك قراءة التعليقات والاستفادة من النقاش كأرشيف</p>
          </div>
        )}

        {!isAuthenticated && !isExpired && (
          <div className="bg-secondary/30 border border-border rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">
              <Link to="/" className="text-primary hover:underline">سجّل دخولك</Link>{' '}للمشاركة
            </p>
          </div>
        )}

        {/* Filter Tabs */}
        {totalTopLevelComments > 0 && (
          <div className="bg-card border border-border rounded-xl p-1.5 flex gap-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeFilter === 'all' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              الكل
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-secondary/50 rounded-full">
                {totalTopLevelComments}
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
          {totalTopLevelComments === 0 ? (
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
                        <CommentThread
                          key={comment._id}
                          comment={comment}
                          replies={repliesByParent[comment._id] || []}
                          isNew={newCommentId === comment._id}
                          currentUserId={user?.id || ''}
                          isExpired={isExpired}
                          isAuthenticated={isAuthenticated}
                          editingCommentId={editingCommentId}
                          editCommentContent={editCommentContent}
                          isSavingEdit={isSavingEdit}
                          replyingToId={replyingToId}
                          replyContent={replyContent}
                          isSubmittingReply={isSubmittingReply}
                          replyInputRef={replyInputRef}
                          editInputRef={editInputRef}
                          onUpvote={handleUpvoteComment}
                          onReact={handleReact}
                          onDelete={(id) => setDeleteCommentId(id)}
                          onStartEdit={startEditingComment}
                          onCancelEdit={() => setEditingCommentId(null)}
                          onSaveEdit={handleEditComment}
                          onEditContentChange={setEditCommentContent}
                          onStartReply={(id) => { setReplyingToId(id); setReplyContent(''); }}
                          onCancelReply={() => setReplyingToId(null)}
                          onSubmitReply={handleSubmitReply}
                          onReplyContentChange={setReplyContent}
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
                <CommentThread
                  key={comment._id}
                  comment={comment}
                  replies={repliesByParent[comment._id] || []}
                  isNew={newCommentId === comment._id}
                  currentUserId={user?.id || ''}
                  isExpired={isExpired}
                  isAuthenticated={isAuthenticated}
                  editingCommentId={editingCommentId}
                  editCommentContent={editCommentContent}
                  isSavingEdit={isSavingEdit}
                  replyingToId={replyingToId}
                  replyContent={replyContent}
                  isSubmittingReply={isSubmittingReply}
                  replyInputRef={replyInputRef}
                  editInputRef={editInputRef}
                  onUpvote={handleUpvoteComment}
                  onReact={handleReact}
                  onDelete={(id) => setDeleteCommentId(id)}
                  onStartEdit={startEditingComment}
                  onCancelEdit={() => setEditingCommentId(null)}
                  onSaveEdit={handleEditComment}
                  onEditContentChange={setEditCommentContent}
                  onStartReply={(id) => { setReplyingToId(id); setReplyContent(''); }}
                  onCancelReply={() => setReplyingToId(null)}
                  onSubmitReply={handleSubmitReply}
                  onReplyContentChange={setReplyContent}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Edit Discussion Dialog */}
      <Dialog open={showEditDiscussion} onOpenChange={setShowEditDiscussion}>
        <DialogContent dir="rtl" className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل النقاش</DialogTitle>
            <DialogDescription>
              ⚠️ سيُحفَظ التعديل في السجل العام للشفافية
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">العنوان</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full p-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                maxLength={200}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">المحتوى</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full min-h-32 p-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y text-sm"
                maxLength={10000}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">سبب التعديل (اختياري)</label>
              <input
                type="text"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="مثلاً: إصلاح خطأ إملائي"
                className="w-full p-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                maxLength={200}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowEditDiscussion(false)} disabled={isSavingDiscussion}>
                إلغاء
              </Button>
              <Button onClick={handleSaveDiscussion} disabled={isSavingDiscussion}>
                {isSavingDiscussion ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ التعديل'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent dir="rtl" className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" />
              سجل تعديلات النقاش
            </DialogTitle>
            <DialogDescription>
              جميع التعديلات السابقة محفوظة للشفافية
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {historyData.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">لا توجد تعديلات</p>
            ) : (
              historyData.map((entry, idx) => (
                <div key={idx} className="bg-secondary/30 border border-border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">{entry.editedBy?.name}</span>
                    <span className="text-muted-foreground font-mono">
                      {new Date(entry.editedAt).toLocaleString('ar-EG')}
                    </span>
                  </div>
                  {entry.reason && (
                    <p className="text-xs text-amber-400/80 italic">السبب: {entry.reason}</p>
                  )}
                  {entry.previousTitle && (
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1">العنوان السابق:</p>
                      <p className="text-sm bg-background/50 p-2 rounded">{entry.previousTitle}</p>
                    </div>
                  )}
                  {entry.previousContent && (
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1">المحتوى السابق:</p>
                      <p className="text-xs bg-background/50 p-2 rounded whitespace-pre-wrap">{entry.previousContent}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reputation Info Dialog */}
      <Dialog open={showReputationInfo} onOpenChange={setShowReputationInfo}>
        <DialogContent dir="rtl" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              نظام نقاط السمعة
            </DialogTitle>
            <DialogDescription>
              السمعة تُكافئ الإسهام الفكري الجيّد
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2 text-sm">
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 space-y-1">
              <div className="font-semibold text-emerald-400 mb-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                نقاط إيجابية
              </div>
              <div className="flex justify-between"><span>نشر نقاش</span><span className="font-mono text-emerald-400">+10</span></div>
              <div className="flex justify-between"><span>نشر تعليق</span><span className="font-mono text-emerald-400">+2</span></div>
              <div className="flex justify-between"><span>تلقّي upvote على تعليقك</span><span className="font-mono text-emerald-400">+5</span></div>
              <div className="flex justify-between"><span>تلقّي "منطقي"</span><span className="font-mono text-emerald-400">+3</span></div>
              <div className="flex justify-between"><span>تلقّي "مُلهم"</span><span className="font-mono text-emerald-400">+2</span></div>
            </div>
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 space-y-1">
              <div className="font-semibold text-red-400 mb-2">نقاط سلبية</div>
              <div className="flex justify-between"><span>تلقّي "غير منطقي"</span><span className="font-mono text-red-400">-2</span></div>
              <div className="flex justify-between"><span>تلقّي "غامض"</span><span className="font-mono text-red-400">-1</span></div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              السمعة تعكس جودة مساهمتك. كلما ارتفعت، زادت ثقة المجتمع بك.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Comment Confirm */}
      <AlertDialog open={!!deleteCommentId} onOpenChange={(open) => !open && setDeleteCommentId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف التعليق؟</AlertDialogTitle>
            <AlertDialogDescription>
              لا يمكن التراجع. ستُحذف ردود التعليق أيضاً.
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

      {/* Delete Discussion Confirm */}
      <AlertDialog open={showDeleteDiscussion} onOpenChange={setShowDeleteDiscussion}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف النقاش بالكامل؟</AlertDialogTitle>
            <AlertDialogDescription>
              ⚠️ هذا الإجراء نهائي. سيُحذف النقاش وجميع التعليقات والردود.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteDiscussion}
              disabled={isDeletingDiscussion}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeletingDiscussion ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حذف نهائياً'}
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
// DiscussionMenu - 3 dots menu for discussion
// ===========================================
function DiscussionMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    const close = () => setOpen(false);
    if (open) {
      window.addEventListener('click', close);
      return () => window.removeEventListener('click', close);
    }
  }, [open]);

  return (
    <div className="relative shrink-0">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div 
          className="absolute left-0 top-full mt-1 z-20 bg-card border border-border rounded-lg shadow-xl overflow-hidden min-w-32"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={() => { onEdit(); setOpen(false); }}
            className="w-full text-right px-3 py-2 text-xs hover:bg-secondary flex items-center gap-2"
          >
            <Edit3 className="w-3.5 h-3.5" />
            تعديل النقاش
          </button>
          <button 
            onClick={() => { onDelete(); setOpen(false); }}
            className="w-full text-right px-3 py-2 text-xs hover:bg-red-500/10 text-red-400 flex items-center gap-2 border-t border-border"
          >
            <Trash2 className="w-3.5 h-3.5" />
            حذف النقاش
          </button>
        </div>
      )}
    </div>
  );
}

// ===========================================
// CommentThread - comment + its replies
// ===========================================
interface CommentThreadProps {
  comment: Comment;
  replies: Comment[];
  isNew: boolean;
  currentUserId: string;
  isExpired: boolean;
  isAuthenticated: boolean;
  editingCommentId: string | null;
  editCommentContent: string;
  isSavingEdit: boolean;
  replyingToId: string | null;
  replyContent: string;
  isSubmittingReply: boolean;
  replyInputRef: React.RefObject<HTMLTextAreaElement>;
  editInputRef: React.RefObject<HTMLTextAreaElement>;
  onUpvote: (id: string) => void;
  onReact: (id: string, type: ReactionType) => void;
  onDelete: (id: string) => void;
  onStartEdit: (comment: Comment) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string) => void;
  onEditContentChange: (content: string) => void;
  onStartReply: (id: string) => void;
  onCancelReply: () => void;
  onSubmitReply: (parentId: string) => void;
  onReplyContentChange: (content: string) => void;
}

function CommentThread(props: CommentThreadProps) {
  const { comment, replies, replyingToId, replyContent, isSubmittingReply, replyInputRef } = props;
  const isReplyingHere = replyingToId === comment._id;

  return (
    <div className="space-y-2">
      <CommentCard {...props} comment={comment} isReply={false} />
      
      {isReplyingHere && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mr-8 bg-card border border-border rounded-xl p-3 space-y-2"
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CornerDownLeft className="w-3 h-3" />
            رد على {comment.author.name}
          </div>
          <textarea
            ref={replyInputRef}
            value={replyContent}
            onChange={(e) => props.onReplyContentChange(e.target.value)}
            placeholder="اكتب ردّك..."
            className="w-full min-h-16 p-2 rounded-md bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y text-sm"
            maxLength={5000}
            disabled={isSubmittingReply}
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={props.onCancelReply} disabled={isSubmittingReply}>
              إلغاء
            </Button>
            <Button 
              size="sm" 
              onClick={() => props.onSubmitReply(comment._id)}
              disabled={isSubmittingReply || !replyContent.trim()}
            >
              {isSubmittingReply ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'نشر الردّ'}
            </Button>
          </div>
        </motion.div>
      )}
      
      {replies.length > 0 && (
        <div className="mr-8 space-y-2 border-r-2 border-border/30 pr-3">
          {replies.map(reply => (
            <CommentCard 
              key={reply._id}
              {...props}
              comment={reply}
              isReply={true}
              isNew={props.isNew && reply._id === comment._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ===========================================
// CommentCard - the actual card
// ===========================================
interface CommentCardProps extends CommentThreadProps {
  isReply: boolean;
}

function CommentCard(props: CommentCardProps) {
  const { 
    comment, isNew, currentUserId, isExpired, isAuthenticated, isReply,
    editingCommentId, editCommentContent, isSavingEdit, editInputRef,
    onUpvote, onReact, onDelete, onStartEdit, onCancelEdit, onSaveEdit, 
    onEditContentChange, onStartReply
  } = props;
  
  const stanceCfg = STANCE_CONFIG[comment.stance];
  const isFounder = comment.author.isFoundingMember;
  const userUpvoted = comment.upvotes?.includes(currentUserId);
  const isOwner = comment.author._id === currentUserId;
  const isEdited = !!comment.editedAt;
  const isEditingThis = editingCommentId === comment._id;
  const isCommentNew = props.isNew && comment._id === props.comment._id;
  
  const userActiveReactions = (['logical', 'illogical', 'inspiring', 'unclear'] as ReactionType[])
    .filter(t => (comment.reactions?.[t] || []).includes(currentUserId));
  const hasMaxReactions = userActiveReactions.length >= 2;

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<ReactionType | null>(null);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    if (menuOpen) {
      window.addEventListener('click', close);
      return () => window.removeEventListener('click', close);
    }
  }, [menuOpen]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, scale: isCommentNew ? [1, 1.02, 1] : 1 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className={`group relative bg-card border border-border rounded-xl p-4 hover:bg-secondary/20 transition-all overflow-hidden ${
        isCommentNew ? 'ring-2 ring-amber-500/50 shadow-[0_0_20px_rgba(251,191,36,0.2)]' : ''
      } ${isReply ? 'bg-secondary/10' : ''}`}
    >
      <div 
        className="absolute top-0 right-0 w-1 h-full transition-all group-hover:w-1.5"
        style={{ backgroundColor: stanceCfg.color }}
      />

      <div className="relative pr-2">
        <div className="flex items-start gap-3 mb-3">
          <Link 
            to={`/user/${comment.author._id}`}
            className={`w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-500/5 grid place-items-center text-xs font-bold text-amber-400 shrink-0 hover:scale-105 transition-transform ${
              isFounder ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-card' : ''
            }`}
          >
            {comment.author.name.charAt(0)}
          </Link>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link 
                to={`/user/${comment.author._id}`}
                className="font-semibold text-sm hover:text-amber-400 transition-colors"
              >
                {comment.author.name}
              </Link>
              {isFounder && (
                <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[9px] px-1.5 py-0 gap-0.5">
                  <Sparkles className="w-2 h-2" />مؤسس
                </Badge>
              )}
              {!isReply && (
                <span 
                  className="text-[10px] px-1.5 py-0 rounded font-mono"
                  style={{ backgroundColor: `${stanceCfg.color}15`, color: stanceCfg.color }}
                >
                  {stanceCfg.symbol} {stanceCfg.label}
                </span>
              )}
              {isReply && (
                <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                  <CornerDownLeft className="w-2.5 h-2.5" />ردّ
                </span>
              )}
              {isEdited && (
                <span className="text-[10px] text-muted-foreground/60 italic">· مُعدَّل</span>
              )}
            </div>
            <div className="text-[11px] text-muted-foreground/70 font-mono mt-0.5">
              {formatRelativeTime(comment.createdAt)}
            </div>
          </div>
          
          {comment.qualityScore > 0 && !isReply && (
            <div className="flex flex-col items-center px-2.5 py-1 bg-secondary/40 border border-border rounded-lg shrink-0">
              <div className="font-mono font-bold text-base leading-none bg-gradient-to-br from-amber-300 to-amber-600 bg-clip-text text-transparent">
                {comment.qualityScore}
              </div>
              <div className="text-[8px] text-muted-foreground tracking-wider uppercase font-semibold mt-0.5">جودة</div>
            </div>
          )}
          
          {isOwner && !isEditingThis && (
            <div className="relative shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
              {menuOpen && (
                <div 
                  className="absolute left-0 top-full mt-1 z-20 bg-card border border-border rounded-lg shadow-xl overflow-hidden min-w-28"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button 
                    onClick={() => { onStartEdit(comment); setMenuOpen(false); }}
                    className="w-full text-right px-3 py-1.5 text-xs hover:bg-secondary flex items-center gap-2"
                  >
                    <Edit3 className="w-3 h-3" />تعديل
                  </button>
                  <button 
                    onClick={() => { onDelete(comment._id); setMenuOpen(false); }}
                    className="w-full text-right px-3 py-1.5 text-xs hover:bg-red-500/10 text-red-400 flex items-center gap-2 border-t border-border"
                  >
                    <Trash2 className="w-3 h-3" />حذف
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {isEditingThis ? (
          <div className="mb-3 space-y-2">
            <textarea
              ref={editInputRef}
              value={editCommentContent}
              onChange={(e) => onEditContentChange(e.target.value)}
              className="w-full min-h-20 p-2 rounded-md bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y text-sm"
              maxLength={5000}
              disabled={isSavingEdit}
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={onCancelEdit} disabled={isSavingEdit}>
                إلغاء
              </Button>
              <Button 
                size="sm" 
                onClick={() => onSaveEdit(comment._id)}
                disabled={isSavingEdit || !editCommentContent.trim() || editCommentContent === comment.content}
              >
                {isSavingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'حفظ'}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap mb-3">
            {comment.content}
          </p>
        )}
        
        {!isEditingThis && (
          <>
            {isReply ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onUpvote(comment._id)}
                  disabled={isExpired}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-all ${
                    userUpvoted
                      ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                      : 'bg-secondary/30 border-border hover:border-amber-500/50 hover:text-amber-400'
                  } ${isExpired ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <ChevronUp className={`w-3.5 h-3.5 ${userUpvoted ? 'animate-bounce' : ''}`} />
                  <span className="font-mono">{comment.upvotes?.length || 0}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['logical', 'illogical', 'inspiring', 'unclear'] as ReactionType[]).map(type => {
                  const cfg = REACTION_CONFIG[type];
                  const Icon = cfg.icon;
                  const count = (comment.reactions?.[type] || []).length;
                  const isActive = (comment.reactions?.[type] || []).includes(currentUserId);
                  const wouldExceedLimit = !isActive && hasMaxReactions;
                  
                  return (
                    <div key={type} className="relative">
                      <button
                        onClick={() => {
                          if (wouldExceedLimit) {
                            setActiveTooltip(type);
                            setTimeout(() => setActiveTooltip(null), 2000);
                          } else {
                            setActiveTooltip(activeTooltip === type ? null : type);
                            onReact(comment._id, type);
                            setTimeout(() => setActiveTooltip(null), 1500);
                          }
                        }}
                        disabled={isExpired}
                        className={`group/btn inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] transition-all ${
                          isActive 
                            ? cfg.activeBgClass
                            : wouldExceedLimit
                            ? 'bg-secondary/20 border-border text-muted-foreground/40'
                            : `bg-secondary/30 border-border text-muted-foreground ${cfg.bgClass}`
                        } ${isExpired ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <Icon className="w-3 h-3" />
                        <span className="hidden sm:inline">{cfg.label}</span>
                        {count > 0 && <span className="font-mono font-semibold text-[10px]">{count}</span>}
                      </button>
                      
                      {activeTooltip === type && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute bottom-full mb-2 right-0 z-30 bg-card border border-border rounded-lg px-2 py-1.5 text-[10px] whitespace-nowrap shadow-xl"
                          style={{ borderColor: cfg.color }}
                        >
                          {wouldExceedLimit ? '⚠️ حد أقصى 2 تفاعلات' : cfg.description}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
                
                <button
                  onClick={() => onUpvote(comment._id)}
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
                
                {isAuthenticated && !isExpired && (
                  <button
                    onClick={() => onStartReply(comment._id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] text-muted-foreground hover:text-amber-400 hover:bg-secondary transition-colors"
                  >
                    <Reply className="w-3 h-3" />
                    <span className="hidden sm:inline">ردّ</span>
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
