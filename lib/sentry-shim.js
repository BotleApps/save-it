// Minimal runtime shim for Sentry — usable from plain Node for demos.
module.exports = {
  init: function (_opts) {
    console.log('sentry-shim: init called with', _opts ? '[redacted opts]' : 'no opts');
  },
  captureException: function (err) {
    console.warn('sentry-shim captureException:', err);
  },
  captureMessage: function (msg) {
    console.warn('sentry-shim captureMessage:', msg);
  },
  setUser: function (user) {
    // no-op
  }
};
