type AnalyticsEvent = {
  event: string;
  planId?: string;
  planLevel?: string;
  mode?: string;
  timestamp?: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __analyticsEvents: AnalyticsEvent[] | undefined;
}

function getStore() {
  globalThis.__analyticsEvents ||= [];
  return globalThis.__analyticsEvents;
}

export function appendAnalyticsEvent(event: AnalyticsEvent) {
  const store = getStore();
  store.push({
    ...event,
    timestamp: event.timestamp ?? Date.now(),
  });

  if (store.length > 1000) {
    store.splice(0, store.length - 1000);
  }
}

export function getAnalyticsEventsSnapshot() {
  return [...getStore()];
}
