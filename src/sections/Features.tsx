import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { GitBranch, Layers, Mic, UserX, Sparkles, Clock } from 'lucide-react';

const featureIcons = {
  argumentTree: GitBranch,
  depthLevels: Layers,
  voiceChat: Mic,
  devilsAdvocate: UserX,
};

export function Features() {
  const { t } = useTranslation();

  const features = [
    {
      key: 'depthLevels',
      icon: featureIcons.depthLevels,
      title: t('features.items.depthLevels.title'),
      description: t('features.items.depthLevels.description'),
      status: 'available',
    },
    {
      key: 'argumentTree',
      icon: featureIcons.argumentTree,
      title: t('features.items.argumentTree.title'),
      description: t('features.items.argumentTree.description'),
      status: 'coming-soon',
    },
    {
      key: 'voiceChat',
      icon: featureIcons.voiceChat,
      title: t('features.items.voiceChat.title'),
      description: t('features.items.voiceChat.description'),
      status: 'coming-soon',
    },
    {
      key: 'devilsAdvocate',
      icon: featureIcons.devilsAdvocate,
      title: t('features.items.devilsAdvocate.title'),
      description: t('features.items.devilsAdvocate.description'),
      status: 'coming-soon',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: (index: number) => ({
      opacity: 0,
      x: index % 2 === 0 ? 50 : -50,
      y: 30,
    }),
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.7,
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
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t('features.title').split(' ').map((word, i, arr) => 
              i === arr.length - 2 ? <span key={i}><span className="gradient-text">{word}</span>{' '}</span> : word + ' '
            )}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {features.map((feature, index) => {
            const isComingSoon = feature.status === 'coming-soon';
            
            return (
              <motion.div
                key={feature.key}
                custom={index}
                variants={cardVariants}
                whileHover={{ 
                  y: -6,
                  scale: 1.02,
                  transition: { type: 'spring', stiffness: 300, damping: 20 }
                }}
                className={`group relative p-6 sm:p-8 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-[0_10px_40px_-10px_rgba(251,191,36,0.2)] ${
                  isComingSoon ? 'opacity-90' : ''
                }`}
              >
                {/* Gradient Border Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon + Status Badge */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <motion.div 
                      whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        isComingSoon 
                          ? 'bg-amber-500/10 group-hover:bg-amber-500/20' 
                          : 'bg-primary/10 group-hover:bg-primary/20'
                      }`}
                    >
                      <feature.icon className={`w-6 h-6 ${isComingSoon ? 'text-amber-500' : 'text-primary'}`} />
                    </motion.div>
                    
                    {isComingSoon && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-full">
                        <Clock className="w-3 h-3" />
                        قريباً
                      </span>
                    )}
                    
                    {!isComingSoon && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded-full">
                        <Sparkles className="w-3 h-3" />
                        متاح الآن
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className={`text-xl font-bold mb-3 transition-colors ${
                    isComingSoon 
                      ? 'group-hover:text-amber-500' 
                      : 'group-hover:text-primary'
                  }`}>
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Additional Info */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.div 
            whileHover={{ scale: 1.05, borderColor: 'rgba(251, 191, 36, 0.5)' }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary/50 border border-border/50 transition-colors"
          >
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-muted-foreground">
              {t('features.moreTools')}
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
