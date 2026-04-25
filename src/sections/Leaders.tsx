import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Medal, MessageCircle, Loader2, Sparkles } from 'lucide-react';
import { api } from '@/services/api';

interface LeaderUser {
  id: string;
  _id: string;
  name: string;
  avatar?: string;
  reputation: number;
  role?: string;
  isFoundingMember?: boolean;
}

export function Leaders() {
  const { t } = useTranslation();
  const [leaders, setLeaders] = useState<LeaderUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const getRoleText = (role?: string, isFoundingMember?: boolean) => {
    if (isFoundingMember) return 'مفكر مؤسس';
    if (role === 'admin') return 'مشرف عام';
    if (role === 'moderator') return 'مشرف';
    return 'عضو';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: 40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section className="relative py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t('leaders.title').split(' ')[0]}{' '}
            <span className="gradient-text">{t('leaders.title').split(' ')[1]}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('leaders.subtitle')}
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : leaders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            لا يوجد مستخدمون بعد
          </div>
        ) : (
          <motion.div 
            className="max-w-3xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {leaders.map((leader, index) => {
              const rank = index + 1;
              const badge = getRankBadge(rank);
              const userId = leader.id || leader._id;
              const firstChar = leader.name ? leader.name.charAt(0) : '؟';
              const isTopThree = rank <= 3;
              const isFounder = leader.isFoundingMember;
              
              return (
                <motion.div
                  key={userId}
                  variants={rowVariants}
                  whileHover={{ 
                    x: -4,
                    transition: { type: 'spring', stiffness: 300, damping: 20 }
                  }}
                >
                  <Link
                    to={`/profile/${userId}`}
                    className={`group flex items-center gap-4 p-4 mb-3 rounded-xl bg-card/50 border transition-all duration-300 ${
                      isTopThree 
                        ? 'border-amber-500/30 hover:border-amber-500/50 hover:bg-card hover:shadow-[0_5px_20px_-5px_rgba(251,191,36,0.3)]'
                        : 'border-border/50 hover:bg-card hover:border-primary/30'
                    }`}
                  >
                    <motion.div 
                      whileHover={isTopThree ? { scale: 1.2, rotate: [0, -10, 10, 0] } : { scale: 1.1 }}
                      transition={{ duration: 0.4 }}
                      className="flex-shrink-0 w-10 h-10 flex items-center justify-center"
                    >
                      {badge.emoji ? (
                        <span className="text-2xl">{badge.emoji}</span>
                      ) : (
                        <span className="text-lg font-bold text-muted-foreground">{rank}</span>
                      )}
                    </motion.div>

                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                      className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center text-lg font-bold overflow-hidden`}
                      style={rank <= 3 ? { color: '#000' } : {}}
                    >
                      {leader.avatar ? (
                        <img src={leader.avatar} alt={leader.name} className="w-full h-full object-cover" />
                      ) : (
                        firstChar
                      )}
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold truncate group-hover:text-primary transition-colors">
                          {leader.name}
                        </h3>
                        {isFounder && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-amber-500/15 text-amber-500 border border-amber-500/30 rounded-full">
                            <Sparkles className="w-2.5 h-2.5" />
                            مؤسس
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{getRoleText(leader.role, isFounder)}</p>
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
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
