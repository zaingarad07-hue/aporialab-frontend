import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Users, 
  Star, 
  ArrowLeft,
  Target
} from 'lucide-react';

interface ChallengeProps {
  onParticipate: () => void;
}

export function Challenge({ onParticipate }: ChallengeProps) {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 35,
  });

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

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59 };
        }
        return prev;
      });
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section id="challenge" ref={sectionRef} className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Challenge Info */}
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary mb-6">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-medium">{t('challenge.badge')}</span>
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {t('challenge.title').split(' ').slice(0, -2).join(' ')}{' '}
              <span className="gradient-text">{t('challenge.title').split(' ').slice(-2).join(' ')}</span>
            </h2>

            {/* Topic */}
            <div className="p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm mb-6">
              <p className="text-sm text-muted-foreground mb-2">{t('challenge.topic')}:</p>
              <p className="text-xl font-bold text-foreground">
                {t('challenge.currentTopic')}
              </p>
            </div>

            {/* Requirements */}
            <div className="flex items-center gap-2 text-muted-foreground mb-8">
              <Target className="w-4 h-4" />
              <span className="text-sm">{t('challenge.requirements')}</span>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">١٢٨</p>
                  <p className="text-sm text-muted-foreground">{t('challenge.participants')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">٥٠٠</p>
                  <p className="text-sm text-muted-foreground">{t('challenge.points')}</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Button
              size="lg"
              onClick={onParticipate}
              className="bg-primary text-primary-foreground hover:bg-primary/90 btn-shine group"
            >
              {t('challenge.participate')}
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Right: Timer & Progress */}
          <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="p-8 rounded-3xl bg-card/50 border border-border/50 backdrop-blur-sm">
              {/* Timer */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-2">
                    <span className="text-3xl font-bold">{timeLeft.days}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{t('challenge.timer.days')}</span>
                </div>
                <span className="text-3xl font-bold text-muted-foreground">:</span>
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-2">
                    <span className="text-3xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{t('challenge.timer.hours')}</span>
                </div>
                <span className="text-3xl font-bold text-muted-foreground">:</span>
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-2">
                    <span className="text-3xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{t('challenge.timer.minutes')}</span>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('challenge.progress')}</span>
                  <span className="font-medium">{t('challenge.progressPercent')}</span>
                </div>
                <Progress value={65} className="h-3" />
                <p className="text-sm text-muted-foreground text-center">
                  {t('challenge.remaining', { count: 45 })}
                </p>
              </div>

              {/* User Achievement Preview */}
              <div className="mt-8 p-4 rounded-xl bg-secondary/50">
                <p className="text-sm text-muted-foreground mb-4">{t('challenge.yourAchievements')}</p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Trophy className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{t('challenge.level')}</p>
                    <p className="text-sm text-muted-foreground">{t('challenge.beginner')}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-primary">٠</p>
                    <p className="text-xs text-muted-foreground">{t('challenge.discussions')}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-primary">٠</p>
                    <p className="text-xs text-muted-foreground">{t('challenge.reputation')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
