import type {
  GovernanceStoreBackend,
  GovernanceStoreContract,
  GovernanceStoreRuntimeInput,
} from "./store.types";
import { createMemoryGovernanceStoreContract } from "./store.contract";

export function resolveGovernanceStoreContract(input: {
  backend: GovernanceStoreBackend;
}): GovernanceStoreContract {
  // file/db/redis/objectStore backends are reserved for future integration.
  return createMemoryGovernanceStoreContract();
}

export function normalizeStoreRuntimeInput(
  input: GovernanceStoreRuntimeInput,
): Required<GovernanceStoreRuntimeInput> {
  return {
    ...input,
    backend: input.backend ?? "memory",
  };
}
