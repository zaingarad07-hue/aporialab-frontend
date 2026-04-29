import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  MessageSquare, 
  Layers, 
  Trophy,
  User,
  LogOut,
  Sparkles,
  ChevronLeft,
  Search,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'الرئيسية', icon: Home, path: '/' },
  { label: 'الدوائر', icon: Layers, path: '/circles' },
  { label: 'البحث', icon: Search, path: '/search' },
];

interface SidebarProps {
  onCreateClick?: () => void;
}

export function Sidebar({ onCreateClick }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true); // Default collapsed (icon-only)
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const sidebarWidth = isCollapsed ? '4.5rem' : '15rem';

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarWidth }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden md:flex fixed top-0 right-0 h-screen bg-card/95 backdrop-blur-xl border-l border-border/50 z-40 flex-col"
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/30">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 grid place-items-center text-black font-bold text-sm flex-shrink-0">
              A
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="text-base font-bold gradient-text whitespace-nowrap"
                >
                  AporiaLab
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            title={isCollapsed ? 'توسيع' : 'طي'}
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.div>
          </button>
        </div>

        {/* Create Button */}
        {isAuthenticated && (
          <div className="p-3">
            <button
              onClick={onCreateClick}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-black font-semibold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:shadow-[0_0_30px_rgba(251,191,36,0.4)]"
              title="إنشاء نقاش"
            >
              <PlusCircle className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm whitespace-nowrap"
                  >
                    نقاش جديد
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  active 
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                {/* Active indicator */}
                {active && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-400 rounded-l-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-amber-400' : ''}`} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-2 border-t border-border/30">
          {isAuthenticated && user ? (
            <Link
              to={`/profile/${user._id || user.id}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/50 transition-colors group"
              title={isCollapsed ? user.name : ''}
            >
              <div className={`relative w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/10 grid place-items-center text-sm font-bold text-amber-400 overflow-hidden flex-shrink-0 ${user.isFoundingMember ? 'ring-2 ring-amber-400/50' : ''}`}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
                {user.isFoundingMember && (
                  <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-400 grid place-items-center">
                    <Sparkles className="w-2 h-2 text-black" />
                  </div>
                )}
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{(user.reputation || 0).toLocaleString()} نقطة</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
          ) : (
            <div className="px-3 py-2 text-center">
              <Link to="/" className="text-xs text-amber-400 hover:underline">
                {isCollapsed ? '👤' : 'سجّل الدخول'}
              </Link>
            </div>
          )}

          {isAuthenticated && (
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title={isCollapsed ? 'خروج' : ''}
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs whitespace-nowrap"
                  >
                    تسجيل الخروج
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )}
        </div>
      </motion.aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/50 z-40">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.slice(0, 4).map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                  active ? 'text-amber-400' : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px]">{item.label}</span>
              </Link>
            );
          })}
          
          {isAuthenticated && user ? (
            <Link
              to={`/profile/${user._id || user.id}`}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg ${
                location.pathname.startsWith('/profile') ? 'text-amber-400' : 'text-muted-foreground'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/10 grid place-items-center text-[10px] font-bold text-amber-400 overflow-hidden ${user.isFoundingMember ? 'ring-1 ring-amber-400/50' : ''}`}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <span className="text-[9px]">حسابي</span>
            </Link>
          ) : (
            <Link to="/" className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-muted-foreground">
              <User className="w-5 h-5" />
              <span className="text-[9px]">دخول</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
