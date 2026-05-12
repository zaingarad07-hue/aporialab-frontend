import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  User as UserIcon,
  MapPin,
  Globe,
  FileText,
  Loader2,
  Save,
  X,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const NAME_MAX = 100;
const BIO_MAX = 500;
const LOCATION_MAX = 100;
const WEBSITE_MAX = 200;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 200;

interface FieldErrors {
  name?: string;
  bio?: string;
  location?: string;
  website?: string;
}

interface PasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

function validateWebsite(value: string): string | undefined {
  if (!value) return undefined;
  if (!/^https?:\/\/[^\s]+\.[^\s]+/i.test(value)) {
    return 'الرابط غير صحيح - يجب أن يبدأ بـ http:// أو https://';
  }
  return undefined;
}

export function EditProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwErrors, setPwErrors] = useState<PasswordErrors>({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const canChangePassword = user?.authProvider !== 'google';

  useEffect(() => {
    document.title = 'تعديل الملف الشخصي | AporiaLab';
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setLocation(user.location || '');
      setWebsite(user.website || '');
    }
  }, [user]);

  const validate = (): boolean => {
    const next: FieldErrors = {};
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      next.name = 'الاسم يجب أن يكون حرفين على الأقل';
    } else if (trimmedName.length > NAME_MAX) {
      next.name = 'الاسم طويل جداً';
    }
    if (bio.length > BIO_MAX) {
      next.bio = 'النبذة طويلة جداً';
    }
    if (location.length > LOCATION_MAX) {
      next.location = 'الموقع طويل جداً';
    }
    if (website.length > WEBSITE_MAX) {
      next.website = 'الرابط طويل جداً';
    } else {
      const webErr = validateWebsite(website.trim());
      if (webErr) next.website = webErr;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !user) return;
    setIsSaving(true);
    try {
      const response = await api.updateProfile({
        name: name.trim(),
        bio,
        location: location.trim(),
        website: website.trim(),
      });
      if (response.success && response.user) {
        refreshUser(response.user);
        toast.success('تم حفظ التعديلات');
        navigate(`/profile/${user.id}`);
      } else {
        toast.error(response.message || 'فشل حفظ التعديلات');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل حفظ التعديلات';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) navigate(`/profile/${user.id}`);
    else navigate('/');
  };

  const validatePasswords = (): boolean => {
    const next: PasswordErrors = {};
    if (!currentPassword) {
      next.currentPassword = 'كلمة المرور الحالية مطلوبة';
    }
    if (!newPassword) {
      next.newPassword = 'كلمة المرور الجديدة مطلوبة';
    } else if (newPassword.length < PASSWORD_MIN) {
      next.newPassword = `يجب أن تكون ${PASSWORD_MIN} أحرف على الأقل`;
    } else if (newPassword.length > PASSWORD_MAX) {
      next.newPassword = 'كلمة المرور الجديدة طويلة جداً';
    } else if (currentPassword && newPassword === currentPassword) {
      next.newPassword = 'يجب أن تختلف عن الكلمة الحالية';
    }
    if (!confirmPassword) {
      next.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (newPassword && confirmPassword !== newPassword) {
      next.confirmPassword = 'التأكيد لا يطابق كلمة المرور الجديدة';
    }
    setPwErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswords()) return;
    setIsChangingPassword(true);
    try {
      const response = await api.changePassword(currentPassword, newPassword);
      if (response.success) {
        toast.success(response.message || 'تم تغيير كلمة المرور بنجاح');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPwErrors({});
      } else {
        toast.error(response.message || 'فشل تغيير كلمة المرور');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل تغيير كلمة المرور';
      toast.error(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <div className="mb-6">
        <Link
          to={`/profile/${user.id}`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          العودة إلى الملف الشخصي
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 grid place-items-center">
            <UserIcon className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">تعديل الملف الشخصي</h1>
            <p className="text-xs text-muted-foreground">حدّث معلوماتك الشخصية</p>
          </div>
        </div>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        {/* Basic info */}
        <section className="rounded-xl border border-border bg-card/40 p-5 space-y-5">
          <header className="flex items-center gap-2 pb-2 border-b border-border/60">
            <UserIcon className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold">المعلومات الأساسية</h2>
          </header>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="name" className="text-xs">الاسم</Label>
              <span className="text-[10px] text-muted-foreground/70">{name.length}/{NAME_MAX}</span>
            </div>
            <Input
              id="name"
              value={name}
              maxLength={NAME_MAX}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسمك الكامل"
              className="text-right"
              dir="rtl"
            />
            {errors.name && <p className="text-[11px] text-rose-400">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bio" className="text-xs flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                نبذة عنك
              </Label>
              <span className="text-[10px] text-muted-foreground/70">{bio.length}/{BIO_MAX}</span>
            </div>
            <textarea
              id="bio"
              value={bio}
              maxLength={BIO_MAX}
              onChange={(e) => setBio(e.target.value)}
              placeholder="اكتب نبذة قصيرة عن اهتماماتك ومجالاتك"
              rows={4}
              dir="rtl"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-right placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
            {errors.bio && <p className="text-[11px] text-rose-400">{errors.bio}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="location" className="text-xs flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                الموقع
              </Label>
              <span className="text-[10px] text-muted-foreground/70">{location.length}/{LOCATION_MAX}</span>
            </div>
            <Input
              id="location"
              value={location}
              maxLength={LOCATION_MAX}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="مثال: دبي، الإمارات"
              className="text-right"
              dir="rtl"
            />
            {errors.location && <p className="text-[11px] text-rose-400">{errors.location}</p>}
          </div>
        </section>

        {/* Links */}
        <section className="rounded-xl border border-border bg-card/40 p-5 space-y-5">
          <header className="flex items-center gap-2 pb-2 border-b border-border/60">
            <Globe className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold">الروابط</h2>
          </header>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="website" className="text-xs">الموقع الإلكتروني</Label>
              <span className="text-[10px] text-muted-foreground/70">{website.length}/{WEBSITE_MAX}</span>
            </div>
            <Input
              id="website"
              value={website}
              maxLength={WEBSITE_MAX}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              type="url"
              dir="ltr"
              className="text-left"
            />
            {errors.website && <p className="text-[11px] text-rose-400">{errors.website}</p>}
          </div>
        </section>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={handleCancel} disabled={isSaving} className="gap-1.5">
            <X className="w-4 h-4" />
            إلغاء
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:opacity-90 gap-1.5"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جارٍ الحفظ
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                حفظ التعديلات
              </>
            )}
          </Button>
        </div>
      </motion.form>

      {canChangePassword && (
        <motion.form
          onSubmit={handleChangePassword}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="mt-8"
        >
          <section className="rounded-xl border border-border bg-card/40 p-5 space-y-5">
            <header className="flex items-center gap-2 pb-2 border-b border-border/60">
              <Lock className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold">تغيير كلمة المرور</h2>
            </header>

            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-xs">كلمة المرور الحالية</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  dir="ltr"
                  className="text-left pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(s => !s)}
                  aria-label={showCurrent ? 'إخفاء' : 'إظهار'}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {pwErrors.currentPassword && <p className="text-[11px] text-rose-400">{pwErrors.currentPassword}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-xs">كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  dir="ltr"
                  className="text-left pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(s => !s)}
                  aria-label={showNew ? 'إخفاء' : 'إظهار'}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground/70">{PASSWORD_MIN} أحرف على الأقل</p>
              {pwErrors.newPassword && <p className="text-[11px] text-rose-400">{pwErrors.newPassword}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs">تأكيد كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  dir="ltr"
                  className="text-left pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(s => !s)}
                  aria-label={showConfirm ? 'إخفاء' : 'إظهار'}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {pwErrors.confirmPassword && <p className="text-[11px] text-rose-400">{pwErrors.confirmPassword}</p>}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isChangingPassword}
                className="gap-1.5"
                variant="outline"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جارٍ التغيير
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    تغيير كلمة المرور
                  </>
                )}
              </Button>
            </div>
          </section>
        </motion.form>
      )}
    </div>
  );
}
