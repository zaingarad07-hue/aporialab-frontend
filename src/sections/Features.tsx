import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { GitBranch, Layers, Mic, UserX, Sparkles, Clock, MessageSquareQuote, CheckCircle2 } from 'lucide-react';

interface Feature {
  key: string;
  icon: React.ElementType;
  title: string;
  description: string;
  status: 'available' | 'coming-soon';
  eta?: string;
  color: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

export function Features() {
  const { t } = useTranslation();

  const features: Feature[] = [
    {
      key: 'stances',
      icon: MessageSquareQuote,
      title: 'النقاش بالمواقف',
      description: 'اختر موقفك (مع/ضد/محايد) قبل الكتابة. شاهد توزيع الآراء بصرياً، وفلتر حسب الموقف.',
      status: 'available',
      color: 'green',
      bgClass: 'bg-green-500/10 group-hover:bg-green-500/20',
      borderClass: 'border-green-500/30 hover:border-green-500/60',
      textClass: 'text-green-400',
    },
    {
      key: 'depthLevels',
      icon: Layers,
      title: t('features.items.depthLevels.title'),
      description: t('features.items.depthLevels.description'),
      status: 'available',
      color: 'amber',
      bgClass: 'bg-amber-500/10 group-hover:bg-amber-500/20',
      borderClass: 'border-amber-500/30 hover:border-amber-500/60',
      textClass: 'text-amber-400',
    },
    {
      key: 'argumentTree',
      icon: GitBranch,
      title: t('features.items.argumentTree.title'),
      description: t('features.items.argumentTree.description'),
      status: 'coming-soon',
      eta: 'Q2 2026',
      color: 'purple',
      bgClass: 'bg-purple-500/10',
      borderClass: 'border-purple-500/20',
      textClass: 'text-purple-400',
    },
    {
      key: 'voiceChat',
      icon: Mic,
      title: t('features.items.voiceChat.title'),
      description: t('features.items.voiceChat.description'),
      status: 'coming-soon',
      eta: 'Q3 2026',
      color: 'blue',
      bgClass: 'bg-blue-500/10',
      borderClass: 'border-blue-500/20',
      textClass: 'text-blue-400',
    },
    {
      key: 'devilsAdvocate',
      icon: UserX,
      title: t('features.items.devilsAdvocate.title'),
      description: t('features.items.devilsAdvocate.description'),
      status: 'coming-soon',
      eta: 'Q4 2026',
      color: 'pink',
      bgClass: 'bg-pink-500/10',
      borderClass: 'border-pink-500/20',
      textClass: 'text-pink-400',
    },
  ];

  const availableCount = features.filter(f => f.status === 'available').length;
  const totalCount = features.length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(251, 191, 36, 0.3) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
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
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-medium text-amber-400">المميزات</span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {t('features.title').split(' ').map((word, i, arr) => 
              i === arr.length - 2 ? <span key={i}><span className="gradient-text">{word}</span>{' '}</span> : word + ' '
            )}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            {t('features.subtitle')}
          </p>
          
          {/* Progress Indicator */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-card/50 border border-border/50 backdrop-blur-sm">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-sm font-mono font-bold text-green-400">{availableCount}</span>
            </div>
            <span className="text-xs text-muted-foreground">من</span>
            <span className="text-sm font-mono font-bold text-foreground">{totalCount}</span>
            <span className="text-xs text-muted-foreground">ميزة متاحة الآن</span>
            
            {/* Progress bar */}
            <div className="w-20 h-1.5 bg-secondary/50 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                initial={{ width: 0 }}
                whileInView={{ width: `${(availableCount / totalCount) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {features.map((feature) => {
            const isComingSoon = feature.status === 'coming-soon';
            
            return (
              <motion.div
                key={feature.key}
                variants={cardVariants}
                whileHover={{ 
                  y: -6,
                  transition: { type: 'spring', stiffness: 300, damping: 20 }
                }}
                className={`group relative p-6 rounded-2xl bg-card/50 border backdrop-blur-sm transition-all duration-300 overflow-hidden ${feature.borderClass} ${
                  isComingSoon 
                    ? 'opacity-80 hover:opacity-100' 
                    : 'shadow-[0_4px_20px_-8px_rgba(34,197,94,0.15)] hover:shadow-[0_15px_40px_-15px_rgba(251,191,36,0.3)]'
                }`}
              >
                {/* Status badge - top right */}
                <div className="absolute top-4 left-4">
                  {isComingSoon ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-secondary/50 text-muted-foreground border border-border/50 rounded-full backdrop-blur-sm">
                      <Clock className="w-2.5 h-2.5" />
                      {feature.eta || 'قريباً'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-green-500/15 text-green-400 border border-green-500/40 rounded-full backdrop-blur-sm">
                      <span className="relative flex w-1.5 h-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-green-500" />
                      </span>
                      متاح الآن
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="relative z-10 mt-6">
                  {/* Icon */}
                  <motion.div 
                    whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all mb-4 ${feature.bgClass}`}
                  >
                    <feature.icon className={`w-7 h-7 ${feature.textClass}`} />
                  </motion.div>

                  {/* Title */}
                  <h3 className={`text-lg font-bold mb-2 transition-colors ${
                    isComingSoon 
                      ? `group-hover:${feature.textClass}` 
                      : feature.textClass
                  }`}>
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Hover gradient overlay */}
                {!isComingSoon && (
                  <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle at 50% 0%, rgba(34, 197, 94, 0.08) 0%, transparent 60%)'
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Roadmap link */}
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="inline-flex flex-col sm:flex-row items-center gap-3 px-6 py-3 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm transition-colors hover:border-amber-500/50"
          >
            <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <span className="text-sm text-muted-foreground">
              نُطوّر ميزات جديدة باستمرار — تابعنا لمعرفة الجديد
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
