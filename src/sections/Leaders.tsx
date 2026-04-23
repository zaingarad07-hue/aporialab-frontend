import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Medal, MessageCircle, Loader2 } from 'lucide-react';
import { api } from '@/services/api';

interface LeaderUser {
  id: string;
  _id: string;
  name: string;
  avatar?: string;
  reputation: number;
  role?: string;
}

export function Leaders() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [leaders, setLeaders] = useState<LeaderUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    const fetchLeaders = async () => {
      try {
        setIsLoading(true);
        const response = await api.getLeaderboard();
        if (response.success) {
          const data = response.data || response;
          const users = (data as { users?: LeaderUser[] }).users || [];
          setLeaders(users);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaders();
  }, []);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { emoji: '👑', color: 'from-amber-400 to-amber-600' };
    if (rank === 2) return { emoji: '🥈', color: 'from-slate-300 to-slate-400' };
    if (rank === 3) return { emoji: '🥉', color: 'from-amber-700 to-amber-800' };
    return { emoji: null, color: 'from-primary/20 to-primary/10' };
  };

  const getRoleText = (role?: string) => {
    if (role === 'admin') return 'مشرف عام';
    if (role === 'moderator') return 'مشرف';
    return 'عضو';
  };

  return (
    <section ref={sectionRef} className="relative py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t('leaders.title').split(' ')[0]}{' '}
            <span className="gradient-text">{t('leaders.title').split(' ')[1]}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('leaders.subtitle')}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : leaders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            لا يوجد مستخدمون بعد
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {leaders.map((leader, index) => {
              const rank = index + 1;
              const badge = getRankBadge(rank);
              const userId = leader.id || leader._id;
              const firstChar = leader.name ? leader.name.charAt(0) : '؟';
              
              return (
                <Link
                  key={userId}
                  to={`/profile/${userId}`}
                  className={`group flex items-center gap-4 p-4 mb-3 rounded-xl bg-card/50 border border-border/50 hover:bg-card hover:border-primary/30 transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                    {badge.emoji ? (
                      <span className="text-2xl">{badge.emoji}</span>
                    ) : (
                      <span className="text-lg font-bold text-muted-foreground">{rank}</span>
                    )}
                  </div>

                  <div 
                    className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-lg font-bold overflow-hidden`}
                    style={rank <= 3 ? { color: '#000' } : {}}
                  >
                    {leader.avatar ? (
                      <img src={leader.avatar} alt={leader.name} className="w-full h-full object-cover" />
                    ) : (
                      firstChar
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate group-hover:text-primary transition-colors">
                      {leader.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{getRoleText(leader.role)}</p>
                  </div>

                  <div className="hidden sm:flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Medal className="w-4 h-4 text-primary" />
                      <span className="font-medium">{(leader.reputation || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MessageCircle className="w-4 h-4" />
                      <span>{t('leaders.discussions')}</span>
                    </div>
                  </div>

                  <div className="sm:hidden flex flex-col items-end text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{(leader.reputation || 0).toLocaleString()}</span>
                    <span>نقطة</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
