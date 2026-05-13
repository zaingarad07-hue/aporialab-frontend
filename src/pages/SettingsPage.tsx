import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Settings,
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
  Bell,
  Languages,
  AtSign,
  Check as CheckIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { api } from '@/services/api';
import type { NotificationPreferences, NotificationType } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { changeLanguage } from '@/i18n/i18n';

const NAME_MAX = 100;
const BIO_MAX = 500;
const LOCATION_MAX = 100;
const WEBSITE_MAX = 200;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 200;

const NOTIFICATION_TYPES: NotificationType[] = [
  'comment',
  'reply',
  'discussion_upvote',
  'comment_upvote',
  'reaction_logical',
  'reaction_inspiring',
  'circle_join_request',
  'circle_approved',
  'circle_rejected',
];

const TAB_VALUES = ['profile', 'password', 'notifications', 'language'] as const;
type TabValue = typeof TAB_VALUES[number];

function isTabValue(v: string | null): v is TabValue {
  return v === 'profile' || v === 'password' || v === 'notifications' || v === 'language';
}

const DEFAULT_PREFS: NotificationPreferences = {
  comment: true,
  reply: true,
  discussion_upvote: true,
  comment_upvote: true,
  reaction_logical: true,
  reaction_inspiring: true,
  circle_join_request: true,
  circle_approved: true,
  circle_rejected: true,
};

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

function isValidWebsite(value: string): boolean {
  if (!value) return true;
  return /^https?:\/\/[^\s]+\.[^\s]+/i.test(value);
}

