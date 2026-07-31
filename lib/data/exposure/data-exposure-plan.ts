/**
 * PI-4.4 — Compose data exposure with PI-4.2 repositories + PI-4.3 runtime.
 * Does not open storage engines or invent schemas/APIs.
 */
import type { PersistenceModelRow } from "../foundation/persistence-models";
import type { RepositoryId } from "../foundation/repository-catalogue";
import type { StorageFamilyId } from "../foundation/storage-families";
import { REPOSITORY_LAYER_ID } from "../repositories/repository.constants";
import { PERSISTENCE_RUNTIME_ID } from "../runtime/persistence.constants";
import {
  resolvePersistenceRuntimePlan,
  type PersistenceRuntimePlan,
} from "../runtime/persistence-runtime-plan";
import type { PersistenceRuntimeAdapter } from "../runtime/storage-runtime-bindings";
import { DATA_EXPOSURE_LAYER_ID } from "./exposure.constants";
import {
  exposureSupportsCommand,
  exposureSupportsQuery,
  getDataExposureBinding,
  type DataExposureBinding,
  type DataExposureMode,
} from "./data-exposure-bindings";

export type DataExposurePlan = Readonly<{
  layerId: typeof DATA_EXPOSURE_LAYER_ID;
  repositoryId: RepositoryId;
  binding: DataExposureBinding;
  modes: readonly DataExposureMode[];
  supportsQuery: boolean;
  supportsCommand: boolean;
  runtime: PersistenceRuntimePlan;
  adapters: readonly PersistenceRuntimeAdapter[];
  storageFamilies: readonly StorageFamilyId[];
  models: readonly PersistenceModelRow[];
  matchesRuntime: boolean;
  matchesRepository: boolean;
}>;

/**
 * Bind REPO-* exposure modes to repository access + persistence runtime.
 */
export function resolveDataExposurePlan(
  repositoryId: RepositoryId,
): DataExposurePlan {
  const binding = getDataExposureBinding(repositoryId);
  if (!binding) {
    throw new Error(`Unknown data exposure binding: ${repositoryId}`);
  }

  const runtime = resolvePersistenceRuntimePlan(repositoryId);

  const dataClassAlign = binding.dataClasses.every((dc) =>
    (runtime.access.catalogue.dataClasses as readonly string[]).includes(dc),
  );
  const moduleAlign =
    runtime.access.binding.primaryModule === binding.exposureModule;
  const matchesRepository =
    runtime.repositoryLayerId === REPOSITORY_LAYER_ID &&
    moduleAlign &&
    dataClassAlign &&
    runtime.access.reusesFoundationModules &&
    runtime.access.ownerDomainMatchesBias;

  const matchesRuntime =
    runtime.runtimeId === PERSISTENCE_RUNTIME_ID &&
    runtime.matchesRepositoryLayer &&
    runtime.reusesExistingStorage &&
    runtime.runtimeBinding.primaryStorageFamily ===
      binding.primaryStorageFamily &&
    runtime.storageFamilies.includes(binding.primaryStorageFamily);

  return {
    layerId: DATA_EXPOSURE_LAYER_ID,
    repositoryId,
    binding,
    modes: binding.modes,
    supportsQuery: exposureSupportsQuery(binding.modes),
    supportsCommand: exposureSupportsCommand(binding.modes),
    runtime,
    adapters: runtime.adapters,
    storageFamilies: runtime.storageFamilies,
    models: runtime.models,
    matchesRuntime,
    matchesRepository,
  };
}
