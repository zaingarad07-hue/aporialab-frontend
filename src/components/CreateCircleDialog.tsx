import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, X, Plus, Globe, Lock, Layers } from 'lucide-react';
import { api } from '@/services/api';

interface CreateCircleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COLOR_SWATCHES = [
  '#daa520', '#a78bfa', '#22c55e', '#ef4444',
  '#3b82f6', '#f472b6', '#06b6d4', '#f59e0b',
];

const SUGGESTED_ICONS = ['🌐', '📚', '🧠', '⚖️', '🔬', '🎨', '💭', '✨'];

export function CreateCircleDialog({ open, onOpenChange }: CreateCircleDialogProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [icon, setIcon] = useState('🌐');
  const [color, setColor] = useState('#daa520');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setName('');
    setDescription('');
    setIsPrivate(false);
    setIcon('🌐');
    setColor('#daa520');
    setTags([]);
    setTagInput('');
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 10 && trimmed.length <= 30) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter(x => x !== tag));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName.length < 3) {
      toast.warning(t('createCircle.nameTooShort'));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.createCircle({
        name: trimmedName,
        description: description.trim(),
        isPrivate,
        icon,
        color,
        tags,
      });
      if (response.success && response.circle) {
        toast.success(t('createCircle.created'));
        const id = response.circle._id;
        reset();
        onOpenChange(false);
        navigate(`/circles/${id}`);
      } else {
        toast.error(response.message || t('createCircle.failed'));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('createCircle.failed');
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent dir="rtl" className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            {t('createCircle.title')}
          </DialogTitle>
          <DialogDescription>{t('createCircle.subtitle')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Identity preview */}
          <div
            className="flex items-center gap-3 p-3 rounded-xl border"
            style={{ borderColor: `${color}40`, background: `${color}08` }}
          >
            <div
              className="w-12 h-12 rounded-2xl grid place-items-center text-2xl flex-shrink-0"
              style={{ background: `${color}15`, border: `1px solid ${color}30` }}
            >
              {icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate" style={{ color }}>
                {name.trim() || t('createCircle.namePlaceholder')}
              </p>
              <p className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                {isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                {isPrivate ? t('createCircle.private') : t('createCircle.public')}
              </p>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="circleName" className="text-xs">{t('createCircle.nameLabel')}</Label>
              <span className="text-[10px] text-muted-foreground/70">{name.length}/100</span>
            </div>
            <Input
              id="circleName"
              value={name}
              maxLength={100}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('createCircle.namePlaceholder')}
              className="text-right"
              dir="rtl"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="circleDesc" className="text-xs">{t('createCircle.descriptionLabel')}</Label>
              <span className="text-[10px] text-muted-foreground/70">{description.length}/500</span>
            </div>
            <textarea
              id="circleDesc"
              value={description}
              maxLength={500}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('createCircle.descriptionPlaceholder')}
              rows={3}
              dir="rtl"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-right placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label className="text-xs">{t('createCircle.iconLabel')}</Label>
            <div className="flex flex-wrap items-center gap-2">
              {SUGGESTED_ICONS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`w-9 h-9 rounded-lg grid place-items-center text-lg transition-all ${
                    icon === emoji
                      ? 'ring-2 ring-amber-400 bg-amber-500/10'
                      : 'bg-secondary/40 hover:bg-secondary/70'
                  }`}
                >
                  {emoji}
                </button>
              ))}
              <Input
                value={icon}
                maxLength={4}
                onChange={(e) => setIcon(e.target.value)}
                className="w-16 text-center"
                dir="ltr"
              />
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label className="text-xs">{t('createCircle.colorLabel')}</Label>
            <div className="flex flex-wrap items-center gap-2">
              {COLOR_SWATCHES.map(swatch => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => setColor(swatch)}
                  aria-label={swatch}
                  className={`w-7 h-7 rounded-full transition-all ${
                    color === swatch ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground' : ''
                  }`}
                  style={{ background: swatch }}
                />
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="tagInput" className="text-xs">{t('createCircle.tagsLabel')}</Label>
              <span className="text-[10px] text-muted-foreground/70">{tags.length}/10</span>
            </div>
            <div className="flex gap-2">
              <Input
                id="tagInput"
                value={tagInput}
                maxLength={30}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder={t('createCircle.tagsPlaceholder')}
                className="text-right flex-1"
                dir="rtl"
                disabled={tags.length >= 10}
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag} disabled={!tagInput.trim() || tags.length >= 10}>
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1 text-[10px]">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-rose-400">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Privacy */}
          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <div className="min-w-0">
              <Label htmlFor="isPrivate" className="text-xs font-semibold flex items-center gap-1.5">
                {isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                {t('createCircle.privacyLabel')}
              </Label>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {isPrivate ? t('createCircle.privacyHintPrivate') : t('createCircle.privacyHintPublic')}
              </p>
            </div>
            <Switch checked={isPrivate} onCheckedChange={setIsPrivate} aria-label={t('createCircle.privacyLabel')} />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || name.trim().length < 3}
              className="bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:opacity-90 gap-1.5"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {t('createCircle.submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
