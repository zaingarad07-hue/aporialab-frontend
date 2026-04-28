import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  MessageCircle, 
  BookOpen, 
  Sparkles,
  Radio,
  Compass,
} from 'lucide-react';
import { api } from '@/services/api';

interface HeroProps {
  onStartDiscussion: () => void;
  onTimedDiscussions: () => void;
}

interface Stats {
  users: number;
  discussions: number;
  circles: number;
  contributions: number;
}

interface FounderAvatar {
  name: string;
  initial: string;
}

const FOUNDERS_PREVIEW: FounderAvatar[] = [
  { name: 'Ibn Rushd', initial: 'IR' },
  { name: 'Al-Kindi', initial: 'AK' },
  { name: 'Hypatia', initial: 'H' },
  { name: 'Avicenna', initial: 'A' },
  { name: 'Socrates', initial: 'S' },
];

// Animated counter component
function AnimatedNumber({ value, isLoading }: { value: number; isLoading: boolean }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    if (latest < 1000) return Math.round(latest).toLocaleString('ar-EG');
    if (latest < 1000000) return (latest / 1000).toFixed(1).replace('.0', '') + 'K';
    return (latest / 1000000).toFixed(1).replace('.0', '') + 'M';
  });

  useEffect(() => {
    if (!isLoading) {
      const controls = animate(count, value, {
        duration: 2,
        ease: 'easeOut',
      });
      return () => controls.stop();
    }
  }, [value, isLoading, count]);

  if (isLoading) {
    return <span className="inline-block w-10 h-8 bg-muted rounded animate-pulse" />;
  }

  return <motion.span>{rounded}</motion.span>;
}

export function Hero({ onStartDiscussion, onTimedDiscussions }: HeroProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState<Stats>({
    users: 0,
    discussions: 0,
    circles: 0,
    contributions: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.getStats();
        if (response.success && response.stats) {
          setStats({
            users: response.stats.users,
            discussions: response.stats.discussions,
            circles: response.stats.circles,
            contributions: response.stats.contributions,
          });
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setIsLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      opacity: number;
    }> = [];

    const particleCount = 60;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    let animationId: number;
    let frameCount = 0;

    const animateParticles = () => {
      frameCount++;
      if (frameCount % 2 === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((particle, i) => {
          particle.x += particle.vx;
          particle.y += particle.vy;

          if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
          if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(251, 191, 36, ${particle.opacity})`;
          ctx.fill();

          if (i % 5 === 0) {
            particles.slice(i + 1).forEach((other) => {
              const dx = particle.x - other.x;
              const dy = particle.y - other.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < 100) {
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(other.x, other.y);
                ctx.strokeStyle = `rgba(251, 191, 36, ${0.1 * (1 - distance / 100)})`;
                ctx.stroke();
              }
            });
          }
        });
      }

      animationId = requestAnimationFrame(animateParticles);
    };

    animateParticles();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const statsItems = [
    { icon: MessageCircle, value: stats.discussions, label: t('hero.stats.activeDiscussions') },
    { icon: Users, value: stats.users, label: t('hero.stats.thinkers') },
    { icon: BookOpen, value: stats.circles, label: t('hero.stats.circles') },
    { icon: Sparkles, value: stats.contributions, label: t('hero.stats.contributions') },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.6 }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(251, 191, 36, 0.08) 0%, transparent 50%)'
        }}
      />

      <motion.div 
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Top Row: Beta Badge + Live Indicator */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8"
        >
          {/* Beta Badge */}
          <motion.div 
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 backdrop-blur-sm"
            whileHover={{ scale: 1.05, borderColor: 'rgba(251, 191, 36, 0.6)' }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-medium text-amber-400">نسخة تجريبية مفتوحة · v1.0</span>
          </motion.div>

          {/* Live Indicator */}
          {!isLoadingStats && stats.discussions > 0 && (
            <motion.div 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-green-500" />
              </span>
              <Radio className="w-3 h-3 text-green-400" />
              <span className="text-xs font-medium text-green-400">
                {stats.discussions} {stats.discussions === 1 ? 'نقاش نشط الآن' : 'نقاشات نشطة الآن'}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Title */}
        <motion.h1 
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
        >
          <span className="gradient-text">{t('app.name')}</span>
        </motion.h1>

        <motion.p 
          variants={itemVariants}
          className="text-xl sm:text-2xl md:text-3xl text-foreground mb-4 font-light"
        >
          {t('hero.title')}
        </motion.p>

        <motion.p 
          variants={itemVariants}
          className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          منصة النقاشات الفكرية الأولى للعرب — حيث يلتقي العقل بالحجة
        </motion.p>

        {/* Buttons */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Button
              size="lg"
              onClick={onTimedDiscussions}
              className="bg-primary text-primary-foreground hover:bg-primary/90 btn-shine group min-w-[200px] shadow-[0_0_30px_rgba(251,191,36,0.3)]"
            >
              <Compass className="w-4 h-4 ml-2" />
              اكتشف النقاشات
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Button
              size="lg"
              variant="outline"
              onClick={onStartDiscussion}
              className="group min-w-[200px] border-primary/30 hover:border-primary"
            >
              <Sparkles className="w-4 h-4 ml-2" />
              ابدأ نقاشاً جديداً
            </Button>
          </motion.div>
        </motion.div>

        {/* Social Proof: Founders Avatars */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col items-center gap-3 mb-12"
        >
          <div className="flex items-center gap-3">
            {/* Stacked Avatars */}
            <div className="flex -space-x-3 rtl:space-x-reverse">
              {FOUNDERS_PREVIEW.map((founder, i) => (
                <motion.div
                  key={founder.name}
                  initial={{ opacity: 0, scale: 0, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ 
                    delay: 1 + i * 0.1, 
                    type: 'spring', 
                    stiffness: 200 
                  }}
                  whileHover={{ scale: 1.15, zIndex: 10 }}
                  className="relative w-10 h-10 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-600/10 border-2 border-background grid place-items-center text-xs font-bold text-amber-400 ring-1 ring-amber-400/50 cursor-pointer"
                  title={founder.name}
                  style={{ zIndex: FOUNDERS_PREVIEW.length - i }}
                >
                  {founder.initial}
                </motion.div>
              ))}
            </div>

            {/* Text */}
            <div className="text-right">
              <p className="text-sm text-foreground font-medium">
                انضم إلى{' '}
                <span className="text-amber-400 font-bold">
                  {!isLoadingStats ? stats.users.toLocaleString('ar-EG') : '...'}
                </span>{' '}
                مفكراً
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                بمشاركة فلاسفة مؤسسين
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto"
        >
          {statsItems.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="relative flex flex-col items-center p-4 rounded-xl bg-card/40 border border-border/50 backdrop-blur-sm overflow-hidden group cursor-default"
              whileHover={{ 
                y: -5, 
                borderColor: 'rgba(251, 191, 36, 0.5)',
                boxShadow: '0 10px 30px -10px rgba(251, 191, 36, 0.3)'
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ animationDelay: `${1.2 + index * 0.1}s` }}
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/10 group-hover:to-transparent transition-all duration-500" />
              
              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <stat.icon className="w-6 h-6 text-primary mb-2" />
              </motion.div>
              <span className="text-2xl sm:text-3xl font-bold text-foreground relative font-mono">
                <AnimatedNumber value={stat.value} isLoading={isLoadingStats} />
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground relative">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-12 inline-flex items-center gap-2 text-xs text-muted-foreground/70"
        >
          <Clock className="w-3 h-3" />
          <span>نقاشات موقوتة • تصنيفات ذكية • ردود متعددة الأبعاد</span>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
