import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../sections/Navbar';
import { Footer } from '../sections/Footer';
import { Sparkles, Target, Users, Lightbulb, Heart, Globe } from 'lucide-react';

export function AboutPage() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('seo.about.title');
    window.scrollTo(0, 0);
  }, [t]);

  const values = [
    {
      icon: Lightbulb,
      title: 'العمق الفكري',
      description: 'نؤمن بأن الحوار الجاد يتطلب التعمق في المواضيع وليس السطحية'
    },
    {
      icon: Users,
      title: 'التنوع والاحترام',
      description: 'نرحب بالآراء المختلفة ونحترم جميع وجهات النظر البناءة'
    },
    {
      icon: Target,
      title: 'الجودة على الكمية',
      description: 'نركز على جودة النقاشات وليس عددها'
    },
    {
      icon: Heart,
      title: 'المجتمع',
      description: 'نبني مجتمعاً من المفكرين يدعم بعضهم البعض'
    }
  ];

  const milestones = [
    { year: '2024', event: 'فكرة المنصة ولادة المشروع' },
    { year: '2025', event: 'تطوير النموذج الأولي' },
    { year: '2026', event: 'الإطلاق الرسمي للمنصة' }
  ];

  const stats = [
    { value: '١٥K+', label: 'نقاش نشط' },
    { value: '٨K+', label: 'مفكر' },
    { value: '٥٠٠+', label: 'دائرة فكرية' },
    { value: '١M+', label: 'مساهمة' }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <Navbar onLoginClick={() => {}} onJoinClick={() => {}} />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 mb-8">
              <Sparkles className="w-10 h-10 text-background" />
            </div>
            <h1 className="text-5xl font-bold mb-6">
              عن <span className="gradient-text">AporiaLab</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              نحن منصة عربية مخصصة للنقاشات الفكرية العميقة. 
              هدفنا إيجاد مساحة آمنة للحوار الهادف ب alejidad alejidad عن الضجيج الإعلامي.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">رسالتنا</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  في عالم يغرق في المحتوى السطحي والأخبار السريعة، نؤمن بأن هناك حاجة ملحة 
                  لمساحة تتيح التفكير العميق والحوار الهادف.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  AporiaLab ليست مجرد منصة للنقاش، بل هي مختبر فكري يجمع المفكرين والباحثين 
                  والمهتمين بالفلسفة والسياسة والفكر من جميع أنحاء العالم العربي.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  نحن نؤمن بأن الحوار الجاد هو أساس التقدم الفكري والاجتماعي، 
                  وأن الاختلاف في الرأي يجب أن يكون مصدراً للإثراء وليس للانقسام.
                </p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl" />
                <div className="relative p-8 rounded-3xl bg-card/50 border border-border/50">
                  <Globe className="w-16 h-16 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">رؤيتنا</h3>
                  <p className="text-muted-foreground">
                    أن نكون المنصة العربية الرائدة للنقاشات الفكرية العميقة، 
                    وأن نساهم في إحياء الثقافة العربية والحوار الفكري.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-secondary/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">قيمنا</h2>
              <p className="text-muted-foreground">المبادئ التي توجه عملنا</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value) => (
                <div 
                  key={value.title}
                  className="p-6 rounded-2xl bg-card/50 border border-border/50 text-center card-hover"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-16 bg-secondary/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">رحلتنا</h2>
              <p className="text-muted-foreground">محطات مهمة في تاريخ AporiaLab</p>
            </div>
            
            <div className="relative">
              <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-border hidden md:block" />
              
              <div className="space-y-8">
                {milestones.map((milestone) => (
                  <div key={milestone.year} className="relative flex items-start gap-6">
                    <div className="hidden md:flex w-8 h-8 rounded-full bg-primary items-center justify-center flex-shrink-0 relative z-10">
                      <div className="w-3 h-3 rounded-full bg-background" />
                    </div>
                    <div className="flex-1 p-4 rounded-xl bg-card/50 border border-border/50">
                      <span className="text-primary font-bold">{milestone.year}</span>
                      <p className="text-muted-foreground mt-1">{milestone.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">فريقنا</h2>
            <p className="text-muted-foreground mb-8">
              نحن فريق من المفكرين والمطورين المهتمين بتطوير الحوار الفكري في العالم العربي
            </p>
            
            <div className="p-8 rounded-2xl bg-card/50 border border-border/50">
              <p className="text-muted-foreground leading-relaxed">
                AporiaLab هو مشروع مجتمعي يدار بواسطة فريق متخصص في مجالات الفلسفة، 
                التقنية، وتصميم تجربة المستخدم. نعمل معاً لبناء منصة تخدم المفكرين 
                والباحثين في العالم العربي.
              </p>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center">
              <h2 className="text-2xl font-bold mb-4">انضم إلينا</h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                هل أنت مهتم بالفلسفة والفكر؟ انضم إلى مجتمعنا وكن جزءاً من الحوار
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/" 
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  ابدأ الآن
                </a>
                <a 
                  href="mailto:contact@aporialab.space" 
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border hover:bg-secondary transition-colors"
                >
                  تواصل معنا
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
