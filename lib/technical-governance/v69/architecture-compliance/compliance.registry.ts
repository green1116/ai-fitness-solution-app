/**
 * V69 P7 — Architecture compliance registry / index (read-only)
 */
import { ALIGNMENT_CHECK_CATALOG } from "./alignment.check.catalog";
import { COMPLIANCE_CHECK_CATALOG } from "./compliance.check.catalog";
import type { ArchitectureComplianceRegistry } from "./compliance.types";
import { V69_ARCHITECTURE_COMPLIANCE_VERSION } from "./compliance.types";
import { COMPLIANCE_GATE_CATALOG } from "./compliance.gate.catalog";
import { COMPLIANCE_OBJECT_CATALOG } from "./compliance.object.catalog";
import { COMPLIANCE_RULE_CATALOG } from "./compliance.rule.catalog";
import { DEVIATION_CATALOG } from "./deviation.catalog";
import { EXCEPTION_CATALOG } from "./exception.catalog";

export const ARCHITECTURE_COMPLIANCE_REGISTRY_INDEX = {
  objects: COMPLIANCE_OBJECT_CATALOG.map((o) => o.id),
  rules: COMPLIANCE_RULE_CATALOG.map((r) => r.id),
  checks: COMPLIANCE_CHECK_CATALOG.map((c) => c.id),
  gates: COMPLIANCE_GATE_CATALOG.map((g) => g.id),
  alignment: ALIGNMENT_CHECK_CATALOG.map((a) => a.id),
  deviations: DEVIATION_CATALOG.map((d) => d.id),
  exceptions: EXCEPTION_CATALOG.map((e) => e.id),
} as const;

export function buildArchitectureComplianceRegistry(): ArchitectureComplianceRegistry {
  const objectIds = ARCHITECTURE_COMPLIANCE_REGISTRY_INDEX.objects;
  const ruleIds = ARCHITECTURE_COMPLIANCE_REGISTRY_INDEX.rules;
  const checkIds = ARCHITECTURE_COMPLIANCE_REGISTRY_INDEX.checks;
  const gateIds = ARCHITECTURE_COMPLIANCE_REGISTRY_INDEX.gates;
  const alignmentIds = ARCHITECTURE_COMPLIANCE_REGISTRY_INDEX.alignment;
  const deviationIds = ARCHITECTURE_COMPLIANCE_REGISTRY_INDEX.deviations;
  const exceptionIds = ARCHITECTURE_COMPLIANCE_REGISTRY_INDEX.exceptions;
  const totalEntries =
    objectIds.length +
    ruleIds.length +
    checkIds.length +
    gateIds.length +
    alignmentIds.length +
    deviationIds.length +
    exceptionIds.length;

  const registryComplete =
    objectIds.length >= 6 &&
    ruleIds.length >= 6 &&
    checkIds.length >= 6 &&
    gateIds.length >= 6 &&
    alignmentIds.length >= 6 &&
    deviationIds.length >= 6 &&
    exceptionIds.length >= 6;

  return {
    version: V69_ARCHITECTURE_COMPLIANCE_VERSION,
    objectIds: [...objectIds],
    ruleIds: [...ruleIds],
    checkIds: [...checkIds],
    gateIds: [...gateIds],
    alignmentIds: [...alignmentIds],
    deviationIds: [...deviationIds],
    exceptionIds: [...exceptionIds],
    totalEntries,
    registryComplete,
    summary: [
      `architecture-compliance-registry total=${totalEntries}`,
      `objects=${objectIds.length}`,
      `rules=${ruleIds.length}`,
      `checks=${checkIds.length}`,
      `gates=${gateIds.length}`,
      `alignment=${alignmentIds.length}`,
      `deviations=${deviationIds.length}`,
      `exceptions=${exceptionIds.length}`,
      `complete=${registryComplete}`,
    ].join(" "),
  };
}

export function isArchitectureComplianceRegistryIdKnown(
  kind: keyof typeof ARCHITECTURE_COMPLIANCE_REGISTRY_INDEX,
  id: string,
): boolean {
  return (ARCHITECTURE_COMPLIANCE_REGISTRY_INDEX[kind] as readonly string[]).includes(id);
}
