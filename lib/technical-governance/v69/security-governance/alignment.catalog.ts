/**
 * V69 P5 — Security governance cross-reference alignment (read-only)
 */
import { ARCHITECTURE_DEFINITION_CATALOG } from "../architecture-catalog/architecture.definition.catalog";
import { CODE_GOVERNANCE_OBJECT_CATALOG } from "../code-governance/code.object.catalog";
import { DIRECTORY_BOUNDARY_CATALOG } from "../code-governance/directory.boundary.catalog";

import { ACCESS_STANDARD_CATALOG } from "./access.standard.catalog";
import { AUDIT_STANDARD_CATALOG } from "./audit.standard.catalog";
import { PERMISSION_STANDARD_CATALOG } from "./permission.standard.catalog";
import { RISK_CONTROL_CATALOG } from "./risk.standard.catalog";
import { SECURITY_BOUNDARY_CATALOG } from "./security.boundary.catalog";
import { SECURITY_GOVERNANCE_OBJECT_CATALOG } from "./security.object.catalog";
import { SECURITY_POLICY_CATALOG } from "./security.policy.catalog";
import { SENSITIVE_SURFACE_CATALOG } from "./sensitive.surface.catalog";

const POLICY_STANDARD_REFS = new Set([
  ...ACCESS_STANDARD_CATALOG.map((a) => a.id),
  ...PERMISSION_STANDARD_CATALOG.map((p) => p.id),
  ...AUDIT_STANDARD_CATALOG.map((a) => a.id),
  ...RISK_CONTROL_CATALOG.map((r) => r.id),
  ...SENSITIVE_SURFACE_CATALOG.map((s) => s.id),
]);

export function isSecurityGovernanceRefsAligned(): boolean {
  const arcDefIds = new Set(ARCHITECTURE_DEFINITION_CATALOG.map((d) => d.id));
  const codeObjectIds = new Set(CODE_GOVERNANCE_OBJECT_CATALOG.map((o) => o.id));
  const codeBoundaryIds = new Set(DIRECTORY_BOUNDARY_CATALOG.map((b) => b.id));
  const secBoundaryIds = new Set(SECURITY_BOUNDARY_CATALOG.map((b) => b.id));
  const policyIds = new Set(SECURITY_POLICY_CATALOG.map((p) => p.id));
  const surfaceIds = new Set(SENSITIVE_SURFACE_CATALOG.map((s) => s.id));

  const objectsAligned = SECURITY_GOVERNANCE_OBJECT_CATALOG.every(
    (o) =>
      arcDefIds.has(o.arcDefRef) &&
      codeObjectIds.has(o.codeObjectRef) &&
      secBoundaryIds.has(o.boundaryRef),
  );

  const boundariesAligned = SECURITY_BOUNDARY_CATALOG.every((b) => {
    const codeBnd = DIRECTORY_BOUNDARY_CATALOG.find((c) => c.id === b.codeBoundaryRef);
    return (
      arcDefIds.has(b.arcDefRef) &&
      codeBnd !== undefined &&
      codeBnd.arcDefRef === b.arcDefRef &&
      SECURITY_GOVERNANCE_OBJECT_CATALOG.some(
        (o) => o.boundaryRef === b.id && o.codeObjectRef === codeBnd.codeObjectRef,
      )
    );
  });

  const policiesAligned = SECURITY_POLICY_CATALOG.every(
    (p) => !p.standardRef || POLICY_STANDARD_REFS.has(p.standardRef),
  );

  const surfacesAligned = SENSITIVE_SURFACE_CATALOG.every((s) =>
    secBoundaryIds.has(s.securityBoundaryRef),
  );

  const accessAligned = ACCESS_STANDARD_CATALOG.every((a) =>
    secBoundaryIds.has(a.securityBoundaryRef),
  );

  const permissionAligned = PERMISSION_STANDARD_CATALOG.every((p) =>
    secBoundaryIds.has(p.securityBoundaryRef),
  );

  const auditAligned = AUDIT_STANDARD_CATALOG.every((a) => policyIds.has(a.securityPolicyRef));

  const riskAligned = RISK_CONTROL_CATALOG.every((r) => surfaceIds.has(r.sensitiveSurfaceRef));

  const coverageComplete =
    SECURITY_BOUNDARY_CATALOG.every((b) =>
      ACCESS_STANDARD_CATALOG.some((a) => a.securityBoundaryRef === b.id),
    ) &&
    SECURITY_BOUNDARY_CATALOG.every((b) =>
      PERMISSION_STANDARD_CATALOG.some((p) => p.securityBoundaryRef === b.id),
    ) &&
    SENSITIVE_SURFACE_CATALOG.every((s) =>
      RISK_CONTROL_CATALOG.some((r) => r.sensitiveSurfaceRef === s.id),
    );

  return (
    objectsAligned &&
    boundariesAligned &&
    policiesAligned &&
    surfacesAligned &&
    accessAligned &&
    permissionAligned &&
    auditAligned &&
    riskAligned &&
    coverageComplete
  );
}
