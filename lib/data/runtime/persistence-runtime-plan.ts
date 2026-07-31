/**
 * PI-4.3 — Compose persistence runtime plan from PI-4.1/4.2 + storage engines.
 * Does not open engines or invent schemas.
 */
import type { PersistenceModelRow } from "../foundation/persistence-models";
import type { RepositoryId } from "../foundation/repository-catalogue";
import type { StorageFamilyId } from "../foundation/storage-families";
import {
  resolveRepositoryAccessPlan,
  type RepositoryAccessPlan,
} from "../repositories/repository-access-plan";
import { REPOSITORY_LAYER_ID } from "../repositories/repository.constants";
import { PERSISTENCE_RUNTIME_ID } from "./persistence.constants";
import {
  getRepositoryRuntimeBinding,
  type RepositoryRuntimeBinding,
} from "./repository-runtime-bindings";
import {
  getStorageRuntimeAdapter,
  type PersistenceRuntimeAdapter,
} from "./storage-runtime-bindings";

export type PersistenceRuntimePlan = Readonly<{
  runtimeId: typeof PERSISTENCE_RUNTIME_ID;
  repositoryLayerId: typeof REPOSITORY_LAYER_ID;
  repositoryId: RepositoryId;
  access: RepositoryAccessPlan;
  runtimeBinding: RepositoryRuntimeBinding;
  adapters: readonly PersistenceRuntimeAdapter[];
  primaryAdapter: PersistenceRuntimeAdapter;
  storageFamilies: readonly StorageFamilyId[];
  models: readonly PersistenceModelRow[];
  matchesRepositoryLayer: boolean;
  reusesExistingStorage: boolean;
}>;

/**
 * Bind REPO-* access (PI-4.2) to existing storage runtime adapters (PI-4.3).
 */
export function resolvePersistenceRuntimePlan(
  repositoryId: RepositoryId,
): PersistenceRuntimePlan {
  const access = resolveRepositoryAccessPlan(repositoryId);
  const runtimeBinding = getRepositoryRuntimeBinding(repositoryId);
  if (!runtimeBinding) {
    throw new Error(`Unknown repository runtime binding: ${repositoryId}`);
  }

  const adapters = runtimeBinding.adapterIds.map((id) => {
    const adapter = getStorageRuntimeAdapter(id);
    if (!adapter) {
      throw new Error(`Unknown storage runtime adapter: ${id}`);
    }
    return adapter;
  });

  const primaryAdapter = adapters[0];
  if (!primaryAdapter) {
    throw new Error(`No primary adapter for ${repositoryId}`);
  }

  const storageFamilies = access.catalogue.storageFamilies;
  const matchesRepositoryLayer =
    access.layerId === REPOSITORY_LAYER_ID &&
    access.reusesFoundationModules &&
    access.ownerDomainMatchesBias &&
    storageFamilies.includes(runtimeBinding.primaryStorageFamily) &&
    adapters.every((adapter) =>
      adapter.storageFamilies.some((f) =>
        (storageFamilies as readonly StorageFamilyId[]).includes(f),
      ),
    );

  const reusesExistingStorage = adapters.every((adapter) => {
    if (!adapter.isSourceOfTruth) return adapter.modulePath === null;
    if (!adapter.modulePath) return false;
    return true;
  });

  return {
    runtimeId: PERSISTENCE_RUNTIME_ID,
    repositoryLayerId: REPOSITORY_LAYER_ID,
    repositoryId,
    access,
    runtimeBinding,
    adapters,
    primaryAdapter,
    storageFamilies,
    models: access.models,
    matchesRepositoryLayer,
    reusesExistingStorage,
  };
}
