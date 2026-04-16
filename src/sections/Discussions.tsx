import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import { 
  MessageCircle, 
  TrendingUp, 
  Clock, 
  Star, 
  Filter, 
  Search,
  Heart,
  Share2,
  MoreHorizontal,
  Loader2
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
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('trending');
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Fetch discussions from API
  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.getDiscussions({ 
          sort: activeFilter,
          page: 1 
        });
        
        if (response.success && response.data) {
          setDiscussions(response.data.discussions || []);
        } else {
          setDiscussions([]);
        }
      } catch (err) {
        console.error('Error fetching discussions:', err);
        setError(t('discussions.errors.loadFailed'));
        // Use mock data as fallback
        setDiscussions(getMockDiscussions());
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscussions();
  }, [activeFilter, t]);

  // Mock data fallback
  const getMockDiscussions = (): Discussion[] => [
    {
      _id: '1',
      title: 'هل الحرية مطلقة أم مقيدة بالمسؤولية؟',
      content: 'نقاش عميق حول طبيعة الحرية وحدودها في المجتمعات المعاصرة',
      category: 'deep',
      tags: [t('discussions.tags.freedom'), t('discussions.tags.philosophy'), t('discussions.tags.politics')],
      author: {
        _id: '1',
        name: 'أحمد الفيلسوف',
        reputation: 2847,
      },
      views: 1892,
      upvotes: [],
      commentCount: 234,
      createdAt: new Date().toISOString(),
    },
    {
      _id: '2',
      title: 'الذكاء الاصطناعي والوعي: أين يكون الخط الفاصل؟',
      content: 'هل يمكن للآلة أن تكون واعية؟ وما هي معايير الوعي أساساً؟',
      category: 'philosophical',
      tags: [t('discussions.tags.ai'), t('discussions.tags.consciousness'), t('discussions.tags.technology')],
      author: {
        _id: '2',
        name: 'سارة التقنية',
        reputation: 1523,
      },
      views: 1243,
      upvotes: [],
      commentCount: 189,
      createdAt: new Date().toISOString(),
    },
    {
      _id: '3',
      title: 'العدالة الاجتماعية: المساواة في الفرص vs المساواة في النتائج',
      content: 'نقاش حول مفهوم العدالة وتطبيقاته العملية',
      category: 'analytical',
      tags: [t('discussions.tags.justice'), t('discussions.tags.society'), t('discussions.tags.ethics')],
      author: {
        _id: '3',
        name: 'محمد العدل',
        reputation: 987,
      },
      views: 876,
      upvotes: [],
      commentCount: 156,
      createdAt: new Date().toISOString(),
    },
  ];

  const filters = [
    { key: 'trending', icon: filterIcons.trending, label: t('discussions.filters.trending') },
    { key: 'featured', icon: filterIcons.featured, label: t('discussions.filters.featured') },
    { key: 'live', icon: filterIcons.live, label: t('discussions.filters.live') },
    { key: 'timed', icon: filterIcons.timed, label: t('discussions.filters.timed') },
  ];

  const getLevelColor = (category: string) => {
    const colors: Record<string, string> = {
      deep: 'bg-purple-500/20 text-purple-400',
      philosophical: 'bg-amber-500/20 text-amber-400',
      analytical: 'bg-blue-500/20 text-blue-400',
      science: 'bg-green-500/20 text-green-400',
      politics: 'bg-red-500/20 text-red-400',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400';
  };

  const getLevelText = (category: string) => {
    const texts: Record<string, string> = {
      deep: t('discussions.levels.deep'),
      philosophical: t('discussions.levels.philosophical'),
      analytical: t('discussions.levels.analytical'),
    };
    return texts[category] || category;
  };

  const handleLike = async (discussionId: string) => {
    try {
      await api.likeDiscussion(discussionId);
      // Could add visual feedback here
    } catch (err) {
      console.error('Error liking discussion:', err);
    }
  };

  return (
    <section id="discussions" ref={sectionRef} className="relative py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">
              {t('discussions.title').split(' ')[0]}{' '}
              <span className="gradient-text">{t('discussions.title').split(' ')[1]}</span>
            </h2>
            <p className="text-muted-foreground">
              {t('discussions.subtitle')}
            </p>
          </div>
          <Button variant="outline" className="self-start">
            {t('discussions.viewMore')}
            <MessageCircle className="w-4 h-4 mr-2" />
          </Button>
        </div>

        {/* Filters */}
        <div className={`flex flex-wrap items-center gap-3 mb-8 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            {t('discussions.filters.filter')}
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Search className="w-4 h-4" />
            {t('discussions.filters.search')}
          </Button>
          <div className="w-px h-6 bg-border mx-2 hidden sm:block" />
          {filters.map((filter) => (
            <Button
              key={filter.key}
              variant={activeFilter === filter.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter(filter.key)}
              className={activeFilter === filter.key ? 'bg-primary text-primary-foreground' : ''}
              disabled={isLoading}
            >
              <filter.icon className="w-4 h-4 mr-2" />
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="mr-3 text-muted-foreground">{t('discussions.loading')}</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12 bg-secondary/30 rounded-2xl border border-border/50">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              {t('discussions.retry')}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && discussions.length === 0 && (
          <div className="text-center py-12 bg-secondary/30 rounded-2xl border border-border/50">
            <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('discussions.empty')}</p>
          </div>
        )}

        {/* Discussions Grid */}
        {!isLoading && discussions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {discussions.map((discussion, index) => (
              <div
                key={discussion._id}
                className={`group relative flex flex-col rounded-2xl bg-card border border-border/50 overflow-hidden card-hover transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${(index + 2) * 100}ms` }}
              >
                {/* Header */}
                <div className="p-5 pb-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={getLevelColor(discussion.category)}>
                        {getLevelText(discussion.category)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {t('discussions.status.live')}
                      </Badge>
                    </div>
                    <button className="p-1 rounded-lg hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {discussion.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {discussion.content}
                  </p>

                  {/* Tags */}
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

                {/* Author */}
                <div className="px-5 py-3 border-t border-border/50 bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                      {discussion.author.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{discussion.author.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(discussion.author.reputation || 0).toLocaleString()} {t('discussions.card.reputation')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
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
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleLike(discussion._id)}
                      className="p-2 rounded-lg hover:bg-secondary transition-colors"
                    >
                      <Heart className="w-4 h-4 text-muted-foreground hover:text-red-500 transition-colors" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                      <Share2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
