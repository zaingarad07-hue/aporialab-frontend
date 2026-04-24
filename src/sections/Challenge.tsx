import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Sparkles,
  Bell,
  Clock,
  Target,
} from 'lucide-react';

interface ChallengeProps {
  onParticipate: () => void;
}

export function Challenge({ onParticipate }: ChallengeProps) {
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

  return (
    <section id="challenge" ref={sectionRef} className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          
          {/* Coming Soon Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 mb-8">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">قريباً</span>
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            التحديات <span className="gradient-text">الفكرية المؤقتة</span>
          </h2>

          {/* Description */}
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            قريباً، ستتاح تحديات نقاشية مع مؤقت زمني، يشارك فيها المفكرون في مواضيع 
            محددة وتُقيّم جودة حججهم. اشترك لتكون أول من يعلم بإطلاقها.
          </p>

          {/* Feature Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">مؤقت زمني</h3>
              <p className="text-sm text-muted-foreground">
                نقاشات تمتد لفترة محددة، تُعزّز التفكير السريع والعميق
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">مواضيع محورية</h3>
              <p className="text-sm text-muted-foreground">
                قضايا فلسفية وفكرية مختارة بعناية لإثراء النقاش
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">نقاط سمعة</h3>
              <p className="text-sm text-muted-foreground">
                كافآت للمشاركات المتميزة تُعزّز مكانتك في المجتمع
              </p>
            </div>
          </div>

          {/* CTA - Join current platform instead */}
          <div className="inline-flex flex-col items-center gap-4 p-6 rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm max-w-xl">
            <Bell className="w-8 h-8 text-primary" />
            <p className="text-muted-foreground text-center">
              في هذه الأثناء، انضم إلى النقاشات الحالية وابدأ ببناء حضورك الفكري
            </p>
            <Button
              size="lg"
              onClick={onParticipate}
              className="bg-primary text-primary-foreground hover:bg-primary/90 btn-shine group"
            >
              ابدأ نقاشاً الآن
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
