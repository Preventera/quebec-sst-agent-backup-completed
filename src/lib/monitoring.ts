// src/lib/monitoring.ts
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// Configuration Sentry pour production uniquement
if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      new BrowserTracing(),
    ],
    tracesSampleRate: 0.1,
    environment: import.meta.env.MODE,
    
    beforeSend(event) {
      // Filtrer les erreurs non critiques
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (error?.value?.includes('ResizeObserver loop limit exceeded')) {
          return null;
        }
      }
      return event;
    },
  });
}

// Fonction pour capturer les erreurs
export const captureError = (error: Error, context?: any) => {
  console.error('Erreur capturée:', error);
  Sentry.captureException(error, {
    extra: context,
    tags: {
      component: context?.component || 'unknown',
      action: context?.action || 'unknown'
    }
  });
};

// Métriques SST custom
export const trackSSTPlatformUsage = (action: string, metadata: object = {}) => {
  Sentry.addBreadcrumb({
    message: `SST Action: ${action}`,
    category: 'sst.platform',
    data: metadata,
    level: 'info'
  });
};