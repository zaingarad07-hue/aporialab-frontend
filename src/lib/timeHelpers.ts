import type { TFunction } from 'i18next';

export function timeAgo(t: TFunction, dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return t('time.now');
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t('time.minutesAgo', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('time.hoursAgo', { count: hours });
  const days = Math.floor(hours / 24);
  if (days < 30) return t('time.daysAgo', { count: days });
  const months = Math.floor(days / 30);
  if (months < 12) return t('time.monthsAgo', { count: months });
  return t('time.yearsAgo', { count: Math.floor(months / 12) });
}

export function timeRemaining(t: TFunction, expiresAt: string): string {
  const expires = new Date(expiresAt);
  const now = new Date();
  const seconds = Math.floor((expires.getTime() - now.getTime()) / 1000);

  if (seconds <= 0) return t('time.expired');
  const hours = Math.floor(seconds / 3600);
  if (hours < 24) return t('time.hoursRemaining', { count: hours });
  const days = Math.floor(hours / 24);
  return t('time.daysRemaining', { count: days });
}

export function timeRemainingShort(t: TFunction, expiresAt: string): string {
  const expires = new Date(expiresAt);
  const now = new Date();
  const totalMinutes = Math.floor((expires.getTime() - now.getTime()) / 60000);

  if (totalMinutes <= 0) return t('time.expired');
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return t('time.shortDays', { days, hours });
  if (hours > 0) return t('time.shortHours', { hours, minutes });
  return t('time.shortMinutes', { minutes });
}
