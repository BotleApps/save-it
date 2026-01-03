import shim from './sentry-shim';

export type SentryLike = {
  init?: (opts?: { dsn?: string; enableInExpoDevelopment?: boolean; debug?: boolean } | { dsn?: string } ) => void;
  captureException?: (e: unknown) => void;
  captureMessage?: (m: string) => void;
  setUser?: (u: any) => void;
};

let Sentry: SentryLike = shim;

export function initSentry() {
  const dsn = process.env.SENTRY_DSN || (global as any)?.__SENTRY_DSN;
  if (!dsn) return;

  try {
    // Dynamically require to avoid static dependency during type-check/install
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    // Try several possible package names for compatibility
    const pkg = require('@sentry/expo') || require('@sentry/react-native');
    if (pkg) {
      Sentry = pkg;
      if (typeof Sentry.init === 'function') {
        Sentry.init({ dsn, enableInExpoDevelopment: false, debug: false });
        // eslint-disable-next-line no-console
        console.log('Sentry initialized');
      }
    }
  } catch (e: unknown) {
    // don't crash the app if sentry is not installed or init fails
    // eslint-disable-next-line no-console
    const msg = (e && typeof e === 'object' && 'message' in e)
      ? (e as any).message
      : String(e);
    console.warn('Sentry init skipped or failed:', msg);
    Sentry = shim;
  }
}

export default Sentry;
