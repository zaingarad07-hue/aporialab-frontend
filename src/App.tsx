import { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
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
import { CreateDiscussionDialog } from './components/CreateDiscussionDialog';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { AboutPage } from './pages/AboutPage';
import { DiscussionPage } from './pages/DiscussionPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthProvider, useAuth } from './context/AuthContext';
import './i18n/i18n';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function HomePage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.title = t('seo.home.title');
  }, [t]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href && href.startsWith('#') && !href.startsWith('#/')) {
          e.preventDefault();
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

  const handleStartDiscussion = () => {
    if (isAuthenticated) {
      setIsCreateOpen(true);
    } else {
      setIsJoinOpen(true);
    }
  };

  return (
    <>
      <Navbar
        onLoginClick={() => setIsLoginOpen(true)}
        onJoinClick={() => setIsJoinOpen(true)}
      />
      <main>
        <Hero
          onStartDiscussion={handleStartDiscussion}
          onTimedDiscussions={() => document.getElementById('discussions')?.scrollIntoView({ behavior: 'smooth' })}
        />
        <Features />
        <Discussions />
        <Circles />
        <Leaders />
        <Challenge onParticipate={handleStartDiscussion} />
      </main>
      <Footer />

      <LoginDialog open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      <JoinDialog open={isJoinOpen} onOpenChange={setIsJoinOpen} />
      <CreateDiscussionDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
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
            <Route path="/discussion/:id" element={<DiscussionPage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
          </Routes>
        </Router>
      </AuthProvider>
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default App;
