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
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const { t } = useTranslation();
  const { login, loginWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) {
      toast.error('لم يتم استلام بيانات Google');
      return;
    }
    setError('');
    try {
      await loginWithGoogle(credentialResponse.credential);
      toast.success('تم تسجيل الدخول بـ Google', {
        description: 'مرحباً بك في AporiaLab',
      });
      onOpenChange(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'فشل تسجيل الدخول بـ Google';
      setError(errorMsg);
      toast.error('فشل تسجيل الدخول', { description: errorMsg });
    }
  };

  const handleGoogleError = () => {
    toast.error('فشل تسجيل الدخول بـ Google', {
      description: 'تأكد من السماح للموقع بالوصول لحسابك',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      toast.success('تم تسجيل الدخول بنجاح', {
        description: 'مرحباً بعودتك إلى AporiaLab',
      });
      onOpenChange(false);
      setEmail('');
      setPassword('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'فشل تسجيل الدخول';
      setError(errorMsg);
      toast.error('فشل تسجيل الدخول', {
        description: errorMsg,
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
          <DialogTitle className="text-2xl font-bold">{t('auth.login.title')}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {t('auth.login.subtitle')}
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Google Sign-In Button */}
          <div className="flex justify-center w-full">
            <div dir="ltr" className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                size="large"
                width="320"
                text="signin_with"
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
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.login.email')}</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.login.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.login.password')}</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.login.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 pl-10"
                  required
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
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm cursor-pointer">
                  {t('auth.login.rememberMe')}
                </Label>
              </div>
              <button
                type="button"
                className="text-sm text-primary hover:underline"
              >
                {t('auth.login.forgotPassword')}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md text-center">
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? 'جاري تسجيل الدخول...' : t('auth.login.submit')}
            </Button>

            {/* Register Link */}
            <p className="text-center text-sm text-muted-foreground">
              {t('auth.login.noAccount')}{' '}
              <button
                type="button"
                className="text-primary hover:underline font-medium"
                onClick={() => {
                  onOpenChange(false);
                }}
              >
                {t('auth.login.register')}
              </button>
            </p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
