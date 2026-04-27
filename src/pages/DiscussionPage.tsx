import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/services/api';
import type { DiscussionDetail, Comment } from '@/services/api';
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
  Heart,
  MessageCircle,
  Eye,
  Send,
  Loader2,
  Sparkles,
  Trash2,
} from 'lucide-react';

export function DiscussionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [discussion, setDiscussion] = useState<DiscussionDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  
  const [newCommentId, setNewCommentId] = useState<string | null>(null);
  const [likeAnimating, setLikeAnimating] = useState(false);

  // Delete comment state
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [isDeletingComment, setIsDeletingComment] = useState(false);

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
    if (newCommentId) {
      const timer = setTimeout(() => {
        setNewCommentId(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [newCommentId]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.info('يجب تسجيل الدخول أولاً', {
        description: 'سجّل دخولك للتفاعل مع النقاشات',
      });
      return;
    }
    if (!discussion || isLiking) return;
    
    setIsLiking(true);
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 600);
    
    try {
      const response = await api.likeDiscussion(discussion._id);
      if (response.success) {
        const currentUserId = user?.id || '';
        const newUpvotes = response.liked
          ? [...discussion.upvotes, currentUserId]
          : discussion.upvotes.filter((u) => u !== currentUserId);
        setDiscussion({ ...discussion, upvotes: newUpvotes });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل تسجيل الإعجاب';
      toast.error(msg);
    } finally {
      setIsLiking(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !discussion) return;
    
    if (!newComment.trim()) {
      toast.warning('اكتب تعليقك أولاً');
      return;
    }
    
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await api.addComment(discussion._id, newComment.trim(), 'neutral');
      if (response.success && response.comment) {
        const addedComment = response.comment;
        setComments([addedComment, ...comments]);
        setNewCommentId(addedComment._id);
        setNewComment('');
        setDiscussion({ ...discussion, commentCount: discussion.commentCount + 1 });
        toast.success('تم نشر تعليقك', {
          description: 'شكراً على مشاركتك في النقاش',
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل إرسال التعليق';
      toast.error('فشل نشر التعليق', {
        description: msg,
      });
    } finally {
      setIsSubmitting(false);
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

  const isLikedByUser = user?.id ? discussion.upvotes.includes(user.id) : false;
  const isAuthorFounder = discussion.author.isFoundingMember;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowRight className="w-4 h-4" />
          <span>العودة للنقاشات</span>
        </Link>

        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Badge variant="secondary" className={getLevelColor(discussion.category)}>
                {getLevelText(discussion.category)}
              </Badge>
              {discussion.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">#{tag}</Badge>
              ))}
            </div>

            <h1 className="text-3xl font-bold mb-4 leading-tight">{discussion.title}</h1>

            <Link
              to={`/profile/${discussion.author._id}`}
              className="flex items-center gap-3 mb-6 pb-6 border-b border-border/50 hover:bg-secondary/30 -mx-2 px-2 py-2 rounded-lg transition-colors"
            >
              <div className={`w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden ${
                isAuthorFounder ? 'ring-2 ring-amber-500/50' : ''
              }`}>
                {discussion.author.avatar ? (
                  <img src={discussion.author.avatar} alt={discussion.author.name} className="w-full h-full object-cover" />
                ) : (
                  discussion.author.name.charAt(0)
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium hover:text-primary transition-colors">{discussion.author.name}</p>
                  {isAuthorFounder && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-amber-500/15 text-amber-500 border border-amber-500/30 rounded-full">
                      <Sparkles className="w-2.5 h-2.5" />
                      مؤسس
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(discussion.createdAt)} · {(discussion.author.reputation || 0).toLocaleString()} نقطة
                </p>
              </div>
            </Link>

            <div className="prose prose-invert max-w-none mb-6">
              <p className="text-foreground/90 text-lg leading-relaxed whitespace-pre-wrap">
                {discussion.content}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {discussion.views.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {discussion.commentCount}
                </span>
              </div>
              
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`group relative inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
                  isLikedByUser
                    ? 'bg-gradient-to-br from-amber-400/20 to-amber-600/20 border-amber-500/50 text-amber-500'
                    : 'border-border hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Heart 
                  className={`w-5 h-5 transition-all duration-300 ${
                    isLikedByUser 
                      ? 'fill-amber-500 text-amber-500' 
                      : 'group-hover:text-amber-500'
                  } ${
                    likeAnimating ? 'animate-[likeHeart_0.6s_ease-in-out]' : ''
                  }`}
                  style={{
                    filter: isLikedByUser ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))' : 'none'
                  }}
                />
                <span className={`font-medium transition-colors ${
                  isLikedByUser ? 'text-amber-500' : ''
                }`}>
                  {discussion.upvotes.length}
                </span>
                
                {likeAnimating && isLikedByUser && (
                  <>
                    <span className="absolute inset-0 rounded-lg bg-amber-400/20 animate-ping" />
                    <span className="absolute -top-1 -right-1 text-amber-400 text-xs animate-[floatUp_0.8s_ease-out_forwards]">
                      +1
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">
            التعليقات ({comments.length})
          </h2>

          {isAuthenticated ? (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="شاركنا برأيك..."
                className="w-full min-h-24 p-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
                disabled={isSubmitting}
                maxLength={5000}
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-muted-foreground">
                  {newComment.length}/5000
                </span>
                <Button type="submit" disabled={isSubmitting || !newComment.trim()} className="gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جارٍ الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      نشر التعليق
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-secondary/50 rounded-lg text-center text-sm text-muted-foreground">
              يجب تسجيل الدخول لإضافة تعليق
            </div>
          )}

          {comments.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد تعليقات بعد. كن أول من يعلّق!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => {
                const isNew = comment._id === newCommentId;
                const isCommentAuthor = user?.id === comment.author._id;
                const isCommenterFounder = comment.author.isFoundingMember;
                
                return (
                  <div 
                    key={comment._id} 
                    className={`group flex gap-3 p-4 rounded-lg transition-all duration-1000 ${
                      isNew 
                        ? 'bg-gradient-to-br from-amber-500/20 to-amber-400/10 border border-amber-500/30 shadow-[0_0_20px_rgba(251,191,36,0.15)]' 
                        : 'bg-secondary/30'
                    }`}
                  >
                    <Link
                      to={`/profile/${comment.author._id}`}
                      className={`w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0 overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all ${
                        isCommenterFounder ? 'ring-2 ring-amber-500/50' : ''
                      }`}
                    >
                      {comment.author.avatar ? (
                        <img src={comment.author.avatar} alt={comment.author.name} className="w-full h-full object-cover" />
                      ) : (
                        comment.author.name.charAt(0)
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Link
                          to={`/profile/${comment.author._id}`}
                          className="font-medium text-sm hover:text-primary transition-colors"
                        >
                          {comment.author.name}
                        </Link>
                        {isCommenterFounder && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-medium bg-amber-500/15 text-amber-500 border border-amber-500/30 rounded-full">
                            <Sparkles className="w-2 h-2" />
                            مؤسس
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          · {formatDate(comment.createdAt)}
                        </span>
                        {isNew && (
                          <Badge variant="secondary" className="bg-amber-500/20 text-amber-500 text-xs animate-pulse">
                            جديد ✨
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                    
                    {/* Delete button - only for comment author */}
                    {isCommentAuthor && (
                      <button
                        onClick={() => setDeleteCommentId(comment._id)}
                        className="flex-shrink-0 p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="حذف التعليق"
                        aria-label="حذف التعليق"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteCommentId} onOpenChange={(open) => !open && setDeleteCommentId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">حذف التعليق</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من حذف هذا التعليق؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 sm:justify-start">
            <AlertDialogAction
              onClick={handleDeleteComment}
              disabled={isDeletingComment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
            >
              {isDeletingComment ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جارٍ الحذف...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  حذف
                </>
              )}
            </AlertDialogAction>
            <AlertDialogCancel disabled={isDeletingComment}>إلغاء</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style>{`
        @keyframes likeHeart {
          0% { transform: scale(1); }
          25% { transform: scale(1.4) rotate(-10deg); }
          50% { transform: scale(1.2) rotate(5deg); }
          75% { transform: scale(1.3) rotate(-5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        
        @keyframes floatUp {
          0% { 
            opacity: 0; 
            transform: translateY(0) scale(0.8); 
          }
          20% { 
            opacity: 1; 
            transform: translateY(-5px) scale(1.2); 
          }
          100% { 
            opacity: 0; 
            transform: translateY(-30px) scale(1); 
          }
        }
      `}</style>
    </div>
  );
}
