import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight,
  Users,
  Lock,
  Globe,
  Loader2,
  AlertCircle,
  Sparkles,
  Calendar,
  MessageCircle,
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  Info,
} from 'lucide-react';
import { api } from '@/services/api';
import type { Circle } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/Sidebar';
import { Navbar } from '@/sections/Navbar';
import { LoginDialog } from '@/components/LoginDialog';
import { JoinDialog } from '@/components/JoinDialog';
import { CreateDiscussionDialog } from '@/components/CreateDiscussionDialog';
import { Footer } from '@/sections/Footer';
import { toast } from 'sonner';

type Tab = 'discussions' | 'members' | 'about';

interface CircleMember {
  _id: string;
  id?: string;
  name: string;
  avatar?: string;
  reputation?: number;
  isFoundingMember?: boolean;
}

// Helper: time ago in Arabic
function timeAgo(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'الآن';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `قبل ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `قبل ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `قبل ${days} يوم`;
  const months = Math.floor(days / 30);
  if (months < 12) return `قبل ${months} شهر`;
  return `قبل ${Math.floor(months / 12)} سنة`;
}

function CircleDetailContent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [circle, setCircle] = useState<Circle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('discussions');
  const [isJoining, setIsJoining] = useState(false);
  const [joinStatus, setJoinStatus] = useState<'none' | 'joined' | 'pending'>('none');
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  const currentUserId = user?._id || user?.id;
  
  // Fetch circle details
  const fetchCircle = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.getCircle(id);
      if (response.success && response.circle) {
        const c = response.circle;
        setCircle(c);
        
        // Determine join status
        if (currentUserId) {
          if (c.memberIds?.includes(currentUserId)) {
            setJoinStatus('joined');
          } else if (c.pendingRequests?.some(r => r.userId === currentUserId)) {
            setJoinStatus('pending');
          } else {
            setJoinStatus('none');
          }
        }
        
        document.title = `${c.name} · AporiaLab`;
      } else {
        setError(response.message || 'لم يتم العثور على الدائرة');
      }
    } catch (err) {
      console.error('Failed to fetch circle:', err);
      const msg = err instanceof Error ? err.message : 'فشل تحميل الدائرة';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCircle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, currentUserId]);

  // Handle join action
  const handleJoin = async () => {
    if (!isAuthenticated) {
      setIsJoinOpen(true);
      return;
    }
    
    if (!circle) return;
    
    try {
      setIsJoining(true);
      const response = await api.joinCircle(circle._id);
      
      if (response.success) {
        if (response.status === 'pending') {
          setJoinStatus('pending');
          toast.success('تم إرسال طلب الانضمام', {
            description: 'سيتم إخطارك عند الموافقة',
          });
        } else if (response.status === 'joined') {
          setJoinStatus('joined');
          toast.success('انضممت إلى الدائرة بنجاح! 🎉');
          // Update member count
          setCircle(prev => prev ? { ...prev, members: response.members ?? prev.members + 1 } : prev);
        } else if (response.status === 'left') {
          setJoinStatus('none');
          toast.info('غادرت الدائرة');
          setCircle(prev => prev ? { ...prev, members: response.members ?? Math.max(0, prev.members - 1) } : prev);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشلت العملية';
      toast.error(msg);
    } finally {
      setIsJoining(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
          <p className="text-sm text-muted-foreground">جاري تحميل الدائرة...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !circle) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/10 grid place-items-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              {error || 'لم يتم العثور على الدائرة'}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              قد تكون الدائرة محذوفة أو الرابط غير صحيح
            </p>
            <Button onClick={() => navigate('/circles')} variant="outline" size="sm">
              العودة للدوائر
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  const color = circle.color || '#daa520';
  const isOwner = circle.createdBy?._id === currentUserId;
  const memberCount = circle.members || 0;
  const discussionCount = circle.discussionCount || 0;

  return (
    <div className="min-h-screen pt-20">
      {/* Back button */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <Link
          to="/circles"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-amber-400 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للدوائر
        </Link>
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-8"
      >
        <div 
          className="relative rounded-2xl border overflow-hidden"
          style={{
            borderColor: `${color}40`,
            background: `linear-gradient(135deg, ${color}10 0%, transparent 100%)`,
          }}
        >
          {/* Top accent bar */}
          <div 
            className="absolute top-0 left-0 right-0 h-1"
            style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
          />
          
          {/* Glow effect */}
          <div 
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 0%, ${color}20 0%, transparent 60%)`,
            }}
          />

          <div className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl grid place-items-center text-5xl md:text-6xl flex-shrink-0 mx-auto md:mx-0"
                style={{ 
                  background: `${color}15`,
                  border: `2px solid ${color}40`,
                }}
              >
                {circle.icon || '🌐'}
              </motion.div>

              {/* Info */}
              <div className="flex-1 text-center md:text-right">
                {/* Privacy badge */}
                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                  {circle.isPrivate ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs">
                      <Lock className="w-3 h-3" />
                      خاصة
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/30 text-xs">
                      <Globe className="w-3 h-3" />
                      عامة
                    </span>
                  )}
                  
                  {circle.category && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-secondary/40 text-muted-foreground">
                      {circle.category}
                    </span>
                  )}
                </div>

                {/* Name */}
                <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color }}>
                  {circle.name}
                </h1>

                {/* Description */}
                {circle.description && (
                  <p className="text-sm md:text-base text-muted-foreground mb-4 leading-relaxed">
                    {circle.description}
                  </p>
                )}

                {/* Tags */}
                {circle.tags && circle.tags.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 mb-4">
                    {circle.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-secondary/40 text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats row */}
                <div className="flex items-center justify-center md:justify-start gap-4 text-xs text-muted-foreground font-mono mb-5">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <strong className="text-foreground">{memberCount.toLocaleString('ar-EG')}</strong>
                    عضو
                  </span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <strong className="text-foreground">{discussionCount.toLocaleString('ar-EG')}</strong>
                    نقاش
                  </span>
                  {circle.createdAt && (
                    <>
                      <span className="text-muted-foreground/40">·</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {timeAgo(circle.createdAt)}
                      </span>
                    </>
                  )}
                </div>

                {/* Join button */}
                {!isOwner && (
                  <div className="flex justify-center md:justify-start">
                    {joinStatus === 'joined' ? (
                      <Button
                        onClick={handleJoin}
                        disabled={isJoining}
                        variant="outline"
                        size="lg"
                        className="gap-2 border-green-500/40 text-green-400 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400 transition-all"
                      >
                        {isJoining ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4" />
                            <span className="group-hover:hidden">عضو في الدائرة</span>
                          </>
                        )}
                      </Button>
                    ) : joinStatus === 'pending' ? (
                      <Button
                        disabled
                        variant="outline"
                        size="lg"
                        className="gap-2 border-amber-500/40 text-amber-400"
                      >
                        <Clock className="w-4 h-4" />
                        طلبك قيد المراجعة
                      </Button>
                    ) : (
                      <Button
                        onClick={handleJoin}
                        disabled={isJoining}
                        size="lg"
                        className="gap-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:opacity-90 shadow-[0_0_20px_rgba(251,191,36,0.25)]"
                      >
                        {isJoining ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            {circle.isPrivate ? 'طلب الانضمام' : 'انضم للدائرة'}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}

                {isOwner && (
                  <div className="flex justify-center md:justify-start">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium">
                      <Sparkles className="w-3 h-3" />
                      أنت منشئ هذه الدائرة
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-card/40 border border-border/40 backdrop-blur-sm w-fit mx-auto md:mx-0">
          <TabButton 
            active={activeTab === 'discussions'} 
            onClick={() => setActiveTab('discussions')}
            icon={MessageCircle}
            label="النقاشات"
            count={discussionCount}
          />
          <TabButton 
            active={activeTab === 'members'} 
            onClick={() => setActiveTab('members')}
            icon={Users}
            label="الأعضاء"
            count={memberCount}
          />
          <TabButton 
            active={activeTab === 'about'} 
            onClick={() => setActiveTab('about')}
            icon={Info}
            label="عن الدائرة"
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'discussions' && (
            <motion.div
              key="discussions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <EmptyTabState
                icon={MessageCircle}
                title="لا توجد نقاشات بعد"
                description="كن أول من يبدأ نقاشاً في هذه الدائرة"
                actionLabel="ابدأ نقاش"
                onAction={() => navigate('/discussions')}
              />
            </motion.div>
          )}

          {activeTab === 'members' && (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {memberCount === 0 ? (
                <EmptyTabState
                  icon={Users}
                  title="لا يوجد أعضاء بعد"
                  description="كن أول من ينضم لهذه الدائرة!"
                />
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 mb-4">
                    <Users className="w-8 h-8 text-amber-400" />
                  </div>
                  <p className="text-2xl font-bold text-foreground font-mono mb-1">
                    {memberCount.toLocaleString('ar-EG')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    عضو في هذه الدائرة
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-4">
                    قائمة الأعضاء التفصيلية ستتوفر قريباً
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Description */}
              <div className="p-5 rounded-xl bg-card/40 border border-border/40">
                <h3 className="text-sm font-bold text-amber-400 mb-2">الوصف</h3>
                <p className="text-sm text-foreground leading-relaxed">
                  {circle.description || 'لا يوجد وصف لهذه الدائرة بعد.'}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatCard label="الأعضاء" value={memberCount} icon={Users} />
                <StatCard label="النقاشات" value={discussionCount} icon={MessageCircle} />
                <StatCard 
                  label="النوع" 
                  value={circle.isPrivate ? 'خاصة' : 'عامة'} 
                  icon={circle.isPrivate ? Lock : Globe} 
                  isText
                />
              </div>

              {/* Creator info */}
              {circle.createdBy && (
                <div className="p-5 rounded-xl bg-card/40 border border-border/40">
                  <h3 className="text-sm font-bold text-amber-400 mb-3">المنشئ</h3>
                  <Link
                    to={`/profile/${circle.createdBy._id}`}
                    className="inline-flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/10 grid place-items-center text-sm font-bold text-amber-400">
                      {circle.createdBy.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground group-hover:text-amber-400 transition-colors">
                        {circle.createdBy.name}
                      </p>
                      {circle.createdAt && (
                        <p className="text-[10px] text-muted-foreground">
                          أنشأ الدائرة {timeAgo(circle.createdAt)}
                        </p>
                      )}
                    </div>
                  </Link>
                </div>
              )}

              {/* Tags */}
              {circle.tags && circle.tags.length > 0 && (
                <div className="p-5 rounded-xl bg-card/40 border border-border/40">
                  <h3 className="text-sm font-bold text-amber-400 mb-3">الوسوم</h3>
                  <div className="flex flex-wrap gap-2">
                    {circle.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-2.5 py-1 rounded-full bg-secondary/40 text-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <JoinDialog open={isJoinOpen} onOpenChange={setIsJoinOpen} />
    </div>
  );
}

// Tab Button Component
function TabButton({ 
  active, 
  onClick, 
  icon: Icon, 
  label, 
  count 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ElementType; 
  label: string; 
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative inline-flex items-center gap-2 px-3 md:px-4 h-9 rounded-lg text-xs md:text-sm font-medium transition-all ${
        active 
          ? 'bg-amber-500/10 text-amber-400'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
      {count !== undefined && (
        <span className={`text-[10px] font-mono px-1.5 rounded-full ${
          active ? 'bg-amber-500/20' : 'bg-secondary/40'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

// Empty Tab State
function EmptyTabState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  actionLabel?: string; 
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-amber-500/10 grid place-items-center mb-4">
        <Icon className="w-8 h-8 text-amber-400" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-xs">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" size="sm" className="gap-2">
          <UserPlus className="w-3.5 h-3.5" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

// Stat Card
function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  isText = false 
}: { 
  label: string; 
  value: number | string; 
  icon: React.ElementType; 
  isText?: boolean;
}) {
  return (
    <div className="p-4 rounded-xl bg-card/40 border border-border/40 text-center">
      <Icon className="w-5 h-5 text-amber-400 mx-auto mb-1" />
      <p className={`text-xl font-bold text-foreground ${isText ? '' : 'font-mono'}`}>
        {typeof value === 'number' ? value.toLocaleString('ar-EG') : value}
      </p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

// Wrapper with Sidebar + Navbar
export function CircleDetailPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleCreateClick = () => {
    if (isAuthenticated) {
      setIsCreateOpen(true);
    } else {
      setIsJoinOpen(true);
    }
  };

  return (
    <>
      <Sidebar onCreateClick={handleCreateClick} />
      
      <Navbar
        onLoginClick={() => setIsLoginOpen(true)}
        onJoinClick={() => setIsJoinOpen(true)}
      />
      
      <main className="md:mr-[4.5rem] pb-20 md:pb-0">
        <CircleDetailContent />
      </main>
      
      <Footer />

      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      <JoinDialog open={isJoinOpen} onOpenChange={setIsJoinOpen} />
      <CreateDiscussionDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </>
  );
}

export default CircleDetailPage;
