/**
 * V69 P7 — Architecture compliance cross-reference alignment (read-only)
 */
import { ARCHITECTURE_DEFINITION_CATALOG } from "../architecture-catalog/architecture.definition.catalog";
import { QUALITY_GOVERNANCE_OBJECT_CATALOG } from "../quality-governance/quality.object.catalog";
import { STANDARD_POLICY_SET_CATALOG } from "../technical-standards/policy.set.catalog";

import { ALIGNMENT_CHECK_CATALOG } from "./alignment.check.catalog";
import { COMPLIANCE_CHECK_CATALOG } from "./compliance.check.catalog";
import { COMPLIANCE_OBJECT_CATALOG } from "./compliance.object.catalog";
import { COMPLIANCE_RULE_CATALOG } from "./compliance.rule.catalog";
import { DEVIATION_CATALOG } from "./deviation.catalog";
import { EXCEPTION_CATALOG } from "./exception.catalog";

export function isArchitectureComplianceRefsAligned(): boolean {
  const arcDefIds = new Set(ARCHITECTURE_DEFINITION_CATALOG.map((d) => d.id));
  const qualityObjectIds = new Set(QUALITY_GOVERNANCE_OBJECT_CATALOG.map((o) => o.id));
  const policySetIds = new Set(STANDARD_POLICY_SET_CATALOG.map((p) => p.id));
  const complianceObjectIds = new Set(COMPLIANCE_OBJECT_CATALOG.map((o) => o.id));
  const ruleIds = new Set(COMPLIANCE_RULE_CATALOG.map((r) => r.id));
  const deviationIds = new Set(DEVIATION_CATALOG.map((d) => d.id));

  const objectsAligned = COMPLIANCE_OBJECT_CATALOG.every(
    (o) =>
      arcDefIds.has(o.arcDefRef) &&
      qualityObjectIds.has(o.qualityObjectRef) &&
      policySetIds.has(o.standardPolicyRef),
  );

  const rulesAligned = COMPLIANCE_RULE_CATALOG.every((r) =>
    complianceObjectIds.has(r.complianceObjectRef),
  );

  const checksAligned = COMPLIANCE_CHECK_CATALOG.every((c) =>
    ruleIds.has(c.complianceRuleRef),
  );

  const deviationsAligned = DEVIATION_CATALOG.every((d) =>
    complianceObjectIds.has(d.complianceObjectRef),
  );

  const exceptionsAligned = EXCEPTION_CATALOG.every((e) =>
    deviationIds.has(e.deviationRef),
  );

  const coverageComplete =
    COMPLIANCE_OBJECT_CATALOG.every((o) =>
      COMPLIANCE_RULE_CATALOG.some((r) => r.complianceObjectRef === o.id),
    ) &&
    COMPLIANCE_OBJECT_CATALOG.every((o) =>
      DEVIATION_CATALOG.some((d) => d.complianceObjectRef === o.id),
    ) &&
    COMPLIANCE_RULE_CATALOG.every((r) =>
      COMPLIANCE_CHECK_CATALOG.some((c) => c.complianceRuleRef === r.id),
    ) &&
    DEVIATION_CATALOG.every((d) =>
      EXCEPTION_CATALOG.some((e) => e.deviationRef === d.id),
    ) &&
    ALIGNMENT_CHECK_CATALOG.length >= 6;

  return (
    objectsAligned &&
    rulesAligned &&
    checksAligned &&
    deviationsAligned &&
    exceptionsAligned &&
    coverageComplete
  );
}
