import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Medal, MessageCircle, TrendingUp } from 'lucide-react';

export function Leaders() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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

  const leaders = [
    {
      rank: 1,
      name: 'د. أحمد الفيلسوف',
      title: t('leaders.roles.philosopher'),
      avatar: 'د',
      reputation: 15420,
      discussions: 145,
      color: 'from-amber-400 to-amber-600',
      badge: '👑',
    },
    {
      rank: 2,
      name: 'سارة الباحثة',
      title: t('leaders.roles.analyst'),
      avatar: 'س',
      reputation: 12350,
      discussions: 98,
      color: 'from-slate-300 to-slate-400',
      badge: '🥈',
    },
    {
      rank: 3,
      name: 'محمد المفكر',
      title: t('leaders.roles.critic'),
      avatar: 'م',
      reputation: 11200,
      discussions: 87,
      color: 'from-amber-700 to-amber-800',
      badge: '🥉',
    },
    {
      rank: 4,
      name: 'ليلى الدكتورة',
      title: t('leaders.roles.researcher'),
      avatar: 'ل',
      reputation: 9870,
      discussions: 76,
      color: 'from-primary/20 to-primary/10',
    },
    {
      rank: 5,
      name: 'عمر الحكيم',
      title: t('leaders.roles.thinker'),
      avatar: 'ع',
      reputation: 8650,
      discussions: 65,
      color: 'from-primary/20 to-primary/10',
    },
  ];

  return (
    <section ref={sectionRef} className="relative py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t('leaders.title').split(' ')[0]}{' '}
            <span className="gradient-text">{t('leaders.title').split(' ')[1]}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('leaders.subtitle')}
          </p>
        </div>

        {/* Leaders List */}
        <div className="max-w-3xl mx-auto">
          {leaders.map((leader) => (
            <div
              key={leader.rank}
              className={`group flex items-center gap-4 p-4 mb-3 rounded-xl bg-card/50 border border-border/50 hover:bg-card transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              }`}
              style={{ transitionDelay: `${(leader.rank - 1) * 100}ms` }}
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                {leader.rank <= 3 ? (
                  <span className="text-2xl">{leader.badge}</span>
                ) : (
                  <span className="text-lg font-bold text-muted-foreground">{leader.rank}</span>
                )}
              </div>

              {/* Avatar */}
              <div 
                className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${leader.color} flex items-center justify-center text-lg font-bold`}
                style={leader.rank <= 3 ? { color: '#000' } : {}}
              >
                {leader.avatar}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate group-hover:text-primary transition-colors">
                  {leader.name}
                </h3>
                <p className="text-sm text-muted-foreground">{leader.title}</p>
              </div>

              {/* Stats */}
              <div className="hidden sm:flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Medal className="w-4 h-4 text-primary" />
                  <span className="font-medium">{leader.reputation.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageCircle className="w-4 h-4" />
                  <span>{leader.discussions}</span>
                  <span>{t('leaders.discussions')}</span>
                </div>
              </div>

              {/* Mobile Stats */}
              <div className="sm:hidden flex flex-col items-end text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{leader.reputation.toLocaleString()}</span>
                <span>{leader.discussions} {t('leaders.discussions')}</span>
              </div>

              {/* Trend */}
              <div className="hidden md:flex items-center gap-1 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
