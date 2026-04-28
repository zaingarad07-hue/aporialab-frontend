import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Search,
  Plus,
  Users,
  Lock,
  Globe,
  Sparkles,
  Loader2,
  CheckCircle2,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/DashboardLayout';
import { api } from '@/services/api';
import type { Circle } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

type TabFilter = 'all' | 'public' | 'private' | 'mine';

export function CirclesPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'الدوائر الفكرية | AporiaLab';
    fetchCircles();
  }, []);

  const fetchCircles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.getCircles();
      if (response.success) {
        setCircles(response.circles || []);
      } else {
        setError(response.message || 'فشل تحميل الدوائر');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل تحميل الدوائر';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (circle: Circle) => {
    if (!isAuthenticated) {
      toast.error('يجب تسجيل الدخول أولاً');
      navigate('/');
      return;
    }
    
    try {
      setJoiningId(circle._id);
      const response = await api.joinCircle(circle._id);
      
      if (response.status === 'pending') {
        toast.success('تم إرسال طلب الانضمام · سيتم مراجعته قريباً');
      } else if (response.joined === true) {
        toast.success(`انضممت إلى ${circle.name} 🎉`);
      } else if (response.joined === false) {
        toast.success(`غادرت ${circle.name}`);
      }
      
      fetchCircles();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل الانضمام';
      toast.error(msg);
    } finally {
      setJoiningId(null);
    }
  };

  // Filter circles
  const filteredCircles = useMemo(() => {
    let filtered = circles;
    
    // Tab filter
    if (activeTab === 'public') {
      filtered = filtered.filter(c => !c.isPrivate);
    } else if (activeTab === 'private') {
      filtered = filtered.filter(c => c.isPrivate);
    } else if (activeTab === 'mine' && user) {
      const userId = (user._id || user.id) as string;
      filtered = filtered.filter(c => c.memberIds?.includes(userId));
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    
    return filtered;
  }, [circles, activeTab, searchQuery, user]);

  // My circles count
  const myCirclesCount = useMemo(() => {
    if (!user) return 0;
    const userId = (user._id || user.id) as string;
    return circles.filter(c => c.memberIds?.includes(userId)).length;
  }, [circles, user]);

  const isUserMember = (circle: Circle) => {
    if (!user) return false;
    const userId = (user._id || user.id) as string;
    return circle.memberIds?.includes(userId);
  };

  const isUserPending = (circle: Circle) => {
    if (!user) return false;
    const userId = (user._id || user.id) as string;
    return circle.pendingRequests?.some(r => r.userId === userId);
  };

  const getCircleColor = (circle: Circle): string => {
    return circle.color || '#daa520';
  };

  const tabs: { key: TabFilter; label: string; count?: number }[] = [
    { key: 'all', label: 'الكل', count: circles.length },
    { key: 'public', label: 'عامة', count: circles.filter(c => !c.isPrivate).length },
    { key: 'private', label: 'خاصة', count: circles.filter(c => c.isPrivate).length },
    { key: 'mine', label: 'دوائري', count: myCirclesCount },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-medium text-amber-400">المجتمعات</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 gradient-text">الدوائر الفكرية</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            مجتمعات متخصصة حسب الاهتمام · انضم لتشارك في نقاشات أعمق
          </p>
        </motion.div>

        {/* Search + Create */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث في الدوائر..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-card/50 border border-border/50 text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>

          {/* Create (Coming soon) */}
          <Button
            disabled
            className="gap-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black opacity-50 cursor-not-allowed"
            title="قريباً: إنشاء دائرتك الخاصة"
          >
            <Plus className="w-4 h-4" />
            أنشئ دائرتك (قريباً)
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-border/30 pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-secondary/50 text-muted-foreground'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">جاري تحميل الدوائر...</p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchCircles} variant="outline" size="sm">
              إعادة المحاولة
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredCircles.length === 0 && (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6">
              <Users className="w-10 h-10 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {searchQuery ? 'لا نتائج' : activeTab === 'mine' ? 'لم تنضم لأي دائرة بعد' : 'لا توجد دوائر'}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {activeTab === 'mine' 
                ? 'انضم إلى دائرة لتظهر هنا'
                : 'جرّب البحث بكلمات مختلفة أو غيّر الفلتر'
              }
            </p>
          </motion.div>
        )}

        {/* Circles Grid */}
        {!isLoading && filteredCircles.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredCircles.map((circle, index) => {
              const isMember = isUserMember(circle);
              const isPending = isUserPending(circle);
              const color = getCircleColor(circle);
              
              return (
                <motion.div
                  key={circle._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="group relative p-5 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 transition-all hover:shadow-[0_15px_40px_-15px] overflow-hidden cursor-pointer"
                  style={{ 
                    borderColor: `${color}40`,
                  }}
                  onClick={() => {
                    // Future: navigate to circle detail page
                    // navigate(`/circles/${circle._id}`);
                  }}
                >
                  {/* Top accent bar */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-1 transition-opacity group-hover:opacity-100 opacity-60"
                    style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
                  />

                  {/* Glow on hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${color}15 0%, transparent 70%)`,
                    }}
                  />

                  {/* Header: Icon + Privacy badge */}
                  <div className="flex items-start justify-between mb-3 relative">
                    <div 
                      className="w-12 h-12 rounded-2xl grid place-items-center text-2xl flex-shrink-0"
                      style={{ 
                        background: `${color}15`,
                        border: `1px solid ${color}30`,
                      }}
                    >
                      {circle.icon || '🌐'}
                    </div>
                    
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {circle.isPrivate ? (
                        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 gap-1 text-[10px]">
                          <Lock className="w-2.5 h-2.5" />
                          خاصة
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500/10 text-green-400 border-green-500/30 gap-1 text-[10px]">
                          <Globe className="w-2.5 h-2.5" />
                          عامة
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <h3 
                    className="text-base md:text-lg font-bold mb-2 group-hover:text-primary transition-colors relative"
                    style={{ color: 'inherit' }}
                  >
                    {circle.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed relative">
                    {circle.description || 'لا يوجد وصف'}
                  </p>

                  {/* Stats Row */}
                  <div className="flex items-center gap-3 mb-4 text-[11px] text-muted-foreground font-mono relative">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {circle.members || 0} عضو
                    </span>
                    {(circle.discussionCount ?? 0) > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {circle.discussionCount} نقاش
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {circle.tags && circle.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4 relative">
                      {circle.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/40 text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    {isMember ? (
                      <Button
                        onClick={() => handleJoin(circle)}
                        disabled={joiningId === circle._id}
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5 border-green-500/30 bg-green-500/5 text-green-400 hover:bg-green-500/10"
                      >
                        {joiningId === circle._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        عضو · غادر
                      </Button>
                    ) : isPending ? (
                      <Button
                        disabled
                        size="sm"
                        className="w-full gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 cursor-not-allowed"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        طلب قيد المراجعة
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleJoin(circle)}
                        disabled={joiningId === circle._id}
                        size="sm"
                        className="w-full gap-1.5"
                        style={{ 
                          background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                          color: '#000',
                        }}
                      >
                        {joiningId === circle._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : circle.isPrivate ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            طلب الانضمام
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            انضم
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
