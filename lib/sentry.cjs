// CommonJS runtime wrapper for demos when TypeScript is not compiled.
try {
  // Try to require the real package if installed
  const sentryShim = require('./sentry-shim');

  function initSentry() {
    const dsn = process.env.SENTRY_DSN || (global).__SENTRY_DSN;
    if (!dsn) return;
    try {
      const pkg = require('@sentry/expo') || require('@sentry/react-native');
      if (pkg && typeof pkg.init === 'function') {
        pkg.init({ dsn, enableInExpoDevelopment: false, debug: false });
        console.log('Sentry (CJS) initialized');
        module.exports = pkg;
        return;
      }
    } catch (e) {
      console.warn('Sentry (CJS) init failed, using shim');
    }

    module.exports = sentryShim;
    module.exports.init = sentryShim.init;
    module.exports.initSentry = initSentry;
  }

  initSentry();
} catch (err) {
  // Fallback: export the shim
  module.exports = require('./sentry-shim');
}
