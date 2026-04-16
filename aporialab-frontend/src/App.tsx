import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navbar } from './sections/Navbar';
import { Hero } from './sections/Hero';
import { Features } from './sections/Features';
import { Discussions } from './sections/Discussions';
import { Circles } from './sections/Circles';
import { Leaders } from './sections/Leaders';
import { Challenge } from './sections/Challenge';
import { Footer } from './sections/Footer';
import { LoginDialog } from './components/LoginDialog';
import { JoinDialog } from './components/JoinDialog';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { AboutPage } from './pages/AboutPage';
import { AuthProvider } from './context/AuthContext';
import './i18n/i18n';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

// Home page component
function HomePage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('seo.home.title');
  }, [t]);

  useEffect(() => {
    // Smooth scroll for anchor links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      if (anchor) {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        if (href) {
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  return (
    <>
      <Navbar 
        onLoginClick={() => setIsLoginOpen(true)} 
        onJoinClick={() => setIsJoinOpen(true)} 
      />
      <main>
        <Hero 
          onStartDiscussion={() => setIsJoinOpen(true)}
          onTimedDiscussions={() => document.getElementById('discussions')?.scrollIntoView({ behavior: 'smooth' })}
        />
        <Features />
        <Discussions />
        <Circles />
        <Leaders />
        <Challenge onParticipate={() => setIsJoinOpen(true)} />
      </main>
      <Footer />
      
      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      <JoinDialog open={isJoinOpen} onOpenChange={setIsJoinOpen} />
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
