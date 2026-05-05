import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Target, 
  Users, 
  Lightbulb, 
  Heart, 
  Globe, 
  MapPin,
  Mail,
  Linkedin,
  Instagram,
  Music2,
  ArrowLeft,
} from 'lucide-react';
import { api } from '@/services/api';
import { Navbar } from '../sections/Navbar';
import { Footer } from '../sections/Footer';
import { Sidebar } from '../Sidebar';
import { LoginDialog } from '../components/LoginDialog';
import { JoinDialog } from '../components/JoinDialog';
import { CreateDiscussionDialog } from '../components/CreateDiscussionDialog';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';

interface Stats {
  users: number;
  discussions: number;
  circles: number;
  contributions: number;
}

export function AboutPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  
  const [stats, setStats] = useState<Stats>({
    users: 0,
    discussions: 0,
    circles: 0,
    contributions: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const config = {
    email: 'hello@aporialab.space',
    location: 'دبي، الإمارات العربية المتحدة',
    social: {
      linkedin: 'https://www.linkedin.com/company/aporialab/',
      instagram: 'https://www.instagram.com/aporialab_official',
      tiktok: 'https://www.tiktok.com/@aporialab.space',
    },
  };

  useEffect(() => {
    document.title = t('seo.about.title') || 'عن المنصة · AporiaLab';
    window.scrollTo(0, 0);
  }, [t]);

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

  const handleCreateClick = () => {
    if (isAuthenticated) {
      setIsCreateOpen(true);
    } else {
      setIsJoinOpen(true);
    }
  };

  const formatNumber = (num: number): string => {
    if (num === 0) return '٠';
    if (num < 1000) return num.toLocaleString('ar-EG');
    if (num < 1000000) return (num / 1000).toFixed(1).replace('.0', '') + 'K';
    return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
  };

  const values = [
    {
      icon: Lightbulb,
      title: 'العمق الفكري',
      description: 'نؤمن بأن الحوار الجاد يتطلب التعمق في المواضيع وليس السطحية',
    },
    {
      icon: Users,
      title: 'التنوع والاحترام',
      description: 'نرحب بالآراء المختلفة ونحترم جميع وجهات النظر البناءة',
    },
    {
      icon: Target,
      title: 'الجودة على الكمية',
      description: 'نركز على جودة النقاشات وليس عددها، ونكافئ المساهمات العميقة',
    },
    {
      icon: Heart,
      title: 'المجتمع',
      description: 'نبني مجتمعاً من المفكرين يدعم بعضهم البعض في رحلة المعرفة',
    },
  ];

  const milestones = [
    { year: '2024', event: 'فكرة المنصة وولادة المشروع', icon: Lightbulb },
    { year: '2025', event: 'تطوير النموذج الأولي وبناء المجتمع', icon: Users },
    { year: '2026', event: 'الإطلاق الرسمي للمنصة في دبي', icon: Sparkles },
  ];

  const statsDisplay = [
    { value: formatNumber(stats.discussions), label: 'نقاش نشط', icon: '💬' },
    { value: formatNumber(stats.users), label: 'مفكر', icon: '👥' },
    { value: formatNumber(stats.circles), label: 'دائرة فكرية', icon: '🌐' },
    { value: formatNumber(stats.contributions), label: 'مساهمة', icon: '✨' },
  ];

  const socialLinks = [
    { icon: Linkedin, href: config.social.linkedin, label: 'LinkedIn' },
    { icon: Instagram, href: config.social.instagram, label: 'Instagram' },
    { icon: Music2, href: config.social.tiktok, label: 'TikTok' },
  ];

  return (
    <>
      <Sidebar onCreateClick={handleCreateClick} />
      
      <Navbar 
        onLoginClick={() => setIsLoginOpen(true)}
        onJoinClick={() => setIsJoinOpen(true)}
      />
      
      <main className="md:mr-[4.5rem] pt-24 pb-16" dir="rtl">
        {/* Hero Section */}
        <section className="relative py-12 md:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 mb-6 md:mb-8 shadow-[0_0_40px_rgba(251,191,36,0.3)]"
            >
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-background" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl md:text-5xl font-bold mb-4 md:mb-6"
            >
              عن <span className="gradient-text">AporiaLab</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              نحن منصة عربية مخصصة للنقاشات الفكرية العميقة. 
              هدفنا إيجاد مساحة آمنة للحوار الهادف بعيداً عن الضجيج الإعلامي.
            </motion.p>

            {/* Location badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 mt-6 rounded-full bg-amber-500/10 border border-amber-500/30"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-amber-400 font-medium">{config.location}</span>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-6">
                  <span className="gradient-text">رسالتنا</span>
                </h2>
                <div className="space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed">
                  <p>
                    في عالم يغرق في المحتوى السطحي والأخبار السريعة، نؤمن بأن هناك حاجة ملحة 
                    لمساحة تتيح التفكير العميق والحوار الهادف.
                  </p>
                  <p>
                    <strong className="text-amber-400">AporiaLab</strong> ليست مجرد منصة للنقاش، 
                    بل هي مختبر فكري يجمع المفكرين والباحثين والمهتمين بالفلسفة والسياسة والفكر 
                    من جميع أنحاء العالم العربي.
                  </p>
                  <p>
                    نحن نؤمن بأن الحوار الجاد هو أساس التقدم الفكري والاجتماعي، 
                    وأن الاختلاف في الرأي يجب أن يكون مصدراً للإثراء وليس للانقسام.
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent rounded-3xl" />
                <div className="relative p-6 md:p-8 rounded-3xl bg-card/50 border border-amber-500/20 backdrop-blur-sm">
                  <Globe className="w-12 h-12 md:w-16 md:h-16 text-amber-400 mb-4" />
                  <h3 className="text-lg md:text-xl font-bold mb-2">رؤيتنا</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    أن نكون المنصة العربية الرائدة للنقاشات الفكرية العميقة، 
                    وأن نساهم في إحياء الثقافة العربية والحوار الفكري على المستوى العالمي.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-12 md:py-16 bg-secondary/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                <span className="gradient-text">قيمنا</span>
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">المبادئ التي توجه عملنا</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {values.map((value, idx) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    whileHover={{ y: -4 }}
                    className="p-5 md:p-6 rounded-2xl bg-card/50 border border-border/50 text-center hover:border-amber-500/40 transition-all"
                  >
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 md:w-7 md:h-7 text-amber-400" />
                    </div>
                    <h3 className="font-bold mb-2 text-sm md:text-base">{value.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Stats Section - Real Numbers */}
        <section className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                <span className="gradient-text">أرقامنا</span>
              </h2>
              <p className="text-sm text-muted-foreground">إحصائيات حية من المنصة</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statsDisplay.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center p-4 rounded-xl bg-card/40 border border-border/40"
                >
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-3xl md:text-4xl font-bold gradient-text mb-1 font-mono">
                    {isLoadingStats ? (
                      <span className="inline-block w-12 h-8 bg-muted/30 rounded animate-pulse" />
                    ) : (
                      stat.value
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-12 md:py-16 bg-secondary/10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                <span className="gradient-text">رحلتنا</span>
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">محطات مهمة في تاريخ AporiaLab</p>
            </div>
            
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute right-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500/40 via-amber-500/20 to-transparent" />
              
              <div className="space-y-6">
                {milestones.map((milestone, idx) => {
                  const Icon = milestone.icon;
                  return (
                    <motion.div
                      key={milestone.year}
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.15 }}
                      className="relative flex items-start gap-4"
                    >
                      {/* Icon circle */}
                      <div className="relative flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center z-10 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                        <Icon className="w-5 h-5 text-background" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 p-4 rounded-xl bg-card/50 border border-border/50">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-amber-400 font-bold text-lg">{milestone.year}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{milestone.event}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              <span className="gradient-text">فريقنا</span>
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mb-8">
              نحن فريق من المفكرين والمطورين المهتمين بتطوير الحوار الفكري في العالم العربي
            </p>
            
            <div className="p-6 md:p-8 rounded-2xl bg-card/50 border border-amber-500/20 backdrop-blur-sm">
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                <strong className="text-amber-400">AporiaLab</strong> هو مشروع مجتمعي يُدار بواسطة فريق متخصص في مجالات الفلسفة، 
                التقنية، وتصميم تجربة المستخدم. نعمل من قلب دبي، الإمارات العربية المتحدة، 
                لبناء منصة تخدم المفكرين والباحثين في العالم العربي وما وراءه.
              </p>
            </div>

            {/* Social Media */}
            <div className="mt-8">
              <p className="text-xs text-muted-foreground mb-4">تابعنا على</p>
              <div className="flex items-center justify-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="w-10 h-10 rounded-xl bg-card/60 border border-border/50 grid place-items-center text-muted-foreground hover:text-amber-400 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 md:p-10 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 text-center backdrop-blur-sm"
            >
              <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold mb-4">انضم إلى الحوار</h2>
              <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-xl mx-auto leading-relaxed">
                هل أنت مهتم بالفلسفة والفكر؟ انضم إلى مجتمعنا وكن جزءاً من نقاشات تُحدث فرقاً
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/discussions">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:opacity-90 gap-2 shadow-[0_0_20px_rgba(251,191,36,0.25)]"
                  >
                    <Sparkles className="w-4 h-4" />
                    استكشف النقاشات
                  </Button>
                </Link>
                <a href={`mailto:${config.email}`}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    تواصل معنا
                  </Button>
                </a>
              </div>
              
              {/* Back to home link */}
              <Link 
                to="/"
                className="inline-flex items-center gap-2 mt-6 text-xs text-muted-foreground hover:text-amber-400 transition-colors"
              >
                <ArrowLeft className="w-3 h-3 rotate-180" />
                العودة للصفحة الرئيسية
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />

      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      <JoinDialog open={isJoinOpen} onOpenChange={setIsJoinOpen} />
      <CreateDiscussionDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </>
  );
}
