/**
 * V60 P1 — Growth event store (in-memory, stateless-friendly per instance)
 */

import type { GrowthEventName } from "./funnel/growth.funnel.model";

export type GrowthEventRecord = {
  event: GrowthEventName | string;
  userId?: string;
  organizationId?: string;
  source?: string;
  campaign?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  meta?: Record<string, unknown>;
  timestamp: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __growthEvents: GrowthEventRecord[] | undefined;
  // eslint-disable-next-line no-var
  var __onboardingStates: Map<string, import("./funnel/growth.funnel.model").OnboardingState> | undefined;
}

function getEventStore(): GrowthEventRecord[] {
  globalThis.__growthEvents ||= [];
  return globalThis.__growthEvents;
}

function getOnboardingStore(): Map<string, import("./funnel/growth.funnel.model").OnboardingState> {
  globalThis.__onboardingStates ||= new Map();
  return globalThis.__onboardingStates;
}

export function appendGrowthEvent(event: Omit<GrowthEventRecord, "timestamp"> & { timestamp?: number }) {
  const store = getEventStore();
  store.push({ ...event, timestamp: event.timestamp ?? Date.now() });
  if (store.length > 5000) store.splice(0, store.length - 5000);
}

export function getGrowthEventsSnapshot(): GrowthEventRecord[] {
  return [...getEventStore()];
}

export function saveOnboardingState(state: import("./funnel/growth.funnel.model").OnboardingState): void {
  getOnboardingStore().set(state.userId, state);
}

export function getOnboardingState(userId: string): import("./funnel/growth.funnel.model").OnboardingState | undefined {
  return getOnboardingStore().get(userId);
}

export function clearGrowthStoreForTests(): void {
  globalThis.__growthEvents = [];
  globalThis.__onboardingStates = new Map();
}
