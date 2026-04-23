import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
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
} from 'lucide-react';

const filterIcons = {
  trending: TrendingUp,
  featured: Star,
  live: MessageCircle,
  timed: Clock,
};

interface Discussion {
  _id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: {
    _id: string;
    name: string;
    avatar?: string;
    reputation?: number;
  };
  views: number;
  upvotes: string[];
  commentCount: number;
  createdAt: string;
}

export function Discussions() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('trending');
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

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
          const list = (data as { discussions?: Discussion[] }).discussions || [];
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
    if (category === 'advanced') return 'bg-red-500/20 text-red-400';
    if (category === 'intermediate') return 'bg-amber-500/20 text-amber-400';
    return 'bg-emerald-500/20 text-emerald-400';
  };

  const getLevelText = (category: string) => {
    if (category === 'advanced') return 'متقدم';
    if (category === 'intermediate') return 'متوسط';
    return 'مبتدئ';
  };

  const filters = ['trending', 'featured', 'live', 'timed'];

  return (
    <section id="discussions" ref={sectionRef} className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('discussions.title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('discussions.subtitle')}
          </p>
        </div>

        <div className={`flex flex-wrap justify-between items-center gap-4 mb-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const Icon = filterIcons[filter as keyof typeof filterIcons];
              return (
                <Button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  variant={activeFilter === filter ? 'default' : 'outline'}
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {t(`discussions.filters.${filter}`)}
                </Button>
              );
            })}
          </div>

          {isAuthenticated && (
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="gap-2 bg-gradient-to-r from-amber-400 to-amber-600 text-background hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              ابدأ نقاشاً جديداً
            </Button>
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        )}

        {error && !isLoading && (
          <div className="text-center py-12 text-destructive">
            {error}
          </div>
        )}

        {!isLoading && !error && discussions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            لا توجد نقاشات حتى الآن
          </div>
        )}

        {!isLoading && discussions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {discussions.map((discussion, index) => (
              <Link
                key={discussion._id}
                to={`/discussion/${discussion._id}`}
                className={`group relative flex flex-col rounded-2xl bg-card border border-border/50 overflow-hidden card-hover transition-all duration-700 hover:border-primary/30 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${(index + 2) * 100}ms` }}
              >
                <div className="p-5 pb-0">
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <Badge variant="secondary" className={getLevelColor(discussion.category)}>
                      {getLevelText(discussion.category)}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {discussion.title}
                  </h3>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {discussion.content}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {discussion.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  className="px-5 py-3 border-t border-border/50 bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={(e) => handleAuthorClick(discussion.author._id, e)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold overflow-hidden">
                      {discussion.author.avatar ? (
                        <img src={discussion.author.avatar} alt={discussion.author.name} className="w-full h-full object-cover" />
                      ) : (
                        discussion.author.name.charAt(0)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate hover:text-primary transition-colors">
                        {discussion.author.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(discussion.author.reputation || 0).toLocaleString()} نقطة
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 border-t border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {discussion.commentCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {discussion.views}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleLike(discussion._id, e)}
                    className="flex items-center gap-1 p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-red-500"
                  >
                    <Heart className="w-4 h-4" />
                    <span className="text-xs">{discussion.upvotes.length}</span>
                  </button>
                </div>
              </Link>
            ))}
          </div>
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
