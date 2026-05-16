import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../sections/Navbar';
import { Footer } from '../sections/Footer';
import { Sidebar } from '../Sidebar';
import { LoginDialog } from '../components/LoginDialog';
import { JoinDialog } from '../components/JoinDialog';
import { CreateDiscussionDialog } from '../components/CreateDiscussionDialog';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/services/api';
import { Mail, CheckCircle2 } from 'lucide-react';

export function ForgotPasswordPage() {
  const { isAuthenticated } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    document.title = 'استعادة كلمة المرور · AporiaLab';
    window.scrollTo(0, 0);
  }, []);

  const handleCreateClick = () => {
    if (isAuthenticated) setIsCreateOpen(true);
    else setIsJoinOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const data = await api.forgotPassword(email.trim());
      setMessage(data.message || 'إذا كان البريد مسجّلاً ستصلك رسالة');
      setDone(true);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'تعذّر إرسال الطلب');
      setDone(true);
    } finally {
      setSubmitting(false);
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
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-4">
              <Mail className="w-7 h-7 text-amber-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">استعادة كلمة المرور</h1>
            <p className="text-sm text-muted-foreground">
              أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
            </p>
          </div>

          {done ? (
            <div className="p-6 rounded-2xl bg-card/50 border border-border/50 text-center space-y-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-base text-foreground leading-relaxed">{message}</p>
              <Link to="/" className="text-sm text-amber-400 hover:underline inline-block">
                العودة إلى الصفحة الرئيسية
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-card/50 border border-border/50 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  dir="ltr"
                />
              </div>
              <Button type="submit" disabled={submitting || !email.trim()} className="w-full">
                {submitting ? 'جاري الإرسال...' : 'إرسال رابط الاستعادة'}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                تذكّرت كلمة المرور؟{' '}
                <button
                  type="button"
                  className="text-amber-400 hover:underline"
                  onClick={() => setIsLoginOpen(true)}
                >
                  تسجيل الدخول
                </button>
              </div>
            </form>
          )}
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
