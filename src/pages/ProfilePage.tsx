import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/services/api';
import type { DiscussionDetail } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Calendar,
  MessageCircle,
  Award,
  Loader2,
  Edit,
  Eye,
  Heart,
  Sparkles,
  MapPin,
  Globe,
  Share2,
  Check as CheckIcon,
} from 'lucide-react';

interface ProfileUser {
  id: string;
  username?: string | null;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  reputation?: number;
  role?: string;
  isFoundingMember?: boolean;
  discussionCount?: number;
  createdAt?: string;
}

export function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [discussions, setDiscussions] = useState<DiscussionDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile =
    !!profile &&
    !!currentUser &&
    (currentUser.id === profile.id ||
      (!!currentUser.username && currentUser.username === profile.username));

  const [shareJustCopied, setShareJustCopied] = useState(false);
  const handleShare = useCallback(async () => {
    if (!profile) return;
    const handle = profile.username || profile.id;
    const url = `${window.location.origin}/profile/${handle}`;
    const title = `${profile.name} على AporiaLab`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
    } catch {
      // fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareJustCopied(true);
      toast.success('تم نسخ الرابط');
      setTimeout(() => setShareJustCopied(false), 2000);
    } catch {
      toast.error('تعذّر النسخ');
    }
  }, [profile]);

  useEffect(() => {
    document.title = profile ? `${profile.name} - AporiaLab` : 'الملف الشخصي - AporiaLab';
  }, [profile]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.getUserById(id);
        if (response.success && response.user) {
          const u = response.user;
          const username = u.username || null;
          setProfile({
            id: u.id || u._id || '',
            username,
            name: u.name,
            avatar: u.avatar,
            bio: u.bio,
            location: u.location,
            website: u.website,
            reputation: u.reputation,
            role: u.role,
            isFoundingMember: u.isFoundingMember,
            discussionCount: u.discussionCount,
            createdAt: u.createdAt,
          });
          setDiscussions(response.discussions || []);
          if (username && id !== username && /^[0-9a-f]{24}$/i.test(id)) {
            navigate(`/profile/${username}`, { replace: true });
          }
        } else {
          setError('لم يتم العثور على المستخدم');
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'حدث خطأ';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [id, navigate]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' });
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

  const getRoleBadge = (role?: string) => {
    if (role === 'admin') return { text: 'مشرف عام', color: 'bg-red-500/20 text-red-400' };
    if (role === 'moderator') return { text: 'مشرف', color: 'bg-blue-500/20 text-blue-400' };
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">{error || 'المستخدم غير موجود'}</h1>
          <Button onClick={() => navigate('/')}>العودة للرئيسية</Button>
        </div>
      </div>
    );
  }

  const roleBadge = getRoleBadge(profile.role);
  const isFounder = profile.isFoundingMember;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowRight className="w-4 h-4" />
          <span>العودة للرئيسية</span>
        </Link>

        <div className={`bg-card border rounded-2xl overflow-hidden mb-8 ${
          isFounder ? 'border-amber-500/30 shadow-[0_0_30px_-10px_rgba(251,191,36,0.3)]' : 'border-border/50'
        }`}>
          {/* Cover gradient - special for founders */}
          <div className={`h-32 ${
            isFounder 
              ? 'bg-gradient-to-r from-amber-500/30 via-amber-400/40 to-amber-600/30 relative overflow-hidden' 
              : 'bg-gradient-to-r from-primary/20 via-amber-500/20 to-primary/20'
          }`}>
            {isFounder && (
              <div className="absolute inset-0 flex items-center justify-end px-6">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 backdrop-blur-sm border border-amber-500/40">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span className="text-sm font-bold text-amber-100">Founding Member</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="px-6 pb-6">
            <div className="flex items-end -mt-12 mb-4">
              <div className={`w-24 h-24 rounded-full bg-card border-4 flex items-center justify-center text-3xl font-bold text-primary shadow-lg overflow-hidden ${
                isFounder ? 'border-amber-500/50' : 'border-card'
              }`}>
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  profile.name.charAt(0)
                )}
              </div>
            </div>

            <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold">{profile.name}</h1>
                  {isFounder && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30 rounded-full">
                      <Sparkles className="w-3 h-3" />
                      مؤسس
                    </span>
                  )}
                </div>
                {profile.username && (
                  <p className="text-sm text-muted-foreground" dir="ltr">@{profile.username}</p>
                )}
                {roleBadge && (
                  <Badge variant="secondary" className={roleBadge.color}>
                    {roleBadge.text}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={handleShare}
                  aria-label="مشاركة الملف"
                >
                  {shareJustCopied ? (
                    <CheckIcon className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                  {shareJustCopied ? 'تم النسخ' : 'مشاركة'}
                </Button>
                {isOwnProfile && (
                  <Button asChild variant="outline" className="gap-2">
                    <Link to="/profile/edit">
                      <Edit className="w-4 h-4" />
                      تعديل الملف
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {profile.bio && (
              <p className="text-foreground/80 mb-4 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
            )}

            {(profile.location || profile.website) && (
              <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 text-sm">
                {profile.location && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[260px]" dir="ltr">{profile.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 text-sm">
                <Award className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-foreground">{(profile.reputation || 0).toLocaleString()}</span>
                <span className="text-muted-foreground">نقطة سمعة</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MessageCircle className="w-4 h-4 text-blue-500" />
                <span className="font-bold text-foreground">{profile.discussionCount || 0}</span>
                <span className="text-muted-foreground">نقاش</span>
              </div>
              {profile.createdAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>انضم في {formatDate(profile.createdAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">
            النقاشات ({discussions.length})
          </h2>

          {discussions.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لم يبدأ {profile.name} أي نقاش بعد</p>
            </div>
          ) : (
            <div className="space-y-4">
              {discussions.map((discussion) => (
                <Link
                  key={discussion._id}
                  to={`/discussion/${discussion._id}`}
                  className="block p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors border border-transparent hover:border-primary/30"
                >
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant="secondary" className={getLevelColor(discussion.category)}>
                      {getLevelText(discussion.category)}
                    </Badge>
                    {discussion.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">#{tag}</Badge>
                    ))}
                  </div>
                  <h3 className="font-bold mb-2 hover:text-primary transition-colors">
                    {discussion.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {discussion.content}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {discussion.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {discussion.upvotes.length}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {discussion.commentCount}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
