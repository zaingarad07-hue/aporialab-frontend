import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  Sparkles, 
  Globe, 
  User, 
  Search,
  Layers,
  Trophy,
  MessageSquare,
  Home,
} from 'lucide-react';
import { changeLanguage, getCurrentLanguage } from '../i18n/i18n';
import { useAuth } from '../context/AuthContext';
import { api } from '@/services/api';

interface NavbarProps {
  onLoginClick: () => void;
  onJoinClick: () => void;
}

export function Navbar({ onLoginClick, onJoinClick }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  const [activeDiscussions, setActiveDiscussions] = useState<number>(0);
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Fetch live stats for indicator
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.getStats();
        if (response.success && response.stats) {
          setActiveDiscussions(response.stats.discussions);
        }
      } catch (err) {
        // Silent fail
      }
    };
    fetchStats();
  }, []);

  const handleLanguageToggle = () => {
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    changeLanguage(newLang);
    setCurrentLang(newLang);
  };

  // Smart navigation: hash-links on home, full pages elsewhere
  const navLinks = isHomePage ? [
    { href: '#hero', label: t('nav.home'), icon: Home, isHash: true },
    { href: '#discussions', label: 'النقاشات', icon: MessageSquare, isHash: true },
    { href: '/circles', label: 'الدوائر', icon: Layers, isHash: false, isNew: true },
    { href: '#leaders', label: 'قادة الفكر', icon: Trophy, isHash: true },
  ] : [
    { href: '/', label: t('nav.home'), icon: Home, isHash: false },
    { href: '/circles', label: 'الدوائر', icon: Layers, isHash: false },
    { href: '/about', label: 'عن المنصة', icon: Sparkles, isHash: false },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, isHash: boolean) => {
    if (isHash && isHomePage) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      setIsMobileMenuOpen(false);
    }
  };

  const userFirstChar = user?.name ? user.name.charAt(0) : '؟';
  const userId = user ? (user._id || user.id) : null;
  const isFounder = user?.isFoundingMember;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'glass border-b border-border/50 backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Live Indicator */}
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 group">
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                >
                  <Sparkles className="w-5 h-5 text-background" />
                </motion.div>
                <span className="text-lg font-bold gradient-text">AporiaLab</span>
              </Link>

              {/* Live indicator (desktop only, on home page) */}
              {isHomePage && activeDiscussions > 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/30"
                >
                  <span className="relative flex w-1.5 h-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-green-500" />
                  </span>
                  <span className="text-[10px] font-medium text-green-400 font-mono">
                    {activeDiscussions} نشط
                  </span>
                </motion.div>
              )}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = !link.isHash && location.pathname === link.href;
                
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={(e) => handleNavClick(e, link.href, link.isHash)}
                    className={`relative flex items-center gap-1.5 px-3 py-2 text-sm transition-all rounded-lg ${
                      isActive 
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                    {link.isNew && (
                      <span className="absolute -top-1 -left-1 px-1 py-0 rounded-full bg-amber-500 text-black text-[8px] font-bold">
                        جديد
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              {/* Search Button */}
              <Link
                to="/search"
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                aria-label="بحث"
                title="بحث"
              >
                <Search className="w-4.5 h-4.5" />
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLanguageToggle}
                className="text-muted-foreground hover:text-foreground gap-1.5 h-8"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="text-xs">{currentLang === 'ar' ? 'EN' : 'عربي'}</span>
              </Button>
              
              {isAuthenticated && user ? (
                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/profile/${userId}`}
                    className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-secondary/50 transition-colors group"
                  >
                    <div className={`relative w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/10 grid place-items-center text-xs font-bold text-amber-400 overflow-hidden ${isFounder ? 'ring-2 ring-amber-400/50' : ''}`}>
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        userFirstChar
                      )}
                      {isFounder && (
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-400 grid place-items-center">
                          <Sparkles className="w-1.5 h-1.5 text-black" />
                        </div>
                      )}
                    </div>
                    <div className="hidden lg:flex flex-col items-start leading-tight">
                      <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{user.name}</span>
                      <span className="text-[9px] text-muted-foreground font-mono">
                        {(user.reputation || 0).toLocaleString()} نقطة
                      </span>
                    </div>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10 text-xs h-8"
                  >
                    {t('nav.logout')}
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLoginClick}
                    className="text-muted-foreground hover:text-foreground text-xs h-8"
                  >
                    {t('nav.login')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={onJoinClick}
                    className="bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:opacity-90 shadow-[0_0_15px_rgba(251,191,36,0.2)] text-xs h-8"
                  >
                    {t('nav.join')}
                  </Button>
                </>
              )}
            </div>

            {/* Mobile: Search + Menu Buttons */}
            <div className="md:hidden flex items-center gap-1">
              <Link
                to="/search"
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="بحث"
              >
                <Search className="w-5 h-5" />
              </Link>
              
              <button
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? t('nav.close') : t('nav.menu')}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          <div className="fixed top-16 left-0 right-0 bottom-0 z-50 bg-background md:hidden overflow-y-auto">
            <div className="p-4 space-y-2">
              {/* Live indicator (mobile menu top) */}
              {activeDiscussions > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 mb-2">
                  <span className="relative flex w-1.5 h-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-green-500" />
                  </span>
                  <span className="text-xs font-medium text-green-400">
                    {activeDiscussions} نقاش نشط الآن
                  </span>
                </div>
              )}

              {/* Search link */}
              <Link
                to="/search"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                <Search className="w-5 h-5" />
                <span>البحث</span>
              </Link>

              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={(e) => handleNavClick(e, link.href, link.isHash)}
                    className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <span className="flex-1">{link.label}</span>
                    {link.isNew && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                        جديد
                      </span>
                    )}
                  </Link>
                );
              })}
              
              <button
                onClick={() => {
                  handleLanguageToggle();
                }}
                className="w-full px-4 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors flex items-center gap-3"
              >
                <Globe className="w-5 h-5 text-muted-foreground" />
                {currentLang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
              </button>
              
              <div className="pt-4 mt-4 border-t border-border space-y-2">
                {isAuthenticated && user ? (
                  <>
                    <Link
                      to={`/profile/${userId}`}
                      className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className={`relative w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/10 grid place-items-center text-sm font-bold text-amber-400 overflow-hidden ${isFounder ? 'ring-2 ring-amber-400/50' : ''}`}>
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                        {isFounder && (
                          <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-400 grid place-items-center">
                            <Sparkles className="w-2 h-2 text-black" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{user.name}</p>
                          {isFounder && (
                            <span className="px-1.5 py-0 rounded-full bg-amber-500/20 text-amber-400 text-[9px] font-bold">
                              مؤسس
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">
                          {(user.reputation || 0).toLocaleString()} نقطة
                        </p>
                      </div>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {t('nav.logout')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        onLoginClick();
                      }}
                    >
                      {t('nav.login')}
                    </Button>
                    <Button
                      className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-black"
                      onClick={() => {
                        onJoinClick();
                      }}
                    >
                      {t('nav.join')}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
