import * as Sentry from '@sentry/react';

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    console.warn('Sentry DSN not configured, skipping initialization');
    return;
  }

  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    environment: import.meta.env.MODE,
    release: 'aporialab-frontend@1.0.0',
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Non-Error promise rejection captured',
      'NetworkError',
      'Failed to fetch',
    ],
    beforeSend(event) {
      if (event.request?.data) {
        const data = event.request.data as Record<string, unknown>;
        if (typeof data === 'object' && data !== null) {
          if ('password' in data) delete data.password;
          if ('token' in data) delete data.token;
        }
      }
      return event;
    },
  });
}

export function captureError(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, { extra: context });
}

export function setSentryUser(user: { id: string; email?: string } | null) {
  if (user) {
    Sentry.setUser({ id: user.id, email: user.email });
  } else {
    Sentry.setUser(null);
  }
}
