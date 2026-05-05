import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  Users,
  Lock,
  Globe,
  SkipForward,
  PartyPopper,
} from 'lucide-react';
import { api } from '@/services/api';
import type { Circle } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Step = 'welcome' | 'topics' | 'circles' | 'complete';

interface Topic {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
}

const TOPICS: Topic[] = [
  { id: 'philosophy', label: 'الفلسفة', icon: '🏛️', color: '#a855f7', description: 'الوجود والمعرفة والأخلاق' },
  { id: 'politics', label: 'السياسة', icon: '⚖️', color: '#ef4444', description: 'الحوكمة والمجتمع' },
  { id: 'ethics', label: 'الأخلاق', icon: '💎', color: '#22c55e', description: 'القيم والفضيلة' },
  { id: 'religion', label: 'الدين', icon: '🕌', color: '#3b82f6', description: 'الإيمان والروحانية' },
  { id: 'science', label: 'العلوم', icon: '🔬', color: '#06b6d4', description: 'الاكتشاف والتجربة' },
  { id: 'technology', label: 'التقنية', icon: '⚙️', color: '#f59e0b', description: 'الذكاء الاصطناعي والمستقبل' },
  { id: 'arts', label: 'الفنون', icon: '🎨', color: '#ec4899', description: 'الجمال والإبداع' },
  { id: 'economics', label: 'الاقتصاد', icon: '📊', color: '#10b981', description: 'الأسواق والمجتمع' },
  { id: 'history', label: 'التاريخ', icon: '📜', color: '#d97706', description: 'الحضارات والتراث' },
  { id: 'psychology', label: 'علم النفس', icon: '🧠', color: '#8b5cf6', description: 'العقل والسلوك' },
];

