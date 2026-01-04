interface MinimalSyncManager {
  register(tag: string): Promise<void>;
}

interface MinimalServiceWorkerRegistration {
  scope: string;
  updating: ServiceWorker | null;
  installing: ServiceWorker | null;
  active: ServiceWorker | null;
  sync?: MinimalSyncManager;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  postMessage(message: any): void;
}

declare var ServiceWorkerRegistration: {
  prototype: MinimalServiceWorkerRegistration;
};

declare var ServiceWorker: {
  prototype: ServiceWorker;
};

declare interface Window {
  navigator: any;
}

// Minimal MessageEvent for service worker messages
declare interface MessageEvent<T = any> {
  readonly data: T;
  readonly origin?: string;
  readonly lastEventId?: string;
}