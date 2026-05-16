import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '@/services/api';
import { toast } from 'sonner';
import { Mail, X } from 'lucide-react';

const DISMISS_KEY = 'emailBannerDismissed';

export function EmailVerificationBanner() {
  const { user, isAuthenticated } = useAuth();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(DISMISS_KEY) === '1';
  });
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const visible = isAuthenticated && !!user && user.emailVerified === false && !dismissed;

  useEffect(() => {
    if (visible) {
      document.documentElement.style.setProperty('--email-banner-h', '2.5rem');
    } else {
      document.documentElement.style.removeProperty('--email-banner-h');
    }
    return () => {
      document.documentElement.style.removeProperty('--email-banner-h');
    };
  }, [visible]);

  if (!visible) {
    return null;
  }

  const handleResend = async () => {
    if (sending || cooldown > 0) return;
    setSending(true);
    try {
      const data = await api.resendVerification();
      toast.success(data.message || 'أرسلنا رسالة جديدة إلى بريدك');
      setCooldown(60);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'تعذّر إرسال الرسالة';
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  return (
    <div
      dir="rtl"
      className="fixed top-0 left-0 right-0 z-[60] bg-amber-500/15 border-b border-amber-500/40 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 text-amber-200 min-w-0">
          <Mail className="h-4 w-4 shrink-0" />
          <span className="truncate">
            وثّق بريدك الإلكتروني لتتمكّن من إنشاء النقاشات والتعليق
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResend}
            disabled={sending || cooldown > 0}
            className="px-3 py-1 rounded-md bg-amber-500/30 hover:bg-amber-500/40 text-amber-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {sending ? 'جاري الإرسال...' : cooldown > 0 ? `إعادة الإرسال (${cooldown})` : 'إعادة الإرسال'}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="إخفاء"
            className="p-1 rounded-md hover:bg-amber-500/20 text-amber-200 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
