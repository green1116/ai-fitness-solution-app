/**
 * V69 P6 — Quality governance registry / index (read-only)
 */
import { ACCEPTANCE_RULE_CATALOG } from "./acceptance.rule.catalog";
import { DEFECT_CONTROL_CATALOG } from "./defect.control.catalog";
import type { QualityGovernanceRegistry } from "./governance.types";
import { V69_QUALITY_GOVERNANCE_VERSION } from "./governance.types";
import { QUALITY_GATE_CATALOG } from "./quality.gate.catalog";
import { QUALITY_GOVERNANCE_OBJECT_CATALOG } from "./quality.object.catalog";
import { QUALITY_STANDARD_CATALOG } from "./quality.standard.catalog";
import { RELEASE_QUALITY_CATALOG } from "./release.quality.catalog";
import { TEST_STANDARD_CATALOG } from "./test.standard.catalog";

export const QUALITY_GOVERNANCE_REGISTRY_INDEX = {
  objects: QUALITY_GOVERNANCE_OBJECT_CATALOG.map((o) => o.id),
  standards: QUALITY_STANDARD_CATALOG.map((s) => s.id),
  gates: QUALITY_GATE_CATALOG.map((g) => g.id),
  tests: TEST_STANDARD_CATALOG.map((t) => t.id),
  acceptance: ACCEPTANCE_RULE_CATALOG.map((a) => a.id),
  defects: DEFECT_CONTROL_CATALOG.map((d) => d.id),
  release: RELEASE_QUALITY_CATALOG.map((r) => r.id),
} as const;

export function buildQualityGovernanceRegistry(): QualityGovernanceRegistry {
  const objectIds = QUALITY_GOVERNANCE_REGISTRY_INDEX.objects;
  const standardIds = QUALITY_GOVERNANCE_REGISTRY_INDEX.standards;
  const gateIds = QUALITY_GOVERNANCE_REGISTRY_INDEX.gates;
  const testIds = QUALITY_GOVERNANCE_REGISTRY_INDEX.tests;
  const acceptanceIds = QUALITY_GOVERNANCE_REGISTRY_INDEX.acceptance;
  const defectIds = QUALITY_GOVERNANCE_REGISTRY_INDEX.defects;
  const releaseIds = QUALITY_GOVERNANCE_REGISTRY_INDEX.release;
  const totalEntries =
    objectIds.length +
    standardIds.length +
    gateIds.length +
    testIds.length +
    acceptanceIds.length +
    defectIds.length +
    releaseIds.length;

  const registryComplete =
    objectIds.length >= 6 &&
    standardIds.length >= 6 &&
    gateIds.length >= 6 &&
    testIds.length >= 6 &&
    acceptanceIds.length >= 6 &&
    defectIds.length >= 6 &&
    releaseIds.length >= 6;

  return {
    version: V69_QUALITY_GOVERNANCE_VERSION,
    objectIds: [...objectIds],
    standardIds: [...standardIds],
    gateIds: [...gateIds],
    testIds: [...testIds],
    acceptanceIds: [...acceptanceIds],
    defectIds: [...defectIds],
    releaseIds: [...releaseIds],
    totalEntries,
    registryComplete,
    summary: [
      `quality-governance-registry total=${totalEntries}`,
      `objects=${objectIds.length}`,
      `standards=${standardIds.length}`,
      `gates=${gateIds.length}`,
      `tests=${testIds.length}`,
      `acceptance=${acceptanceIds.length}`,
      `defects=${defectIds.length}`,
      `release=${releaseIds.length}`,
      `complete=${registryComplete}`,
    ].join(" "),
  };
}

export function isQualityGovernanceRegistryIdKnown(
  kind: keyof typeof QUALITY_GOVERNANCE_REGISTRY_INDEX,
  id: string,
): boolean {
  return (QUALITY_GOVERNANCE_REGISTRY_INDEX[kind] as readonly string[]).includes(id);
}
