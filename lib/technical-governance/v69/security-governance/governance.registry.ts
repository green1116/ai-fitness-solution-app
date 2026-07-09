/**
 * V69 P5 — Security governance registry / index (read-only)
 */
import { ACCESS_STANDARD_CATALOG } from "./access.standard.catalog";
import { AUDIT_STANDARD_CATALOG } from "./audit.standard.catalog";
import { PERMISSION_STANDARD_CATALOG } from "./permission.standard.catalog";
import type { SecurityGovernanceRegistry } from "./governance.types";
import { V69_SECURITY_GOVERNANCE_VERSION } from "./governance.types";
import { RISK_CONTROL_CATALOG } from "./risk.standard.catalog";
import { SECURITY_BOUNDARY_CATALOG } from "./security.boundary.catalog";
import { SECURITY_GOVERNANCE_OBJECT_CATALOG } from "./security.object.catalog";
import { SECURITY_POLICY_CATALOG } from "./security.policy.catalog";
import { SENSITIVE_SURFACE_CATALOG } from "./sensitive.surface.catalog";

export const SECURITY_GOVERNANCE_REGISTRY_INDEX = {
  objects: SECURITY_GOVERNANCE_OBJECT_CATALOG.map((o) => o.id),
  policies: SECURITY_POLICY_CATALOG.map((p) => p.id),
  boundaries: SECURITY_BOUNDARY_CATALOG.map((b) => b.id),
  surfaces: SENSITIVE_SURFACE_CATALOG.map((s) => s.id),
  access: ACCESS_STANDARD_CATALOG.map((a) => a.id),
  permissions: PERMISSION_STANDARD_CATALOG.map((p) => p.id),
  audit: AUDIT_STANDARD_CATALOG.map((a) => a.id),
  risk: RISK_CONTROL_CATALOG.map((r) => r.id),
} as const;

export function buildSecurityGovernanceRegistry(): SecurityGovernanceRegistry {
  const objectIds = SECURITY_GOVERNANCE_REGISTRY_INDEX.objects;
  const policyIds = SECURITY_GOVERNANCE_REGISTRY_INDEX.policies;
  const boundaryIds = SECURITY_GOVERNANCE_REGISTRY_INDEX.boundaries;
  const surfaceIds = SECURITY_GOVERNANCE_REGISTRY_INDEX.surfaces;
  const accessIds = SECURITY_GOVERNANCE_REGISTRY_INDEX.access;
  const permissionIds = SECURITY_GOVERNANCE_REGISTRY_INDEX.permissions;
  const auditIds = SECURITY_GOVERNANCE_REGISTRY_INDEX.audit;
  const riskIds = SECURITY_GOVERNANCE_REGISTRY_INDEX.risk;
  const totalEntries =
    objectIds.length +
    policyIds.length +
    boundaryIds.length +
    surfaceIds.length +
    accessIds.length +
    permissionIds.length +
    auditIds.length +
    riskIds.length;

  const registryComplete =
    objectIds.length >= 6 &&
    policyIds.length >= 6 &&
    boundaryIds.length >= 6 &&
    surfaceIds.length >= 6 &&
    accessIds.length >= 6 &&
    permissionIds.length >= 6 &&
    auditIds.length >= 6 &&
    riskIds.length >= 6;

  return {
    version: V69_SECURITY_GOVERNANCE_VERSION,
    objectIds: [...objectIds],
    policyIds: [...policyIds],
    boundaryIds: [...boundaryIds],
    surfaceIds: [...surfaceIds],
    accessIds: [...accessIds],
    permissionIds: [...permissionIds],
    auditIds: [...auditIds],
    riskIds: [...riskIds],
    totalEntries,
    registryComplete,
    summary: [
      `security-governance-registry total=${totalEntries}`,
      `objects=${objectIds.length}`,
      `policies=${policyIds.length}`,
      `boundaries=${boundaryIds.length}`,
      `surfaces=${surfaceIds.length}`,
      `access=${accessIds.length}`,
      `permissions=${permissionIds.length}`,
      `audit=${auditIds.length}`,
      `risk=${riskIds.length}`,
      `complete=${registryComplete}`,
    ].join(" "),
  };
}

export function isSecurityGovernanceRegistryIdKnown(
  kind: keyof typeof SECURITY_GOVERNANCE_REGISTRY_INDEX,
  id: string,
): boolean {
  return (SECURITY_GOVERNANCE_REGISTRY_INDEX[kind] as readonly string[]).includes(id);
}
