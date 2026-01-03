// Global ambient types to reduce cross-platform type-check noise
// This file provides minimal declarations for globals used only on web or in tests.

declare const window: any;
declare const navigator: any;
declare const ServiceWorkerRegistration: any;
declare const URLSearchParams: any;

declare namespace NodeJS {
  interface Global {
    jest?: any;
  }
}

// Test globals
declare const describe: any;
declare const it: any;
declare const expect: any;
declare const beforeEach: any;
declare const jest: any;
