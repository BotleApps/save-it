// Minimal local shim for Sentry-like API used when @sentry packages are unavailable.
// This allows the app to call Sentry APIs without hard dependency during dev or CI.
export function init(_: { dsn?: string; enableInExpoDevelopment?: boolean; debug?: boolean } | { dsn?: string } | undefined) {
  // No-op
}

export function captureException(err: unknown) {
  // eslint-disable-next-line no-console
  console.warn('Sentry shim captureException:', err);
}

export function captureMessage(msg: string) {
  // eslint-disable-next-line no-console
  console.warn('Sentry shim captureMessage:', msg);
}

export function setUser(user: any) {
  // No-op store
}

const shim = {
  init,
  captureException,
  captureMessage,
  setUser,
};

export default shim;
