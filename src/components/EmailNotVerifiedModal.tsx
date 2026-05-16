import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export function EmailNotVerifiedModal() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('email-not-verified', handler);
    return () => window.removeEventListener('email-not-verified', handler);
  }, []);

  const handleResend = async () => {
    if (!isAuthenticated) {
      navigate('/');
      setOpen(false);
      return;
    }
    setSending(true);
    try {
      const data = await api.resendVerification();
      toast.success(data.message || 'أرسلنا رسالة جديدة إلى بريدك');
      setOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'تعذّر إرسال الرسالة';
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-300">
            <Mail className="h-6 w-6" />
          </div>
          <DialogTitle className="text-xl">يجب توثيق بريدك الإلكتروني</DialogTitle>
          <DialogDescription className="text-base">
            للمشاركة في النقاشات والتعليق، يرجى توثيق بريدك الإلكتروني عبر الرابط المرسل إليك.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>إغلاق</Button>
          <Button onClick={handleResend} disabled={sending}>
            {sending ? 'جاري الإرسال...' : 'إعادة إرسال رسالة التوثيق'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
