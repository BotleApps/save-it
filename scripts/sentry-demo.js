// Demo script: show Sentry init behavior (uses require to match runtime)

const SentryModule = require('../lib/sentry.cjs');

console.log('Starting Sentry demo...');
SentryModule.initSentry && SentryModule.initSentry();

if (SentryModule && typeof SentryModule.captureMessage === 'function') {
  SentryModule.captureMessage('Demo message: Sentry integration check');
}

try {
  throw new Error('Demo exception');
} catch (e) {
  if (SentryModule && typeof SentryModule.captureException === 'function') {
    SentryModule.captureException(e);
  } else {
    console.error('No Sentry capture available:', e);
  }
}

console.log('Sentry demo complete');
