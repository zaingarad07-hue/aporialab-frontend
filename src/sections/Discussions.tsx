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
              className="gap-2 bg-gradient-to-r from-amber-400 to-amber-600 text-background hover:op​​​​​​​​​​​​​​​​
