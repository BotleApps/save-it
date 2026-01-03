import initSentry, { initSentry as _init } from '../lib/sentry';

// This file is a compile-time smoke test for the Sentry initializer.
// It purposely calls the exported functions to ensure types resolve.

function runSmoke() {
  // call init (no DSN provided in local env)
  _init();

  // import default export and call optional methods if present
  const sentry: any = initSentry as any;
  if (sentry && typeof sentry.captureMessage === 'function') {
    sentry.captureMessage('smoke-test');
  }
}

runSmoke();
