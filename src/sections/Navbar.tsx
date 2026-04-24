import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Menu, X, Sparkles, Globe, User, Search } from 'lucide-react';
import { changeLanguage, getCurrentLanguage } from '../i18n/i18n';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onLoginClick: () => void;
  onJoinClick: () => void;
}

export function Navbar({ onLoginClick, onJoinClick }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
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

  const handleLanguageToggle = () => {
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    changeLanguage(newLang);
    setCurrentLang(newLang);
  };

  const navLinks = isHomePage ? [
    { href: '#hero', label: t('nav.home') },
    { href: '#discussions', label: t('nav.discussions') },
    { href: '#circles', label: t('nav.circles') },
    { href: '#challenge', label: t('nav.timed') },
  ] : [
    { href: '/', label: t('nav.home') },
    { href: '/about', label: t('footer.links.about') },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#') && isHomePage) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      setIsMobileMenuOpen(false);
    }
  };

  const userFirstChar = user?.name ? user.name.charAt(0) : '؟';

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'glass border-b border-border/50'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-background" />
              </div>
              <span className="text-lg font-bold gradient-text">AporiaLab</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              {/* Search Button */}
              <Link
                to="/search"
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="بحث"
                title="بحث"
              >
                <Search className="w-5 h-5" />
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLanguageToggle}
                className="text-muted-foreground hover:text-foreground gap-2"
              >
                <Globe className="w-4 h-4" />
                {currentLang === 'ar' ? 'EN' : 'عربي'}
              </Button>
              
              {isAuthenticated && user ? (
                <div className="flex items-center gap-2">
                  <Link
                    to={`/profile/${user.id}`}
                    className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        userFirstChar
                      )}
                    </div>
                    <span className="text-sm text-foreground">{user.name}</span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-muted-foreground hover:text-foreground"
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
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {t('nav.login')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={onJoinClick}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
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
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          <div className="fixed top-16 left-0 right-0 bottom-0 z-50 bg-background md:hidden overflow-y-auto">
            <div className="p-4 space-y-2">
              {/* Search link in mobile menu */}
              <Link
                to="/search"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                <Search className="w-5 h-5" />
                <span>البحث</span>
              </Link>

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="block px-4 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              
              <button
                onClick={() => {
                  handleLanguageToggle();
                }}
                className="w-full px-4 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors flex items-center gap-3"
              >
                <Globe className="w-5 h-5" />
                {currentLang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
              </button>
              
              <div className="pt-4 mt-4 border-t border-border space-y-2">
                {isAuthenticated && user ? (
                  <>
                    <Link
                      to={`/profile/${user.id}`}
                      className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">عرض الملف الشخصي</p>
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
                      className="w-full bg-primary text-primary-foreground"
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
