import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, DiscussionDetail, Comment } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowRight,
  Heart,
  MessageCircle,
  Eye,
  Send,
  Loader2,
  User as UserIcon,
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

  const handleLike = async () => {
    if (!isAuthenticated || !discussion || isLiking) return;
    setIsLiking(true);
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
      console.error('Like error:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !discussion || !newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await api.addComment(discussion._id, newComment.trim());
      if (response.success && response.comment) {
        setComments([response.comment, ...comments]);
        setNewComment('');
        setDiscussion({ ...discussion, commentCount: discussion.commentCount + 1 });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل إرسال التعليق';
      alert(msg);
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowRight className="w-4 h-4" />
          <span>العودة للنقاشات</span>
        </Link>

        {/* Discussion Card */}
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden mb-8">
          <div className="p-6">
            {/* Tags */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Badge variant="secondary" className={getLevelColor(discussion.category)}>
                {getLevelText(discussion.category)}
              </Badge>
              {discussion.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">#{tag}</Badge>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold mb-4 leading-tight">{discussion.title}</h1>

            {/* Author & Date */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border/50">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {discussion.author.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-medium">{discussion.author.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(discussion.createdAt)} · {(discussion.author.reputation || 0).toLocaleString()} نقطة
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-invert max-w-none mb-6">
              <p className="text-foreground/90 text-lg leading-relaxed whitespace-pre-wrap">
                {discussion.content}
              </p>
            </div>

            {/* Stats & Actions */}
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
              <Button
                onClick={handleLike}
                disabled={!isAuthenticated || isLiking}
                variant={isLikedByUser ? 'default' : 'outline'}
                className="gap-2"
              >
                <Heart className={`w-4 h-4 ${isLikedByUser ? 'fill-current' : ''}`} />
                <span>{discussion.upvotes.length}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-card border border-border/50 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">
            التعليقات ({comments.length})
          </h2>

          {/* Add comment form */}
          {isAuthenticated ? (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="شاركنا برأيك..."
                className="min-h-24 mb-3"
                disabled={isSubmitting}
                maxLength={5000}
              />
              <div className="flex justify-between items-center">
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

          {/* Comments List */}
          {comments.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد تعليقات بعد. كن أول من يعلّق!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment._id} className="flex gap-3 p-4 rounded-lg bg-secondary/30">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0">
                    {comment.author.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{comment.author.name}</p>
                      <span className="text-xs text-muted-foreground">
                        · {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
