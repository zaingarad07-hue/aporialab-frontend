import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Medal, 
  Loader2, 
  Sparkles, 
  Crown, 
  Trophy, 
  Award,
  Users,
} from 'lucide-react';
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

// Tier system based on reputation
function getTier(reputation: number) {
  if (reputation >= 1000) return { name: 'بلاتيني', color: 'from-cyan-400 to-blue-500', textColor: 'text-cyan-400', icon: Crown };
  if (reputation >= 500) return { name: 'ذهبي', color: 'from-amber-400 to-yellow-500', textColor: 'text-amber-400', icon: Trophy };
  if (reputation >= 200) return { name: 'فضي', color: 'from-slate-300 to-slate-500', textColor: 'text-slate-300', icon: Award };
  if (reputation >= 50) return { name: 'برونزي', color: 'from-orange-500 to-amber-700', textColor: 'text-orange-400', icon: Medal };
  return { name: 'مبتدئ', color: 'from-zinc-500 to-zinc-700', textColor: 'text-zinc-400', icon: Sparkles };
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

  const getRoleText = (role?: string, isFoundingMember?: boolean) => {
    if (isFoundingMember) return 'مفكر مؤسس';
    if (role === 'admin') return 'مشرف عام';
    if (role === 'moderator') return 'مشرف';
    return 'عضو';
  };

  const totalReputation = leaders.reduce((sum, l) => sum + (l.reputation || 0), 0);
  const topThree = leaders.slice(0, 3);
  const restLeaders = leaders.slice(3);

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

  const podiumVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
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
    <section className="relative py-24 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-medium text-amber-400">قادة الفكر</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t('leaders.title').split(' ')[0]}{' '}
            <span className="gradient-text">{t('leaders.title').split(' ')[1]}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            {t('leaders.subtitle')}
          </p>

          {/* Aggregate Stats */}
          {!isLoading && leaders.length > 0 && (
            <div className="inline-flex items-center gap-4 px-5 py-2.5 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-mono font-bold text-amber-400">{leaders.length}</span>
                <span className="text-xs text-muted-foreground">مفكر</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-mono font-bold text-amber-400">{totalReputation.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">نقطة جماعية</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">جاري تحميل قادة الفكر...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && leaders.length === 0 && (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6">
              <Trophy className="w-10 h-10 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">لم يتشكّل مجلس الفكر بعد</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              ابدأ المساهمة لتكون من أوائل قادة الفكر في AporiaLab
            </p>
          </motion.div>
        )}

        {/* Top 3 Podium */}
        {!isLoading && topThree.length > 0 && (
          <motion.div
            className="mb-10"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            <div className="grid grid-cols-3 gap-3 md:gap-5 max-w-3xl mx-auto items-end">
              {/* 2nd place */}
              {topThree[1] && (() => {
                const leader = topThree[1];
                const tier = getTier(leader.reputation || 0);
                const TierIcon = tier.icon;
                const userId = leader.id || leader._id;
                const firstChar = leader.name ? leader.name.charAt(0) : '؟';
                
                return (
                  <motion.div
                    custom={1}
                    variants={podiumVariants}
                    className="order-1"
                  >
                    <Link
                      to={`/profile/${userId}`}
                      className="group block"
                    >
                      <div className="text-center">
                        {/* Medal */}
                        <div className="text-4xl md:text-5xl mb-2">🥈</div>
                        
                        {/* Avatar */}
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.5 }}
                          className="relative mx-auto mb-3"
                        >
                          <div className={`w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full bg-gradient-to-br ${tier.color} grid place-items-center text-xl md:text-2xl font-bold text-black overflow-hidden ring-2 ring-slate-300/40 ring-offset-2 ring-offset-background`}>
                            {leader.avatar ? (
                              <img src={leader.avatar} alt={leader.name} className="w-full h-full object-cover" />
                            ) : (
                              firstChar
                            )}
                          </div>
                          {leader.isFoundingMember && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 grid place-items-center shadow-lg">
                              <Crown className="w-3.5 h-3.5 text-black" />
                            </div>
                          )}
                        </motion.div>
                        
                        {/* Name */}
                        <h3 className="text-xs md:text-sm font-bold mb-1 truncate group-hover:text-primary transition-colors">
                          {leader.name}
                        </h3>
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-medium ${tier.textColor} bg-card/50 border border-border/50`}>
                          <TierIcon className="w-2.5 h-2.5" />
                          {tier.name}
                        </div>
                        <p className="text-sm md:text-base font-mono font-bold mt-2 text-foreground">
                          {(leader.reputation || 0).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground">نقطة</p>
                      </div>
                      
                      {/* Podium block */}
                      <div className="mt-3 h-16 md:h-20 rounded-t-lg bg-gradient-to-t from-slate-700/30 to-slate-600/10 border border-slate-500/30 grid place-items-center">
                        <span className="text-2xl md:text-3xl font-bold text-slate-400">2</span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })()}

              {/* 1st place (center, taller) */}
              {topThree[0] && (() => {
                const leader = topThree[0];
                const tier = getTier(leader.reputation || 0);
                const TierIcon = tier.icon;
                const userId = leader.id || leader._id;
                const firstChar = leader.name ? leader.name.charAt(0) : '؟';
                
                return (
                  <motion.div
                    custom={0}
                    variants={podiumVariants}
                    className="order-2"
                  >
                    <Link
                      to={`/profile/${userId}`}
                      className="group block"
                    >
                      <div className="text-center">
                        {/* Crown */}
                        <motion.div 
                          className="text-5xl md:text-6xl mb-2"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          👑
                        </motion.div>
                        
                        {/* Avatar with extra glow */}
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="relative mx-auto mb-3"
                        >
                          {/* Glow effect */}
                          <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-xl animate-pulse" />
                          <div className={`relative w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full bg-gradient-to-br ${tier.color} grid place-items-center text-2xl md:text-3xl font-bold text-black overflow-hidden ring-4 ring-amber-400/60 ring-offset-2 ring-offset-background shadow-[0_0_30px_rgba(251,191,36,0.5)]`}>
                            {leader.avatar ? (
                              <img src={leader.avatar} alt={leader.name} className="w-full h-full object-cover" />
                            ) : (
                              firstChar
                            )}
                          </div>
                          {leader.isFoundingMember && (
                            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-400 grid place-items-center shadow-lg">
                              <Crown className="w-4 h-4 text-black" />
                            </div>
                          )}
                        </motion.div>
                        
                        <h3 className="text-sm md:text-base font-bold mb-1 truncate group-hover:text-primary transition-colors">
                          {leader.name}
                        </h3>
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium ${tier.textColor} bg-card/50 border border-border/50`}>
                          <TierIcon className="w-3 h-3" />
                          {tier.name}
                        </div>
                        <p className="text-base md:text-lg font-mono font-bold mt-2 text-amber-400">
                          {(leader.reputation || 0).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground">نقطة</p>
                      </div>
                      
                      {/* Podium block (tallest) */}
                      <div className="mt-3 h-24 md:h-28 rounded-t-lg bg-gradient-to-t from-amber-500/30 to-amber-400/10 border border-amber-500/40 grid place-items-center shadow-[0_0_20px_rgba(251,191,36,0.2)]">
                        <span className="text-3xl md:text-4xl font-bold text-amber-400">1</span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })()}

              {/* 3rd place */}
              {topThree[2] && (() => {
                const leader = topThree[2];
                const tier = getTier(leader.reputation || 0);
                const TierIcon = tier.icon;
                const userId = leader.id || leader._id;
                const firstChar = leader.name ? leader.name.charAt(0) : '؟';
                
                return (
                  <motion.div
                    custom={2}
                    variants={podiumVariants}
                    className="order-3"
                  >
                    <Link
                      to={`/profile/${userId}`}
                      className="group block"
                    >
                      <div className="text-center">
                        <div className="text-4xl md:text-5xl mb-2">🥉</div>
                        
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="relative mx-auto mb-3"
                        >
                          <div className={`w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full bg-gradient-to-br ${tier.color} grid place-items-center text-xl md:text-2xl font-bold text-white overflow-hidden ring-2 ring-orange-500/40 ring-offset-2 ring-offset-background`}>
                            {leader.avatar ? (
                              <img src={leader.avatar} alt={leader.name} className="w-full h-full object-cover" />
                            ) : (
                              firstChar
                            )}
                          </div>
                          {leader.isFoundingMember && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 grid place-items-center shadow-lg">
                              <Crown className="w-3.5 h-3.5 text-black" />
                            </div>
                          )}
                        </motion.div>
                        
                        <h3 className="text-xs md:text-sm font-bold mb-1 truncate group-hover:text-primary transition-colors">
                          {leader.name}
                        </h3>
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-medium ${tier.textColor} bg-card/50 border border-border/50`}>
                          <TierIcon className="w-2.5 h-2.5" />
                          {tier.name}
                        </div>
                        <p className="text-sm md:text-base font-mono font-bold mt-2 text-foreground">
                          {(leader.reputation || 0).toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground">نقطة</p>
                      </div>
                      
                      <div className="mt-3 h-12 md:h-14 rounded-t-lg bg-gradient-to-t from-orange-700/30 to-orange-600/10 border border-orange-500/30 grid place-items-center">
                        <span className="text-2xl md:text-3xl font-bold text-orange-400">3</span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })()}
            </div>
          </motion.div>
        )}

        {/* Rest of leaders (4+) */}
        {!isLoading && restLeaders.length > 0 && (
          <motion.div 
            className="max-w-3xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {restLeaders.map((leader, index) => {
              const rank = index + 4;
              const tier = getTier(leader.reputation || 0);
              const TierIcon = tier.icon;
              const userId = leader.id || leader._id;
              const firstChar = leader.name ? leader.name.charAt(0) : '؟';
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
                    className="group flex items-center gap-3 md:gap-4 p-3 md:p-4 mb-2.5 rounded-xl bg-card/50 border border-border/50 hover:bg-card hover:border-primary/30 transition-all duration-300"
                  >
                    {/* Rank */}
                    <div className="flex-shrink-0 w-8 text-center">
                      <span className="text-base font-bold text-muted-foreground font-mono">{rank}</span>
                    </div>

                    {/* Avatar */}
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                      className="relative flex-shrink-0"
                    >
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br ${tier.color} grid place-items-center text-base font-bold overflow-hidden ${isFounder ? 'ring-2 ring-amber-400/50' : ''}`}>
                        {leader.avatar ? (
                          <img src={leader.avatar} alt={leader.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white">{firstChar}</span>
                        )}
                      </div>
                      {isFounder && (
                        <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-400 grid place-items-center shadow">
                          <Crown className="w-2.5 h-2.5 text-black" />
                        </div>
                      )}
                    </motion.div>

                    {/* Name + Role */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm md:text-base font-bold truncate group-hover:text-primary transition-colors">
                          {leader.name}
                        </h3>
                        {isFounder && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0 rounded-full bg-amber-500/15 border border-amber-500/30 text-[9px] text-amber-400 font-bold">
                            <Sparkles className="w-2 h-2" />
                            مؤسس
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className={`inline-flex items-center gap-1 ${tier.textColor}`}>
                          <TierIcon className="w-3 h-3" />
                          <span className="text-[10px] font-medium">{tier.name}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className="text-[10px] text-muted-foreground">{getRoleText(leader.role, isFounder)}</span>
                      </div>
                    </div>

                    {/* Reputation */}
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className="text-base md:text-lg font-mono font-bold text-foreground">
                        {(leader.reputation || 0).toLocaleString()}
                      </span>
                      <span className="text-[9px] text-muted-foreground">نقطة</span>
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
