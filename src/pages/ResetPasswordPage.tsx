import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
import { toast } from 'sonner';
import { KeyRound } from 'lucide-react';

export function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'إعادة تعيين كلمة المرور · AporiaLab';
    window.scrollTo(0, 0);
  }, []);

  const handleCreateClick = () => {
    if (isAuthenticated) setIsCreateOpen(true);
    else setIsJoinOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    if (newPassword.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    if (newPassword !== confirm) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }
    if (!token) {
      setError('الرابط غير صالح');
      return;
    }
    setSubmitting(true);
    try {
      const data = await api.resetPassword(token, newPassword);
      toast.success(data.message || 'تم تحديث كلمة المرور');
      navigate('/');
      setTimeout(() => setIsLoginOpen(true), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر تحديث كلمة المرور');
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
              <KeyRound className="w-7 h-7 text-amber-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">إعادة تعيين كلمة المرور</h1>
            <p className="text-sm text-muted-foreground">اختر كلمة مرور جديدة لحسابك.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-card/50 border border-border/50 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">تأكيد كلمة المرور</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                maxLength={200}
              />
            </div>
            {error && (
              <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-md px-3 py-2 leading-relaxed">
                {error}
                {error.includes('انتهت') || error.includes('غير صالح') ? (
                  <>
                    {' '}
                    <Link to="/forgot-password" className="text-amber-400 hover:underline">
                      اطلب رابطاً جديداً
                    </Link>
                  </>
                ) : null}
              </div>
            )}
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'جاري الحفظ...' : 'حفظ كلمة المرور الجديدة'}
            </Button>
          </form>
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