export function SettingsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();

  const canChangePassword = user?.authProvider !== 'google';

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameReason, setUsernameReason] = useState<string>('');
  const [isSavingUsername, setIsSavingUsername] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwErrors, setPwErrors] = useState<PasswordErrors>({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS);
  const [savingPref, setSavingPref] = useState<NotificationType | null>(null);

  useEffect(() => {
    document.title = `${t('settings.title')} | AporiaLab`;
  }, [t]);

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
      setUsername(user.username || '');
      setUsernameStatus('idle');
      setUsernameReason('');
    }
  }, [user]);

  useEffect(() => {
    const trimmed = username.trim().toLowerCase();
    if (!trimmed || trimmed === (user?.username || '')) {
      setUsernameStatus('idle');
      setUsernameReason('');
      return;
    }
    if (!/^[a-z0-9_]{3,30}$/.test(trimmed)) {
      setUsernameStatus('invalid');
      setUsernameReason(t('settings.username.invalidShape'));
      return;
    }
    setUsernameStatus('checking');
    setUsernameReason('');
    const handle = setTimeout(async () => {
      try {
        const result = await api.checkUsername(trimmed);
        if (result.success && result.available) {
          setUsernameStatus('available');
          setUsernameReason('');
        } else {
          setUsernameStatus('taken');
          setUsernameReason(result.reason || t('settings.username.updateFailed'));
        }
      } catch {
        setUsernameStatus('idle');
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [username, user?.username, t]);

  const handleSaveUsername = useCallback(async () => {
    const trimmed = username.trim().toLowerCase();
    if (!trimmed || trimmed === user?.username) return;
    if (usernameStatus !== 'available') return;
    setIsSavingUsername(true);
    try {
      const result = await api.updateUsername(trimmed);
      if (result.success && result.user) {
        refreshUser(result.user);
        toast.success(t('settings.username.updated'));
      } else {
        toast.error(result.message || t('settings.username.updateFailed'));
      }
    } catch {
      toast.error(t('common.networkError'));
    } finally {
      setIsSavingUsername(false);
    }
  }, [username, user?.username, usernameStatus, refreshUser, t]);

  useEffect(() => {
    if (user?.notificationPreferences) {
      setPrefs({ ...DEFAULT_PREFS, ...user.notificationPreferences });
    }
  }, [user?.notificationPreferences]);

  const rawTab = searchParams.get('tab');
  const requestedTab: TabValue = isTabValue(rawTab) ? rawTab : 'profile';
  const activeTab: TabValue =
    requestedTab === 'password' && !canChangePassword ? 'profile' : requestedTab;

  useEffect(() => {
    if (!isTabValue(rawTab)) {
      setSearchParams({ tab: 'profile' }, { replace: true });
    } else if (rawTab === 'password' && !canChangePassword) {
      setSearchParams({ tab: 'profile' }, { replace: true });
    }
  }, [rawTab, canChangePassword, setSearchParams]);

  const handleTabChange = useCallback((value: string) => {
    if (isTabValue(value)) {
      setSearchParams({ tab: value }, { replace: true });
    }
  }, [setSearchParams]);

  const validateProfile = (): boolean => {
    const next: FieldErrors = {};
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      next.name = t('settings.profile.nameTooShort');
    } else if (trimmedName.length > NAME_MAX) {
      next.name = t('settings.profile.nameTooLong');
    }
    if (bio.length > BIO_MAX) {
      next.bio = t('settings.profile.nameTooLong');
    }
    if (location.length > LOCATION_MAX) {
      next.location = t('settings.profile.nameTooLong');
    }
    if (website.length > WEBSITE_MAX) {
      next.website = t('settings.profile.websiteInvalid');
    } else if (!isValidWebsite(website.trim())) {
      next.website = t('settings.profile.websiteInvalid');
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfile() || !user) return;
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
        toast.success(t('settings.profile.saved'));
      } else {
        toast.error(response.message || t('settings.profile.saveFailed'));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('settings.profile.saveFailed');
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelProfile = () => {
    if (user) navigate(`/profile/${user.id}`);
    else navigate('/');
  };

  const validatePasswords = (): boolean => {
    const next: PasswordErrors = {};
    if (!currentPassword) {
      next.currentPassword = t('settings.password.currentRequired');
    }
    if (!newPassword) {
      next.newPassword = t('settings.password.newTooShort');
    } else if (newPassword.length < PASSWORD_MIN) {
      next.newPassword = t('settings.password.newTooShort');
    } else if (newPassword.length > PASSWORD_MAX) {
      next.newPassword = t('settings.password.newTooLong');
    } else if (currentPassword && newPassword === currentPassword) {
      next.newPassword = t('settings.password.newSameAsCurrent');
    }
    if (!confirmPassword) {
      next.confirmPassword = t('settings.password.confirmMismatch');
    } else if (newPassword && confirmPassword !== newPassword) {
      next.confirmPassword = t('settings.password.confirmMismatch');
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
        toast.success(response.message || t('settings.password.updated'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPwErrors({});
      } else {
        toast.error(response.message || t('settings.password.updateFailed'));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('settings.password.updateFailed');
      toast.error(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleTogglePref = async (type: NotificationType, nextValue: boolean) => {
    const previous = prefs[type];
    setPrefs(p => ({ ...p, [type]: nextValue }));
    setSavingPref(type);
    try {
      const response = await api.updateNotificationPreferences({ [type]: nextValue });
      if (response.success && response.user) {
        refreshUser(response.user);
        toast.success(t('settings.notificationsPrefs.saved'));
      } else {
        setPrefs(p => ({ ...p, [type]: previous }));
        toast.error(response.message || t('settings.notificationsPrefs.saveFailed'));
      }
    } catch (err) {
      setPrefs(p => ({ ...p, [type]: previous }));
      const msg = err instanceof Error ? err.message : t('settings.notificationsPrefs.saveFailed');
      toast.error(msg);
    } finally {
      setSavingPref(null);
    }
  };

  const handleLanguage = (lng: 'ar' | 'en') => {
    if (i18n.language === lng) return;
    changeLanguage(lng);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 grid place-items-center">
          <Settings className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{t('settings.title')}</h1>
          <p className="text-xs text-muted-foreground">{t('settings.subtitle')}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} dir="rtl">
        <TabsList className="w-full justify-start overflow-x-auto mb-4">
          <TabsTrigger value="profile" className="gap-1.5 text-xs">
            <UserIcon className="w-3.5 h-3.5" />
            {t('settings.tabs.profile')}
          </TabsTrigger>
          {canChangePassword && (
            <TabsTrigger value="password" className="gap-1.5 text-xs">
              <Lock className="w-3.5 h-3.5" />
              {t('settings.tabs.password')}
            </TabsTrigger>
          )}
          <TabsTrigger value="notifications" className="gap-1.5 text-xs">
            <Bell className="w-3.5 h-3.5" />
            {t('settings.tabs.notifications')}
          </TabsTrigger>
          <TabsTrigger value="language" className="gap-1.5 text-xs">
            <Languages className="w-3.5 h-3.5" />
            {t('settings.tabs.language')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <motion.form
            onSubmit={handleSubmitProfile}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <section className="rounded-xl border border-border bg-card/40 p-5 space-y-4">
              <header className="flex items-center gap-2 pb-2 border-b border-border/60">
                <AtSign className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-semibold">{t('settings.username.title')}</h2>
              </header>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {t('settings.username.urlPreview')}{' '}
                <code className="px-1 py-0.5 rounded bg-muted text-foreground">
                  /profile/{username.trim().toLowerCase() || (user?.username || '...')}
                </code>
              </p>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground text-sm pointer-events-none">@</span>
                    <Input
                      id="username"
                      value={username}
                      maxLength={30}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                      placeholder={t('settings.username.placeholder')}
                      className="text-left pr-8"
                      dir="ltr"
                      autoComplete="username"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSaveUsername}
                    disabled={
                      isSavingUsername ||
                      usernameStatus !== 'available' ||
                      username.trim().toLowerCase() === (user?.username || '')
                    }
                  >
                    {isSavingUsername ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span className="text-xs">{t('settings.username.save')}</span>
                  </Button>
                </div>

                {usernameStatus === 'checking' && (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t('settings.username.checking')}
                  </p>
                )}
                {usernameStatus === 'available' && (
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                    <CheckIcon className="w-3 h-3" />
                    {t('settings.username.available')}
                  </p>
                )}
                {usernameStatus === 'taken' && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1.5">
                    <X className="w-3 h-3" />
                    {usernameReason}
                  </p>
                )}
                {usernameStatus === 'invalid' && (
                  <p className="text-[11px] text-amber-400 flex items-center gap-1.5">
                    <X className="w-3 h-3" />
                    {usernameReason}
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card/40 p-5 space-y-5">
              <header className="flex items-center gap-2 pb-2 border-b border-border/60">
                <UserIcon className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-semibold">{t('settings.profile.section')}</h2>
              </header>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="name" className="text-xs">{t('settings.profile.name')}</Label>
                  <span className="text-[10px] text-muted-foreground/70">{name.length}/{NAME_MAX}</span>
                </div>
                <Input
                  id="name"
                  value={name}
                  maxLength={NAME_MAX}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('settings.profile.namePlaceholder')}
                  className="text-right"
                  dir="rtl"
                />
                {errors.name && <p className="text-[11px] text-rose-400">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bio" className="text-xs flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    {t('settings.profile.bio')}
                  </Label>
                  <span className="text-[10px] text-muted-foreground/70">{bio.length}/{BIO_MAX}</span>
                </div>
                <textarea
                  id="bio"
                  value={bio}
                  maxLength={BIO_MAX}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t('settings.profile.bioPlaceholder')}
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
                    {t('settings.profile.location')}
                  </Label>
                  <span className="text-[10px] text-muted-foreground/70">{location.length}/{LOCATION_MAX}</span>
                </div>
                <Input
                  id="location"
                  value={location}
                  maxLength={LOCATION_MAX}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t('footer.location')}
                  className="text-right"
                  dir="rtl"
                />
                {errors.location && <p className="text-[11px] text-rose-400">{errors.location}</p>}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card/40 p-5 space-y-5">
              <header className="flex items-center gap-2 pb-2 border-b border-border/60">
                <Globe className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-semibold">الروابط</h2>
              </header>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="website" className="text-xs">{t('settings.profile.website')}</Label>
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
              <Button type="button" variant="ghost" onClick={handleCancelProfile} disabled={isSaving} className="gap-1.5">
                <X className="w-4 h-4" />
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:opacity-90 gap-1.5"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {t('settings.profile.save')}
                  </>
                )}
              </Button>
            </div>
          </motion.form>
        </TabsContent>

        {canChangePassword && (
          <TabsContent value="password">
            <motion.form
              onSubmit={handleChangePassword}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <section className="rounded-xl border border-border bg-card/40 p-5 space-y-5">
                <header className="flex items-center gap-2 pb-2 border-b border-border/60">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm font-semibold">{t('settings.password.section')}</h2>
                </header>

                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-xs">{t('settings.password.current')}</Label>
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
                      aria-label={showCurrent ? t('settings.password.hide') : t('settings.password.show')}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {pwErrors.currentPassword && <p className="text-[11px] text-rose-400">{pwErrors.currentPassword}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-xs">{t('settings.password.new')}</Label>
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
                      aria-label={showNew ? t('settings.password.hide') : t('settings.password.show')}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground/70">{t('settings.password.minHint', { count: PASSWORD_MIN })}</p>
                  {pwErrors.newPassword && <p className="text-[11px] text-rose-400">{pwErrors.newPassword}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs">{t('settings.password.confirm')}</Label>
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
                      aria-label={showConfirm ? t('settings.password.hide') : t('settings.password.show')}
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
                        {t('common.loading')}
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        {t('settings.password.save')}
                      </>
                    )}
                  </Button>
                </div>
              </section>
            </motion.form>
          </TabsContent>
        )}

        <TabsContent value="notifications">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <section className="rounded-xl border border-border bg-card/40 p-5 space-y-4">
              <header className="flex items-center gap-2 pb-2 border-b border-border/60">
                <Bell className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-semibold">{t('settings.notificationsPrefs.section')}</h2>
              </header>

              <ul className="divide-y divide-border/60">
                {NOTIFICATION_TYPES.map(type => {
                  const label = t(`settings.notificationsPrefs.${type}.label`);
                  return (
                    <li key={type} className="flex items-start justify-between gap-3 py-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold">{label}</div>
                        <div className="text-[11px] text-muted-foreground/80 mt-0.5">{t(`settings.notificationsPrefs.${type}.hint`)}</div>
                      </div>
                      <Switch
                        checked={prefs[type]}
                        onCheckedChange={(v) => handleTogglePref(type, v)}
                        disabled={savingPref === type}
                        aria-label={label}
                      />
                    </li>
                  );
                })}
              </ul>
            </section>
          </motion.div>
        </TabsContent>

        <TabsContent value="language">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <section className="rounded-xl border border-border bg-card/40 p-5 space-y-4">
              <header className="flex items-center gap-2 pb-2 border-b border-border/60">
                <Languages className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-semibold">{t('settings.language.section')}</h2>
              </header>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={i18n.language === 'ar' ? 'default' : 'outline'}
                  onClick={() => handleLanguage('ar')}
                  className="text-xs"
                >
                  {t('settings.language.arabic')}
                </Button>
                <Button
                  type="button"
                  variant={i18n.language === 'en' ? 'default' : 'outline'}
                  onClick={() => handleLanguage('en')}
                  className="text-xs"
                >
                  {t('settings.language.english')}
                </Button>
              </div>

              <p className="text-[11px] text-muted-foreground/80">
                {t('settings.language.note')}
              </p>
            </section>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