const MIN_TOPICS = 3;
const MIN_CIRCLES = 1;

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedCircles, setSelectedCircles] = useState<string[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [isLoadingCircles, setIsLoadingCircles] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Set page title
  useEffect(() => {
    document.title = 'مرحباً بك · AporiaLab';
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthLoading, isAuthenticated, navigate]);

  // Check if already completed onboarding
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const completed = localStorage.getItem(`onboarding_completed_${user.id || user._id}`);
    if (completed === 'true') {
      // Already completed, redirect to home
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch circles when reaching circles step
  useEffect(() => {
    if (currentStep === 'circles' && circles.length === 0) {
      fetchCircles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const fetchCircles = async () => {
    try {
      setIsLoadingCircles(true);
      const response = await api.getCircles();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = response as any;
      const list: Circle[] = r.circles || r.data?.circles || [];
      // Show only public circles, sorted by member count
      const publicCircles = list
        .filter(c => !c.isPrivate)
        .sort((a, b) => (b.members || 0) - (a.members || 0));
      setCircles(publicCircles);
    } catch (err) {
      console.error('Failed to fetch circles:', err);
      toast.error('فشل تحميل الدوائر');
    } finally {
      setIsLoadingCircles(false);
    }
  };

  const toggleTopic = (topicId: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(t => t !== topicId)
        : [...prev, topicId]
    );
  };

  const toggleCircle = (circleId: string) => {
    setSelectedCircles(prev => 
      prev.includes(circleId) 
        ? prev.filter(c => c !== circleId)
        : [...prev, circleId]
    );
  };

  const handleNext = () => {
    if (currentStep === 'welcome') {
      setCurrentStep('topics');
    } else if (currentStep === 'topics') {
      if (selectedTopics.length < MIN_TOPICS) {
        toast.warning(`اختر ${MIN_TOPICS} مواضيع على الأقل`);
        return;
      }
      // Save topics to localStorage
      const userId = user?.id || user?._id;
      if (userId) {
        localStorage.setItem(`user_topics_${userId}`, JSON.stringify(selectedTopics));
      }
      setCurrentStep('circles');
    } else if (currentStep === 'circles') {
      if (selectedCircles.length < MIN_CIRCLES) {
        toast.warning(`اختر دائرة واحدة على الأقل`);
        return;
      }
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep === 'topics') {
      setCurrentStep('welcome');
    } else if (currentStep === 'circles') {
      setCurrentStep('topics');
    }
  };

  const handleSkip = () => {
    const userId = user?.id || user?._id;
    if (userId) {
      localStorage.setItem(`onboarding_completed_${userId}`, 'true');
      localStorage.setItem(`onboarding_skipped_${userId}`, 'true');
    }
    toast.info('تخطيت الإعداد، يمكنك إكماله لاحقاً من الإعدادات');
    navigate('/');
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setIsJoining(true);
    try {
      // Join all selected circles
      const joinPromises = selectedCircles.map(circleId => 
        api.joinCircle(circleId).catch(err => {
          console.error(`Failed to join circle ${circleId}:`, err);
          return null;
        })
      );
      
      await Promise.all(joinPromises);
      
      // Save completion in localStorage
      const userId = user.id || user._id;
      if (userId) {
        localStorage.setItem(`onboarding_completed_${userId}`, 'true');
        localStorage.setItem(`user_circles_${userId}`, JSON.stringify(selectedCircles));
      }
      
      // Show success step
      setCurrentStep('complete');
      
      // Auto-redirect after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      toast.error('حدث خطأ، حاول مرة أخرى');
    } finally {
      setIsJoining(false);
    }
  };

  const handleStartJourney = () => {
    navigate('/');
  };

  // Loading auth state
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
      </div>
    );
  }

  // Calculate progress
  const stepOrder: Step[] = ['welcome', 'topics', 'circles', 'complete'];
  const currentIndex = stepOrder.indexOf(currentStep);
  const progress = (currentIndex / (stepOrder.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden" dir="rtl">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Skip button (top right) */}
      {currentStep !== 'welcome' && currentStep !== 'complete' && (
        <button
          onClick={handleSkip}
          className="absolute top-6 left-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-card/40 transition-all z-20"
        >
          <SkipForward className="w-3.5 h-3.5" />
          تخطي الآن
        </button>
      )}

      {/* Progress Bar */}
      {currentStep !== 'welcome' && currentStep !== 'complete' && (
        <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
          <div className="text-xs text-muted-foreground font-mono">
            {currentIndex} / {stepOrder.length - 1}
          </div>
          <div className="w-24 h-1.5 rounded-full bg-card/60 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Welcome */}
          {currentStep === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl w-full text-center"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 mb-8 shadow-[0_0_60px_rgba(251,191,36,0.4)]"
              >
                <Sparkles className="w-12 h-12 text-background" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold mb-4"
              >
                مرحباً بك، <span className="gradient-text">{user?.name?.split(' ')[0] || 'صديقي'}</span>!
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-base md:text-lg text-muted-foreground mb-2 max-w-lg mx-auto leading-relaxed"
              >
                نحن سعداء بانضمامك إلى مجتمع AporiaLab — منصة الحوار الفكري العميق
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-muted-foreground/80 mb-10"
              >
                دعنا نتعرف على اهتماماتك في خطوتين سريعتين ⏱️
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-3 justify-center"
              >
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:opacity-90 shadow-[0_0_30px_rgba(251,191,36,0.3)] gap-2 min-w-[200px]"
                >
                  ابدأ الجولة
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <button
                  onClick={handleSkip}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  تخطي وانتقل للمنصة
                </button>
              </motion.div>

              {/* Stats teaser */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-12 flex items-center justify-center gap-6 text-xs text-muted-foreground"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>منصة جديدة</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3 h-3" />
                  <span>مجتمع متنامٍ</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  <span>محتوى احترافي</span>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Step 2: Topics */}
          {currentStep === 'topics' && (
            <motion.div
              key="topics"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4 }}
              className="max-w-3xl w-full"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  اختر <span className="gradient-text">اهتماماتك</span> الفكرية
                </h2>
                <p className="text-sm text-muted-foreground">
                  حدد {MIN_TOPICS} مواضيع على الأقل لنخصص لك تجربة أفضل
                </p>
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
                  <span className="text-xs text-amber-400 font-mono">
                    {selectedTopics.length} / {TOPICS.length}
                  </span>
                  {selectedTopics.length >= MIN_TOPICS && (
                    <Check className="w-3 h-3 text-amber-400" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
                {TOPICS.map((topic, idx) => {
                  const isSelected = selectedTopics.includes(topic.id);
                  return (
                    <motion.button
                      key={topic.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleTopic(topic.id)}
                      className={`relative p-4 rounded-2xl border-2 text-right transition-all overflow-hidden ${
                        isSelected
                          ? 'bg-gradient-to-br from-amber-500/15 to-transparent shadow-[0_0_20px_rgba(251,191,36,0.2)]'
                          : 'bg-card/40 border-border/40 hover:border-amber-500/30'
                      }`}
                      style={{
                        borderColor: isSelected ? topic.color : undefined,
                      }}
                    >
                      {/* Check indicator */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 left-2 w-5 h-5 rounded-full bg-amber-400 grid place-items-center"
                        >
                          <Check className="w-3 h-3 text-black" />
                        </motion.div>
                      )}

                      {/* Glow effect when selected */}
                      {isSelected && (
                        <div 
                          className="absolute inset-0 opacity-10 pointer-events-none"
                          style={{ background: `radial-gradient(circle at 50% 0%, ${topic.color}, transparent)` }}
                        />
                      )}

                      <div className="relative">
                        <div className="text-3xl mb-2">{topic.icon}</div>
                        <h3 className={`font-bold text-sm mb-1 ${isSelected ? 'text-foreground' : 'text-foreground'}`}>
                          {topic.label}
                        </h3>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">
                          {topic.description}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-3">
                <Button
                  onClick={handleBack}
                  variant="ghost"
                  size="lg"
                  className="gap-2"
                >
                  <ChevronRight className="w-4 h-4" />
                  السابق
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={selectedTopics.length < MIN_TOPICS}
                  size="lg"
                  className="bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:opacity-90 disabled:opacity-50 gap-2 min-w-[160px]"
                >
                  التالي
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Circles */}
          {currentStep === 'circles' && (
            <motion.div
              key="circles"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4 }}
              className="max-w-4xl w-full"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  انضم إلى <span className="gradient-text">دوائرك</span> الفكرية
                </h2>
                <p className="text-sm text-muted-foreground">
                  اختر دائرة واحدة على الأقل لبدء رحلتك في الحوار
                </p>
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
                  <span className="text-xs text-amber-400 font-mono">
                    {selectedCircles.length} مختارة
                  </span>
                  {selectedCircles.length >= MIN_CIRCLES && (
                    <Check className="w-3 h-3 text-amber-400" />
                  )}
                </div>
              </div>

              {isLoadingCircles ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                </div>
              ) : circles.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>لا توجد دوائر متاحة حالياً</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8 max-h-[50vh] overflow-y-auto pr-2">
                  {circles.map((circle, idx) => {
                    const isSelected = selectedCircles.includes(circle._id);
                    const color = circle.color || '#daa520';
                    return (
                      <motion.button
                        key={circle._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleCircle(circle._id)}
                        className={`relative p-4 rounded-xl border-2 text-right transition-all overflow-hidden ${
                          isSelected
                            ? 'shadow-[0_0_20px_rgba(251,191,36,0.2)]'
                            : 'bg-card/40 border-border/40 hover:border-amber-500/30'
                        }`}
                        style={{
                          borderColor: isSelected ? color : undefined,
                          background: isSelected ? `linear-gradient(135deg, ${color}10, transparent)` : undefined,
                        }}
                      >
                        {/* Check indicator */}
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 left-2 w-5 h-5 rounded-full grid place-items-center"
                            style={{ background: color }}
                          >
                            <Check className="w-3 h-3 text-black" />
                          </motion.div>
                        )}

                        <div className="flex items-start gap-3">
                          <div 
                            className="w-12 h-12 rounded-xl grid place-items-center text-2xl flex-shrink-0"
                            style={{ 
                              background: `${color}15`,
                              border: `1px solid ${color}40`,
                            }}
                          >
                            {circle.icon || '🌐'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              {circle.isPrivate ? (
                                <Lock className="w-3 h-3 text-amber-400" />
                              ) : (
                                <Globe className="w-3 h-3 text-green-400" />
                              )}
                              <h3 className="font-bold text-sm truncate" style={{ color: isSelected ? color : undefined }}>
                                {circle.name}
                              </h3>
                            </div>
                            <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed mb-2">
                              {circle.description || 'لا يوجد وصف'}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                              <span className="inline-flex items-center gap-1">
                                <Users className="w-2.5 h-2.5" />
                                {(circle.members || 0).toLocaleString('ar-EG')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between gap-3">
                <Button
                  onClick={handleBack}
                  variant="ghost"
                  size="lg"
                  className="gap-2"
                  disabled={isJoining}
                >
                  <ChevronRight className="w-4 h-4" />
                  السابق
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={selectedCircles.length < MIN_CIRCLES || isJoining}
                  size="lg"
                  className="bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:opacity-90 disabled:opacity-50 gap-2 min-w-[160px]"
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري الانضمام...
                    </>
                  ) : (
                    <>
                      أكمل الإعداد
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-xl w-full text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 mb-8 shadow-[0_0_60px_rgba(34,197,94,0.4)]"
              >
                <PartyPopper className="w-12 h-12 text-white" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                <span className="gradient-text">رحلتك تبدأ الآن!</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed"
              >
                انضممت إلى <strong className="text-amber-400">{selectedCircles.length}</strong> دائرة 
                <br />
                واخترت <strong className="text-amber-400">{selectedTopics.length}</strong> اهتمامات فكرية
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  onClick={handleStartJourney}
                  size="lg"
                  className="bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:opacity-90 shadow-[0_0_30px_rgba(251,191,36,0.3)] gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  ابدأ الاستكشاف
                </Button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-xs text-muted-foreground mt-6"
              >
                سيتم توجيهك تلقائياً خلال ٣ ثوانٍ...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default OnboardingPage;
