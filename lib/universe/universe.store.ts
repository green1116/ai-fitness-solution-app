/**
 * V65 — SaaS instance registry (in-memory universe store)
 */

import type { SaaSInstance } from "./universe.types";

declare global {
  // eslint-disable-next-line no-var
  var __saasUniverseInstances: SaaSInstance[] | undefined;
}

function getStore(): SaaSInstance[] {
  globalThis.__saasUniverseInstances ||= [];
  return globalThis.__saasUniverseInstances;
}

export function registerSaaSInstance(instance: SaaSInstance): SaaSInstance {
  const store = getStore();
  const idx = store.findIndex((i) => i.id === instance.id);
  if (idx >= 0) store[idx] = instance;
  else store.push(instance);
  return instance;
}

export function getSaaSInstancesSnapshot(): SaaSInstance[] {
  return [...getStore()];
}

export function getSaaSInstanceById(id: string): SaaSInstance | undefined {
  return getStore().find((i) => i.id === id);
}

export function clearUniverseStoreForTests(): void {
  globalThis.__saasUniverseInstances = [];
}

export function countInstancesByIndustry(industry: string): number {
  return getStore().filter((i) => i.industry === industry).length;
}
