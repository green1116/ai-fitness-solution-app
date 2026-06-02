import type { GovernanceStoreMemory } from "./store.types";

const memoryStore: GovernanceStoreMemory = {
  snapshots: new Map(),
  checkpoints: new Map(),
  archives: new Map(),
  replay: new Map(),
};

export function getGovernanceMemoryStore(): GovernanceStoreMemory {
  return memoryStore;
}
