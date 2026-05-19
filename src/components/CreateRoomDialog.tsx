import { useEffect, useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CalendarClock, Mic } from 'lucide-react';
import { api } from '@/services/api';

interface CreateRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discussionId: string;
  onCreated?: () => void;
}

function defaultScheduledAt(): string {
  // Default to 1 hour from now, rounded to the next 5 minutes
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5);
  d.setSeconds(0);
  d.setMilliseconds(0);
  // Format as YYYY-MM-DDTHH:mm for <input type="datetime-local">
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function CreateRoomDialog({ open, onOpenChange, discussionId, onCreated }: CreateRoomDialogProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState(defaultScheduledAt());
  const [maxParticipants, setMaxParticipants] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle('');
      setDescription('');
      setScheduledAt(defaultScheduledAt());
      setMaxParticipants(50);
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3) {
      toast.error(t('rooms.errors.titleRequired'));
      return;
    }
    if (!scheduledAt) {
      toast.error(t('rooms.errors.dateRequired'));
      return;
    }
    const when = new Date(scheduledAt);
    if (isNaN(when.getTime()) || when.getTime() < Date.now()) {
      toast.error(t('rooms.errors.datePast'));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.scheduleRoom(discussionId, {
        title: title.trim(),
        description: description.trim(),
        scheduledAt: when.toISOString(),
        maxParticipants,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = response as any;
      if (response.success && (r.room || r.data?.room)) {
        const room = r.room || r.data.room;
        toast.success(t('rooms.scheduled'));
        onOpenChange(false);
        onCreated?.();
        navigate(`/rooms/${room._id}`);
      } else {
        toast.error(response.message || t('rooms.errors.saveFailed'));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('rooms.errors.saveFailed');
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-amber-400" />
            {t('rooms.createTitle')}
          </DialogTitle>
          <DialogDescription>{t('rooms.createSubtitle')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="room-title">{t('rooms.fieldTitle')}</Label>
            <Input
              id="room-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t('rooms.fieldTitlePlaceholder')}
              maxLength={200}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="room-description">{t('rooms.fieldDescription')}</Label>
            <Textarea
              id="room-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t('rooms.fieldDescriptionPlaceholder')}
              maxLength={2000}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="room-when" className="flex items-center gap-1.5">
                <CalendarClock className="w-3.5 h-3.5" />
                {t('rooms.fieldScheduledAt')}
              </Label>
              <Input
                id="room-when"
                type="datetime-local"
                value={scheduledAt}
                onChange={e => setScheduledAt(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="room-max">{t('rooms.fieldMaxParticipants')}</Label>
              <Input
                id="room-max"
                type="number"
                min={2}
                max={500}
                value={maxParticipants}
                onChange={e => setMaxParticipants(Math.max(2, Math.min(500, parseInt(e.target.value) || 50)))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? t('rooms.submitting') : t('rooms.submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
