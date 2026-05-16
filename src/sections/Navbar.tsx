import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sparkles,
  Globe,
  Search,
  Layers,
  Trophy,
  MessageSquare,
  Home,
  User as UserIcon,
  Settings,
  LogOut,
} from 'lucide-react';
import { changeLanguage, getCurrentLanguage } from '../i18n/i18n';
import { useAuth } from '../context/AuthContext';
import { api } from '@/services/api';
import { NotificationsBell } from '@/components/NotificationsBell';

interface NavbarProps {
  onLoginClick: () => void;
  onJoinClick: () => void;
}

export function Navbar({ onLoginClick, onJoinClick }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
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

  const navLinks = isHomePage ? [
    { href: '#hero', label: t('nav.home'), icon: Home, isHash: true },
    { href: '#discussions', label: t('nav.discussions'), icon: MessageSquare, isHash: true },
    { href: '/circles', label: t('nav.circles'), icon: Layers, isHash: false, isNew: true },
    { href: '#leaders', label: t('nav.leaders'), icon: Trophy, isHash: true },
  ] : [
    { href: '/', label: t('nav.home'), icon: Home, isHash: false },
    { href: '/circles', label: t('nav.circles'), icon: Layers, isHash: false },
    { href: '/about', label: t('nav.about'), icon: Sparkles, isHash: false },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, isHash: boolean) => {
    if (isHash && isHomePage) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const userFirstChar = user?.name ? user.name.charAt(0) : '?';
  const userId = user ? (user.username || user._id || user.id) : null;
  const isFounder = user?.isFoundingMember;

  return (
    <nav
      style={{ top: 'var(--email-banner-h, 0px)' }}
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'glass border-b border-border/50 backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-1 md:gap-2">
          {/* Logo + Live Indicator */}
          <div className="flex items-center gap-1.5 md:gap-4 flex-shrink-0 min-w-0">
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.3)] flex-shrink-0"
              >
                <Sparkles className="w-5 h-5 text-background" />
              </motion.div>
              <span className="text-sm sm:text-base md:text-lg font-bold gradient-text whitespace-nowrap">AporiaLab</span>
            </Link>

            {isHomePage && activeDiscussions > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/30 flex-shrink-0"
              >
                <span className="relative flex w-1.5 h-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-green-500" />
                </span>
                <span className="text-[10px] font-medium text-green-400 font-mono whitespace-nowrap">
                  {activeDiscussions} {t('common.active')}
                </span>
              </motion.div>
            )}
          </div>

          {/* Desktop Navigation - hidden on mobile */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = !link.isHash && location.pathname === link.href;
              
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={(e) => handleNavClick(e, link.href, link.isHash)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 text-sm transition-all rounded-lg whitespace-nowrap ${
                    isActive 
                      ? 'text-amber-400 bg-amber-500/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{link.label}</span>
                  {link.isNew && (
                    <span className="px-1.5 py-0 rounded-full bg-amber-500 text-black text-[8px] font-bold">
                      {t('common.new')}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
            <Link
              to="/search"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              aria-label={t('common.search')}
              title={t('common.search')}
            >
              <Search className="w-4 h-4 md:w-5 md:h-5" />
            </Link>

            {isAuthenticated && <NotificationsBell />}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLanguageToggle}
              className="hidden md:flex text-muted-foreground hover:text-foreground gap-1.5 h-8 px-2"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="text-xs">{currentLang === 'ar' ? 'EN' : t('nav.languageAr')}</span>
            </Button>
            
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label={t('nav.accountMenu')}
                    className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-secondary/50 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className={`relative w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/10 grid place-items-center text-xs font-bold text-amber-400 overflow-hidden flex-shrink-0 ${isFounder ? 'ring-2 ring-amber-400/50' : ''}`}>
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
                    <span className="hidden lg:inline text-xs font-semibold text-foreground group-hover:text-primary transition-colors max-w-[100px] truncate">
                      {user.name}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8} className="w-56">
                  <DropdownMenuLabel className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold truncate">{user.name}</span>
                    <span className="text-[10px] text-muted-foreground truncate">{user.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={`/profile/${userId}`} className="cursor-pointer gap-2">
                      <UserIcon className="w-4 h-4" />
                      {t('nav.profile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer gap-2">
                      <Settings className="w-4 h-4" />
                      {t('nav.settings')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer gap-2 text-rose-400 focus:text-rose-300 focus:bg-rose-500/10"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLoginClick}
                  className="hidden sm:flex text-muted-foreground hover:text-foreground text-xs h-8 px-2 md:px-3"
                >
                  {t('nav.login')}
                </Button>
                <Button
                  size="sm"
                  onClick={onJoinClick}
                  className="bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:opacity-90 shadow-[0_0_15px_rgba(251,191,36,0.2)] text-xs h-8 px-3"
                >
                  {t('nav.join')}
                </Button>
              </>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}
