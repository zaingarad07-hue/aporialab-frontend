import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, Users, MessageCircle, BookOpen, Sparkles } from 'lucide-react';
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

  // Fetch real stats from API
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

    const particleCount = 50;
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

    const animate = () => {
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

      animationId = requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Format number: small numbers as-is, large numbers with K/M
  const formatNumber = (num: number): string => {
    if (num === 0) return '٠';
    if (num < 1000) return num.toLocaleString('ar-EG');
    if (num < 1000000) return (num / 1000).toFixed(1).replace('.0', '') + 'K';
    return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
  };

  const statsItems = [
    { icon: MessageCircle, value: formatNumber(stats.discussions), label: t('hero.stats.activeDiscussions') },
    { icon: Users, value: formatNumber(stats.users), label: t('hero.stats.thinkers') },
    { icon: BookOpen, value: formatNumber(stats.circles), label: t('hero.stats.circles') },
    { icon: Sparkles, value: formatNumber(stats.contributions), label: t('hero.stats.contributions') },
  ];

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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">{t('hero.badge')}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up stagger-1">
          <span className="gradient-text">{t('app.name')}</span>
        </h1>

        <p className="text-xl sm:text-2xl md:text-3xl text-foreground mb-4 animate-slide-up stagger-2">
          {t('hero.title')}
        </p>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up stagger-3">
          {t('hero.description')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up stagger-4">
          <Button
            size="lg"
            onClick={onStartDiscussion}
            className="bg-primary text-primary-foreground hover:bg-primary/90 btn-shine group min-w-[180px]"
          >
            {t('hero.startDiscussion')}
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onTimedDiscussions}
            className="group min-w-[180px]"
          >
            <Clock className="w-4 h-4 ml-2" />
            {t('hero.timedDiscussions')}
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 animate-slide-up stagger-5">
          {statsItems.map((stat, index) => (
            <div
              key={stat.label}
              className="flex flex-col items-center p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm"
              style={{ animationDelay: `${0.6 + index * 0.1}s` }}
            >
              <stat.icon className="w-6 h-6 text-primary mb-2" />
              <span className="text-2xl sm:text-3xl font-bold text-foreground">
                {isLoadingStats ? (
                  <span className="inline-block w-10 h-8 bg-muted rounded animate-pulse" />
                ) : (
                  stat.value
                )}
              </span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
