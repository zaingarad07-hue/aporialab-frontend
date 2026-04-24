import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Plus, 
  BookOpen, 
  Landmark, 
  Lock, 
  Brain,
  ArrowLeft
} from 'lucide-react';

const circleIcons = {
  philosophy: BookOpen,
  politics: Landmark,
  advanced: Lock,
  mind: Brain,
};

export function Circles() {
  const { t } = useTranslation();

  const circles = [
    {
      id: 1,
      key: 'philosophy',
      name: t('circles.items.philosophy.title'),
      category: t('circles.categories.philosophy'),
      description: t('circles.items.philosophy.description'),
      members: 3241,
      icon: circleIcons.philosophy,
      color: 'from-purple-500/20 to-purple-600/10',
      iconColor: 'text-purple-400',
    },
    {
      id: 2,
      key: 'politics',
      name: t('circles.items.politics.title'),
      category: t('circles.categories.politics'),
      description: t('circles.items.politics.description'),
      members: 2156,
      icon: circleIcons.politics,
      color: 'from-blue-500/20 to-blue-600/10',
      iconColor: 'text-blue-400',
    },
    {
      id: 3,
      key: 'advanced',
      name: t('circles.items.advanced.title'),
      category: t('circles.categories.advanced'),
      description: t('circles.items.advanced.description'),
      members: 89,
      icon: circleIcons.advanced,
      color: 'from-amber-500/20 to-amber-600/10',
      iconColor: 'text-amber-400',
      isPrivate: true,
    },
    {
      id: 4,
      key: 'mind',
      name: t('circles.items.mind.title'),
      category: t('circles.categories.mind'),
      description: t('circles.items.mind.description'),
      members: 1234,
      icon: circleIcons.mind,
      color: 'from-emerald-500/20 to-emerald-600/10',
      iconColor: 'text-emerald-400',
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
    hidden: { opacity: 0, scale: 0.85, y: 40 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section id="circles" className="relative py-24 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">
              {t('circles.title').split(' ')[0]}{' '}
              <span className="gradient-text">{t('circles.title').split(' ')[1]}</span>
            </h2>
            <p className="text-muted-foreground">
              {t('circles.subtitle')}
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button className="self-start bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              {t('circles.create')}
            </Button>
          </motion.div>
        </motion.div>

        {/* Circles Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {circles.map((circle) => (
            <motion.div
              key={circle.id}
              variants={cardVariants}
              whileHover={{ 
                y: -10,
                scale: 1.03,
                transition: { type: 'spring', stiffness: 300, damping: 20 }
              }}
              className="group relative flex flex-col rounded-2xl bg-card border border-border/50 overflow-hidden hover:border-primary/50 hover:shadow-[0_15px_40px_-10px_rgba(251,191,36,0.25)] transition-all duration-300"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${circle.color} opacity-50`} />

              {/* Content */}
              <div className="relative z-10 p-6 flex flex-col h-full">
                {/* Category Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs px-3 py-1 rounded-full bg-background/50 backdrop-blur-sm">
                    {circle.category}
                  </span>
                  {circle.isPrivate && (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>

                {/* Icon with pulse */}
                <motion.div 
                  whileHover={{ 
                    rotate: [0, -10, 10, -5, 0],
                    scale: 1.15,
                  }}
                  transition={{ duration: 0.5 }}
                  className={`w-14 h-14 rounded-xl bg-background/50 backdrop-blur-sm flex items-center justify-center mb-4 ${circle.iconColor}`}
                >
                  <circle.icon className="w-7 h-7" />
                </motion.div>

                {/* Info */}
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                  {circle.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">
                  {circle.description}
                </p>

                {/* Members & Action */}
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{circle.members.toLocaleString()}</span>
                    <span>{t('circles.members')}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-primary hover:text-primary hover:bg-primary/10"
                  >
                    {t('circles.join')}
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
