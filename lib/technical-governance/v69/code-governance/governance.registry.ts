/**
 * V69 P3 — Code governance registry / index (read-only)
 */
import { CODE_GOVERNANCE_OBJECT_CATALOG } from "./code.object.catalog";
import { CODE_POLICY_CATALOG } from "./code.policy.catalog";
import { DIRECTORY_BOUNDARY_CATALOG } from "./directory.boundary.catalog";
import { FILE_OWNERSHIP_CATALOG } from "./file.ownership.catalog";
import type { CodeGovernanceRegistry } from "./governance.types";
import { V69_CODE_GOVERNANCE_VERSION } from "./governance.types";
import { IMPORT_ALLOWANCE_CATALOG } from "./import.allowance.catalog";

export const CODE_GOVERNANCE_REGISTRY_INDEX = {
  objects: CODE_GOVERNANCE_OBJECT_CATALOG.map((o) => o.id),
  policies: CODE_POLICY_CATALOG.map((p) => p.id),
  boundaries: DIRECTORY_BOUNDARY_CATALOG.map((b) => b.id),
  ownerships: FILE_OWNERSHIP_CATALOG.map((o) => o.id),
  allowances: IMPORT_ALLOWANCE_CATALOG.map((a) => a.id),
} as const;

export function buildCodeGovernanceRegistry(): CodeGovernanceRegistry {
  const objectIds = CODE_GOVERNANCE_REGISTRY_INDEX.objects;
  const policyIds = CODE_GOVERNANCE_REGISTRY_INDEX.policies;
  const boundaryIds = CODE_GOVERNANCE_REGISTRY_INDEX.boundaries;
  const ownershipIds = CODE_GOVERNANCE_REGISTRY_INDEX.ownerships;
  const allowanceIds = CODE_GOVERNANCE_REGISTRY_INDEX.allowances;
  const totalEntries =
    objectIds.length +
    policyIds.length +
    boundaryIds.length +
    ownershipIds.length +
    allowanceIds.length;

  const registryComplete =
    objectIds.length >= 6 &&
    policyIds.length >= 6 &&
    boundaryIds.length >= 6 &&
    ownershipIds.length >= 6 &&
    allowanceIds.length >= 6;

  return {
    version: V69_CODE_GOVERNANCE_VERSION,
    objectIds: [...objectIds],
    policyIds: [...policyIds],
    boundaryIds: [...boundaryIds],
    ownershipIds: [...ownershipIds],
    allowanceIds: [...allowanceIds],
    totalEntries,
    registryComplete,
    summary: [
      `code-governance-registry total=${totalEntries}`,
      `objects=${objectIds.length}`,
      `policies=${policyIds.length}`,
      `boundaries=${boundaryIds.length}`,
      `ownerships=${ownershipIds.length}`,
      `allowances=${allowanceIds.length}`,
      `complete=${registryComplete}`,
    ].join(" "),
  };
}

export function isCodeGovernanceRegistryIdKnown(
  kind: keyof typeof CODE_GOVERNANCE_REGISTRY_INDEX,
  id: string,
): boolean {
  return (CODE_GOVERNANCE_REGISTRY_INDEX[kind] as readonly string[]).includes(id);
}
