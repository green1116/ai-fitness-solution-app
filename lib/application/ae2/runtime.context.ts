/**
 * AE-2 — Declarative runtime context derived from AE-1 assembly.
 * No business evaluation — identity / surface refs only.
 */
import {
  AE1_ASSEMBLY_ID,
  AE1_BASE_FREEZE_REF,
  AE1_PIG_REF,
  AE1_PRODUCT_DEFINITION_REF,
} from "../ae1/application.definition";
import { resolveApplicationManifest } from "../ae1/application.manifest";
import {
  AE1_DOMAIN_IDS,
  AE1_PACKAGE_IDS,
  AE1_SURFACE_IDS,
  type Ae1DomainId,
  type Ae1PackageId,
  type Ae1SurfaceId,
} from "../ae1/application.registry";

const AE2_RUNTIME_ID_REF = "application-runtime-ae2-v1" as const;
const AE2_BASE_FREEZE_REF_LOCAL = "ae-1-application-assembly-v1" as const;

export type ApplicationRuntimeContext = Readonly<{
  runtimeId: typeof AE2_RUNTIME_ID_REF;
  assemblyId: typeof AE1_ASSEMBLY_ID;
  baseFreezeRef: typeof AE2_BASE_FREEZE_REF_LOCAL;
  assemblyBaseFreezeRef: typeof AE1_BASE_FREEZE_REF;
  productDefinitionRef: typeof AE1_PRODUCT_DEFINITION_REF;
  pigRef: typeof AE1_PIG_REF;
  surfaceIds: readonly Ae1SurfaceId[];
  packageIds: readonly Ae1PackageId[];
  domainIds: readonly Ae1DomainId[];
  matchesAssembly: boolean;
}>;

/**
 * Resolve runtime context from AE-1 manifest — composition reuse only.
 */
export function resolveApplicationRuntimeContext(): ApplicationRuntimeContext {
  const manifest = resolveApplicationManifest();

  const matchesAssembly =
    manifest.assemblyId === AE1_ASSEMBLY_ID &&
    manifest.matchesRegistry &&
    manifest.compositionOnly &&
    manifest.surfaces.length === AE1_SURFACE_IDS.length &&
    manifest.packages.length === AE1_PACKAGE_IDS.length &&
    manifest.domains.join(",") === AE1_DOMAIN_IDS.join(",");

  return {
    runtimeId: AE2_RUNTIME_ID_REF,
    assemblyId: AE1_ASSEMBLY_ID,
    baseFreezeRef: AE2_BASE_FREEZE_REF_LOCAL,
    assemblyBaseFreezeRef: AE1_BASE_FREEZE_REF,
    productDefinitionRef: AE1_PRODUCT_DEFINITION_REF,
    pigRef: AE1_PIG_REF,
    surfaceIds: AE1_SURFACE_IDS,
    packageIds: AE1_PACKAGE_IDS,
    domainIds: AE1_DOMAIN_IDS,
    matchesAssembly,
  };
}
