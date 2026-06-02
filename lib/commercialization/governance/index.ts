/**
 * V3.7-H11 Enterprise Access Governance Foundation
 */

export {
  ROLE_CATALOG_DTO_VERSION,
  buildRoleCatalogDto,
  type RoleCatalogDto,
  type RoleCatalogEntry,
  type RoleCategory,
} from "./role-catalog.dto";

export {
  ACCESS_GOVERNANCE_VERSION,
  buildAccessGovernance,
  type AccessGovernance,
  type AccessGovernanceCoverage,
  type EffectiveGovernanceEntry,
} from "./access-governance";

export {
  PERMISSION_LINEAGE_VERSION,
  buildPermissionLineage,
  type PermissionLineage,
  type LineageEntry,
  type InheritedAccessEntry,
} from "./permission-lineage";

export {
  GOVERNANCE_MANIFEST_VERSION,
  GOVERNANCE_VERSION,
  buildGovernanceManifest,
  type GovernanceManifest,
} from "./governance-manifest";

import { memoFoundation } from "../foundation-memo";
import { GOVERNANCE_VERSION } from "./governance-manifest";
import { buildRoleCatalogDto, type RoleCatalogDto } from "./role-catalog.dto";
import { buildAccessGovernance, type AccessGovernance } from "./access-governance";
import { buildPermissionLineage, type PermissionLineage } from "./permission-lineage";
import { buildGovernanceManifest, type GovernanceManifest } from "./governance-manifest";

export const PRODUCTION_GOVERNANCE_VERSION = GOVERNANCE_VERSION;

export type ProductionGovernanceFoundation = {
  version: typeof PRODUCTION_GOVERNANCE_VERSION;
  foundationId: string;
  roleCatalog: RoleCatalogDto;
  governance: AccessGovernance;
  lineage: PermissionLineage;
  manifest: GovernanceManifest;
  summary: string;
};

export function buildProductionGovernanceFoundation(input?: {
  deploymentId?: string;
}): ProductionGovernanceFoundation {
  const deploymentId = input?.deploymentId ?? "governance-foundation";
  return memoFoundation("production-governance-foundation", deploymentId, () => {
    const foundationId = `PGF-V37H11-${deploymentId.slice(0, 8)}`;
    const roleCatalog = buildRoleCatalogDto({ deploymentId });
    const governance = buildAccessGovernance({ deploymentId });
    const lineage = buildPermissionLineage({ deploymentId });
    const manifest = buildGovernanceManifest({ deploymentId });

    return {
      version: PRODUCTION_GOVERNANCE_VERSION,
      foundationId,
      roleCatalog,
      governance,
      lineage,
      manifest,
      summary: `production-governance id=${foundationId} readyForGovernance=${manifest.readyForGovernance} roles=${roleCatalog.entries.length} effective=${governance.effectiveGovernance.length}`,
    };
  });
}
