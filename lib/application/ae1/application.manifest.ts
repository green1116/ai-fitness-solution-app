/**
 * AE-1 — Resolve immutable application assembly manifest from registries.
 * Composition only — does not invoke FE/BE/Data/Integration/Delivery/Implementation/Closure.
 */
import {
  APPLICATION_DEFINITION,
  AE1_ASSEMBLY_ID,
  AE1_BASE_FREEZE_REF,
  type ApplicationDefinition,
} from "./application.definition";
import {
  APPLICATION_CONTRACT,
  type ApplicationContract,
} from "./application.contract";
import {
  resolveApplicationComposition,
  type ApplicationComposition,
} from "./application.composition";
import {
  APPLICATION_METADATA,
  type ApplicationMetadata,
} from "./application.metadata";
import {
  AE1_DOMAIN_IDS,
  AE1_PACKAGE_REGISTRY,
  AE1_SURFACE_REGISTRY,
  type Ae1DomainId,
  type Ae1PackageRef,
  type Ae1SurfaceRef,
} from "./application.registry";

export type ApplicationManifest = Readonly<{
  assemblyId: typeof AE1_ASSEMBLY_ID;
  baseFreezeRef: typeof AE1_BASE_FREEZE_REF;
  definition: ApplicationDefinition;
  metadata: ApplicationMetadata;
  contract: ApplicationContract;
  composition: ApplicationComposition;
  surfaces: readonly Ae1SurfaceRef[];
  packages: readonly Ae1PackageRef[];
  domains: readonly Ae1DomainId[];
  matchesRegistry: boolean;
  compositionOnly: boolean;
}>;

/**
 * Build the AE-1 assembly manifest from definition + registry + composition.
 */
export function resolveApplicationManifest(): ApplicationManifest {
  const composition = resolveApplicationComposition();

  const matchesRegistry =
    composition.registryAligned &&
    composition.slots.length === AE1_SURFACE_REGISTRY.length &&
    composition.surfaceIds.length === AE1_SURFACE_REGISTRY.length &&
    composition.packageIds.length === AE1_PACKAGE_REGISTRY.length &&
    composition.domainIds.join(",") === AE1_DOMAIN_IDS.join(",") &&
    APPLICATION_METADATA.baseFreezeRef === AE1_BASE_FREEZE_REF &&
    APPLICATION_DEFINITION.baseFreezeRef === AE1_BASE_FREEZE_REF;

  const compositionOnly =
    APPLICATION_METADATA.kind === "assembly" &&
    APPLICATION_METADATA.hasBusinessLogic === false &&
    APPLICATION_METADATA.hasRuntime === false &&
    APPLICATION_METADATA.hasWorkflow === false &&
    APPLICATION_METADATA.hasDeployment === false;

  return {
    assemblyId: AE1_ASSEMBLY_ID,
    baseFreezeRef: AE1_BASE_FREEZE_REF,
    definition: APPLICATION_DEFINITION,
    metadata: APPLICATION_METADATA,
    contract: APPLICATION_CONTRACT,
    composition,
    surfaces: AE1_SURFACE_REGISTRY,
    packages: AE1_PACKAGE_REGISTRY,
    domains: AE1_DOMAIN_IDS,
    matchesRegistry,
    compositionOnly,
  };
}
