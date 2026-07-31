/**
 * PI-4.2 — Resolve repository access plans against PI-4.1 foundation.
 * Does not open storage engines or invent schemas.
 */
import {
  getRepository,
  type RepositoryCatalogueRow,
  type RepositoryId,
} from "../foundation/repository-catalogue";
import {
  modelsForRepository,
  type PersistenceModelRow,
} from "../foundation/persistence-models";
import { REPOSITORY_LAYER_ID } from "./repository.constants";
import {
  getRepositoryAccessBinding,
  type RepositoryAccessBinding,
  type RepositoryAccessCapability,
} from "./repository-access-bindings";
import { domainOwnsRepository } from "./domain-repository-routing";

export type RepositoryAccessPlan = Readonly<{
  layerId: typeof REPOSITORY_LAYER_ID;
  repositoryId: RepositoryId;
  catalogue: RepositoryCatalogueRow;
  binding: RepositoryAccessBinding;
  models: readonly PersistenceModelRow[];
  capabilities: readonly RepositoryAccessCapability[];
  ownerDomainMatchesBias: boolean;
  reusesFoundationModules: boolean;
}>;

/**
 * Bind a REPO-* id to PI-4.1 catalogue + existing access modules + models.
 */
export function resolveRepositoryAccessPlan(
  repositoryId: RepositoryId,
): RepositoryAccessPlan {
  const catalogue = getRepository(repositoryId);
  if (!catalogue) {
    throw new Error(`Unknown repository catalogue row: ${repositoryId}`);
  }

  const binding = getRepositoryAccessBinding(repositoryId);
  if (!binding) {
    throw new Error(`Unknown repository access binding: ${repositoryId}`);
  }

  const models = modelsForRepository(repositoryId);
  const reusesFoundationModules =
    catalogue.existingModulePaths.includes(binding.primaryModule) &&
    binding.supportingModules.every(
      (mod) =>
        catalogue.existingModulePaths.includes(mod) ||
        mod === binding.primaryModule,
    );

  return {
    layerId: REPOSITORY_LAYER_ID,
    repositoryId,
    catalogue,
    binding,
    models,
    capabilities: binding.capabilities,
    ownerDomainMatchesBias: domainOwnsRepository(
      catalogue.ownerDomain,
      repositoryId,
    ),
    reusesFoundationModules,
  };
}

export function planRepositoryRead(repositoryId: RepositoryId): boolean {
  return resolveRepositoryAccessPlan(repositoryId).capabilities.includes(
    "read",
  );
}

export function planRepositoryWrite(repositoryId: RepositoryId): boolean {
  return resolveRepositoryAccessPlan(repositoryId).capabilities.includes(
    "write",
  );
}
