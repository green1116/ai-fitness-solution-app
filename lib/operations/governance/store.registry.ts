import type { GovernanceStoreRegistry } from "./store.types";

export function buildGovernanceStoreRegistry(): GovernanceStoreRegistry {
  return {
    defaultBackend: "memory",
    availableBackends: ["memory", "file", "db", "redis", "objectStore"],
  };
}
