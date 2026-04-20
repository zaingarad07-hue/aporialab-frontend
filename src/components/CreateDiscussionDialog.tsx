import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, X, Plus } from 'lucide-react';
import { api } from '@/services/api';

interface CreateDiscussionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateDiscussionDialog({ open, onOpenChange, onSuccess }: CreateDiscussionDialogProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 5) {
      setError('العنوان يجب أن يكون 5 أحرف على الأقل');
      return;
    }
    if (content.trim().length < 10) {
      setError('المحتوى يجب أن يكون 10 أحرف على الأقل');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.createDiscussion({
        title: title.trim(),
        content: content.trim(),
        level,
        tags,
      });

      if (response.success && response.discussion) {
        setTitle('');
        setContent('');
        setLevel('beginner');
        setTags([]);
        setTagInput('');
        onOpenChange(false);
        if (onSuccess) onSuccess();
        navigate(`/discussion/${response.discussion._id}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'فشل إنشاء النقاش';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const levelOptions = [
    { value: 'beginner', label: 'مبتدئ', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { value: 'intermediate', label: 'متوسط', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { value: 'advanced', label: 'متقدم', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-background" />
            </div>
            <DialogTitle className="text-2xl font-bold">ابدأ نقاشاً جديداً</DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            شارك فكرتك واطرح أسئلتك - سنرحب بك في مجتمعنا
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">عنوان النقاش *</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: هل التكنولوجيا تحسن من جودة حياتنا؟"
              maxLength={200}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              {title.length}/200
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">محتوى النقاش *</Label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اشرح فكرتك بالتفصيل، اطرح أسئلة، قدم رأيك..."
              className="w-full min-h-40 p-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
              maxLength={10000}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              {content.length}/10000
            </p>
          </div>

          <div className="space-y-2">
            <Label>مستوى النقاش *</Label>
            <div className="flex gap-2 flex-wrap">
              {levelOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setLevel(opt.value)}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    level === opt.value
                      ? opt.color
                      : 'bg-secondary/30 border-border text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">الوسوم (اختياري - حتى 5)</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="أضف وسماً..."
                maxLength={50}
                disabled={isLoading || tags.length >= 5}
              />
              <Button
                type="button"
                onClick={addTag}
                disabled={isLoading || tags.length >= 5 || !tagInput.trim()}
                variant="outline"
                className="gap-1"
              >
                <Plus className="w-4 h-4" />
                إضافة
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:bg-background/50 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جارٍ النشر...
                </>
              ) : (
                'نشر النقاش'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
