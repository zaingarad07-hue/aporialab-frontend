import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../sections/Navbar';
import { Footer } from '../sections/Footer';
import { Sidebar } from '../Sidebar';
import { LoginDialog } from '../components/LoginDialog';
import { JoinDialog } from '../components/JoinDialog';
import { CreateDiscussionDialog } from '../components/CreateDiscussionDialog';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

type Status = 'loading' | 'success' | 'error';

export function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, refreshUser } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('جاري التحقق من الرابط...');
  const triedRef = useRef(false);

  useEffect(() => {
    document.title = 'توثيق البريد الإلكتروني · AporiaLab';
  }, []);

  useEffect(() => {
    if (triedRef.current) return;
    triedRef.current = true;
    if (!token) {
      setStatus('error');
      setMessage('رابط التوثيق غير صالح');
      return;
    }
    (async () => {
      try {
        const data = await api.verifyEmail(token);
        setStatus('success');
        setMessage(data.message || 'تم توثيق بريدك الإلكتروني');
        if (data.user) refreshUser(data.user);
        setTimeout(() => navigate('/'), 1500);
      } catch (err) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'تعذّر توثيق البريد');
      }
    })();
  }, [token, navigate, refreshUser]);

  const handleCreateClick = () => {
    if (isAuthenticated) setIsCreateOpen(true);
    else setIsJoinOpen(true);
  };

  const handleResend = async () => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }
    try {
      const data = await api.resendVerification();
      setMessage(data.message || 'أرسلنا رسالة جديدة إلى بريدك');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'تعذّر إرسال الرسالة');
    }
  };

  return (
    <>
      <Sidebar onCreateClick={handleCreateClick} />
      <Navbar
        onLoginClick={() => setIsLoginOpen(true)}
        onJoinClick={() => setIsJoinOpen(true)}
      />

      <main className="md:mr-[4.5rem] pt-24 pb-16 min-h-screen" dir="rtl">
        <div className="max-w-md mx-auto px-4">
          <div className="p-8 rounded-2xl bg-card/50 border border-border/50 text-center space-y-4">
            {status === 'loading' && (
              <>
                <Loader2 className="w-12 h-12 text-amber-400 mx-auto animate-spin" />
                <h1 className="text-xl font-bold">{message}</h1>
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h1 className="text-xl font-bold">تم توثيق بريدك الإلكتروني</h1>
                <p className="text-sm text-muted-foreground">{message}</p>
                <p className="text-xs text-muted-foreground">جاري التحويل إلى الصفحة الرئيسية...</p>
              </>
            )}
            {status === 'error' && (
              <>
                <XCircle className="w-12 h-12 text-rose-400 mx-auto" />
                <h1 className="text-xl font-bold">تعذّر توثيق البريد</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
                <div className="flex flex-col gap-2 pt-2">
                  {isAuthenticated ? (
                    <Button onClick={handleResend}>إعادة إرسال رسالة التوثيق</Button>
                  ) : (
                    <Button onClick={() => setIsLoginOpen(true)}>تسجيل الدخول</Button>
                  )}
                  <Link to="/" className="text-sm text-amber-400 hover:underline">
                    العودة إلى الصفحة الرئيسية
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <LoginDialog
        open={isLoginOpen}
        onOpenChange={setIsLoginOpen}
        onSwitchToRegister={() => { setIsLoginOpen(false); setIsJoinOpen(true); }}
      />
      <JoinDialog
        open={isJoinOpen}
        onOpenChange={setIsJoinOpen}
        onSwitchToLogin={() => { setIsJoinOpen(false); setIsLoginOpen(true); }}
      />
      <CreateDiscussionDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </>
  );
}
