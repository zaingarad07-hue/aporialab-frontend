import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { GoogleLogin } from '@react-oauth/google';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface JoinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JoinDialog({ open, onOpenChange }: JoinDialogProps) {
  const { t } = useTranslation();
  const { register, loginWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) {
      toast.error('لم يتم استلام بيانات Google');
      return;
    }
    setError(null);
    try {
      await loginWithGoogle(credentialResponse.credential);
      toast.success('تم إنشاء حسابك بنجاح! 🎉', {
        description: 'مرحباً بك في AporiaLab',
      });
      onOpenChange(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'فشل التسجيل بـ Google';
      setError(errorMsg);
      toast.error('فشل التسجيل', { description: errorMsg });
    }
  };

  const handleGoogleError = () => {
    toast.error('فشل التسجيل بـ Google', {
      description: 'تأكد من السماح للموقع بالوصول لحسابك',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await register(name, email, password);
      toast.success('تم إنشاء حسابك بنجاح! 🎉', {
        description: `مرحباً بك في AporiaLab يا ${name}`,
      });
      setName('');
      setEmail('');
      setPassword('');
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ أثناء إنشاء الحساب';
      setError(message);
      toast.error('فشل إنشاء الحساب', {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-background" />
          </div>
          <DialogTitle className="text-2xl font-bold">{t('auth.register.title')}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {t('auth.register.subtitle')}
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Google Sign-Up Button */}
          <div className="flex justify-center w-full">
            <div dir="ltr" className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                size="large"
                width="320"
                text="signup_with"
                shape="rectangular"
                locale="ar"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-background text-xs text-muted-foreground">
                أو بالبريد الإلكتروني
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">{t('auth.register.name')}</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder={t('auth.register.namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pr-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.register.email')}</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.register.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.register.password')}</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.register.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 pl-10"
                  required
                  minLength={6}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('auth.register.passwordHint')}
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جارٍ إنشاء الحساب...
                </>
              ) : (
                t('auth.register.submit')
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              {t('auth.register.terms')}{' '}
              <a href="/terms" className="text-primary hover:underline">
                {t('auth.register.termsLink')}
              </a>{' '}
              {t('auth.register.and')}{' '}
              <a href="/privacy" className="text-primary hover:underline">
                {t('auth.register.privacyLink')}
              </a>
            </p>

            <p className="text-center text-sm text-muted-foreground">
              {t('auth.register.hasAccount')}{' '}
              <button
                type="button"
                className="text-primary hover:underline font-medium"
                onClick={() => {
                  onOpenChange(false);
                }}
              >
                {t('auth.register.login')}
              </button>
            </p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
