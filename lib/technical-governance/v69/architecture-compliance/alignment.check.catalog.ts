/**
 * V69 P7 — Cross-layer alignment check catalog (declarative)
 */
import type { AlignmentCheckEntry, AlignmentCheckManifest } from "./compliance.types";
import { V69_ARCHITECTURE_COMPLIANCE_VERSION } from "./compliance.types";

export const ALIGNMENT_CHECK_CATALOG: AlignmentCheckEntry[] = [
  {
    id: "ACMP-ALN-001",
    sourceLayer: "P1-architecture",
    targetLayer: "P2-dependency",
    alignmentCriterion: "arc_def_to_adjacency",
    required: true,
    description: "P1 architecture definitions align with P2 dependency graph",
  },
  {
    id: "ACMP-ALN-002",
    sourceLayer: "P2-dependency",
    targetLayer: "P3-code",
    alignmentCriterion: "adjacency_to_import_allowance",
    required: true,
    description: "P2 dependency graph aligns with P3 import allowances",
  },
  {
    id: "ACMP-ALN-003",
    sourceLayer: "P3-code",
    targetLayer: "P4-standards",
    alignmentCriterion: "code_policy_to_standard_set",
    required: true,
    description: "P3 code policies align with P4 standard policy sets",
  },
  {
    id: "ACMP-ALN-004",
    sourceLayer: "P4-standards",
    targetLayer: "P5-security",
    alignmentCriterion: "standard_to_security_boundary",
    required: true,
    description: "P4 standards align with P5 security boundaries",
  },
  {
    id: "ACMP-ALN-005",
    sourceLayer: "P5-security",
    targetLayer: "P6-quality",
    alignmentCriterion: "security_object_to_quality_object",
    required: true,
    description: "P5 security objects align with P6 quality objects",
  },
  {
    id: "ACMP-ALN-006",
    sourceLayer: "P6-quality",
    targetLayer: "P7-compliance",
    alignmentCriterion: "quality_object_to_compliance_object",
    required: true,
    description: "P6 quality objects align with P7 compliance objects",
  },
  {
    id: "ACMP-ALN-007",
    sourceLayer: "P1-architecture",
    targetLayer: "P7-compliance",
    alignmentCriterion: "arc_def_to_compliance_object",
    required: true,
    description: "P1 architecture definitions align with P7 compliance objects",
  },
  {
    id: "ACMP-ALN-008",
    sourceLayer: "P4-standards",
    targetLayer: "P7-compliance",
    alignmentCriterion: "policy_set_to_compliance_object",
    required: true,
    description: "P4 policy sets align with P7 compliance objects",
  },
];

export function buildAlignmentCheckManifest(): AlignmentCheckManifest {
  const checks = ALIGNMENT_CHECK_CATALOG;
  const layers = new Set(checks.flatMap((c) => [c.sourceLayer, c.targetLayer]));
  const catalogComplete = checks.length >= 6 && layers.size >= 6;

  return {
    version: V69_ARCHITECTURE_COMPLIANCE_VERSION,
    entryCount: checks.length,
    layerCount: layers.size,
    catalogComplete,
    checks,
    summary: [
      `alignment-checks count=${checks.length}`,
      `layers=${layers.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getAlignmentChecksByLayer(
  layer: AlignmentCheckEntry["sourceLayer"] | AlignmentCheckEntry["targetLayer"],
): AlignmentCheckEntry[] {
  return ALIGNMENT_CHECK_CATALOG.filter(
    (c) => c.sourceLayer === layer || c.targetLayer === layer,
  );
}
