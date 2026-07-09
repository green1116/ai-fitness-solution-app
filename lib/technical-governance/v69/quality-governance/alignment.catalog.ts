/**
 * V69 P6 — Quality governance cross-reference alignment (read-only)
 */
import { ARCHITECTURE_DEFINITION_CATALOG } from "../architecture-catalog/architecture.definition.catalog";
import { CODE_GOVERNANCE_OBJECT_CATALOG } from "../code-governance/code.object.catalog";
import { SECURITY_GOVERNANCE_OBJECT_CATALOG } from "../security-governance/security.object.catalog";

import { ACCEPTANCE_RULE_CATALOG } from "./acceptance.rule.catalog";
import { DEFECT_CONTROL_CATALOG } from "./defect.control.catalog";
import { QUALITY_GATE_CATALOG } from "./quality.gate.catalog";
import { QUALITY_GOVERNANCE_OBJECT_CATALOG } from "./quality.object.catalog";
import { RELEASE_QUALITY_CATALOG } from "./release.quality.catalog";
import { TEST_STANDARD_CATALOG } from "./test.standard.catalog";

export function isQualityGovernanceRefsAligned(): boolean {
  const arcDefIds = new Set(ARCHITECTURE_DEFINITION_CATALOG.map((d) => d.id));
  const secObjectIds = new Set(SECURITY_GOVERNANCE_OBJECT_CATALOG.map((o) => o.id));
  const codeObjectIds = new Set(CODE_GOVERNANCE_OBJECT_CATALOG.map((o) => o.id));
  const qualityObjectIds = new Set(QUALITY_GOVERNANCE_OBJECT_CATALOG.map((o) => o.id));
  const gateIds = new Set(QUALITY_GATE_CATALOG.map((g) => g.id));

  const objectsAligned = QUALITY_GOVERNANCE_OBJECT_CATALOG.every(
    (o) =>
      arcDefIds.has(o.arcDefRef) &&
      secObjectIds.has(o.securityObjectRef) &&
      codeObjectIds.has(o.codeObjectRef),
  );

  const testAligned = TEST_STANDARD_CATALOG.every((t) =>
    qualityObjectIds.has(t.qualityObjectRef),
  );

  const defectAligned = DEFECT_CONTROL_CATALOG.every((d) =>
    qualityObjectIds.has(d.qualityObjectRef),
  );

  const acceptanceAligned = ACCEPTANCE_RULE_CATALOG.every((a) =>
    gateIds.has(a.qualityGateRef),
  );

  const releaseAligned = RELEASE_QUALITY_CATALOG.every((r) =>
    gateIds.has(r.qualityGateRef),
  );

  const coverageComplete =
    QUALITY_GOVERNANCE_OBJECT_CATALOG.every((o) =>
      TEST_STANDARD_CATALOG.some((t) => t.qualityObjectRef === o.id),
    ) &&
    QUALITY_GOVERNANCE_OBJECT_CATALOG.every((o) =>
      DEFECT_CONTROL_CATALOG.some((d) => d.qualityObjectRef === o.id),
    ) &&
    QUALITY_GATE_CATALOG.every((g) =>
      ACCEPTANCE_RULE_CATALOG.some((a) => a.qualityGateRef === g.id),
    ) &&
    QUALITY_GATE_CATALOG.every((g) =>
      RELEASE_QUALITY_CATALOG.some((r) => r.qualityGateRef === g.id),
    );

  return (
    objectsAligned &&
    testAligned &&
    defectAligned &&
    acceptanceAligned &&
    releaseAligned &&
    coverageComplete
  );
}
