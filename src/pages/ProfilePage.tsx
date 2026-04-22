import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';

interface ProfileUser {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  reputation?: number;
  role?: string;
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

  const isOwnProfile = currentUser?.id === id;

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
          setProfile({
            id: u.id || u._id || '',
            name: u.name,
            avatar: u.avatar,
            bio: u.bio,
            reputation: u.reputation,
            role: u.role,
            discussionCount: u.discussionCount,
            createdAt: u.createdAt,
          });
          setDiscussions(response.discussions || []);
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
  }, [id]);

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

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowRight className="w-4 h-4" />
          <span>العودة للرئيسية</span>
        </Link>

        {/* Profile Header */}
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden mb-8">
          {/* Cover gradient */}
          <div className="h-32 bg-gradient-to-r from-primary/20 via-amber-500/20 to-primary/20" />
          
          {/* Profile content */}
          <div className="px-6 pb-6">
            <div className="flex items-end -mt-12 mb-4">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-card border-4 border-card flex items-center justify-center text-3xl font-bold text-primary shadow-lg overflow-hidden">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  profile.name.charAt(0)
                )}
              </div>
            </div>

            {/* Name and badges */}
            <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{profile.name}</h1>
                {roleBadge && (
                  <Badge variant="secondary" className={roleBadge.color}>
                    {roleBadge.text}
                  </Badge>
                )}
              </div>

              {isOwnProfile && (
                <Button variant="outline" className="gap-2" disabled>
                  <Edit className="w-4 h-4" />
                  تعديل الملف
                </Button>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-foreground/80 mb-4 leading-relaxed">{profile.bio}</p>
            )}

            {/* Stats */}
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

        {/* Discussions List */}
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
