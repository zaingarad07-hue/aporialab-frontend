import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GitBranch, Layers, Mic, UserX, Sparkles, Clock } from 'lucide-react';

const featureIcons = {
  argumentTree: GitBranch,
  depthLevels: Layers,
  voiceChat: Mic,
  devilsAdvocate: UserX,
};

export function Features() {
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
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

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

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden">
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
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t('features.title').split(' ').map((word, i, arr) => 
              i === arr.length - 2 ? <span key={i}><span className="gradient-text">{word}</span>{' '}</span> : word + ' '
            )}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const isComingSoon = feature.status === 'coming-soon';
            
            return (
              <div
                key={feature.key}
                className={`group relative p-6 sm:p-8 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm card-hover transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                } ${isComingSoon ? 'opacity-90' : ''}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Gradient Border Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon + Status Badge */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      isComingSoon 
                        ? 'bg-amber-500/10 group-hover:bg-amber-500/20' 
                        : 'bg-primary/10 group-hover:bg-primary/20'
                    }`}>
                      <feature.icon className={`w-6 h-6 ${isComingSoon ? 'text-amber-500' : 'text-primary'}`} />
                    </div>
                    
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
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className={`mt-16 text-center transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary/50 border border-border/50">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-muted-foreground">
              {t('features.moreTools')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
