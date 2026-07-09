/**
 * V69 P6 — Acceptance rule catalog (declarative)
 */
import type { AcceptanceRuleEntry, AcceptanceRuleManifest } from "./governance.types";
import { V69_QUALITY_GOVERNANCE_VERSION } from "./governance.types";

export const ACCEPTANCE_RULE_CATALOG: AcceptanceRuleEntry[] = [
  {
    id: "QGOV-ACP-001",
    qualityGateRef: "QGOV-GATE-001",
    criterion: "module_structure",
    passCondition: "all required files exist",
    required: true,
    description: "P1 module structure acceptance",
  },
  {
    id: "QGOV-ACP-002",
    qualityGateRef: "QGOV-GATE-002",
    criterion: "adjacency_complete",
    passCondition: "graph.graphComplete === true",
    required: true,
    description: "P2 dependency graph acceptance",
  },
  {
    id: "QGOV-ACP-003",
    qualityGateRef: "QGOV-GATE-003",
    criterion: "import_allowance_aligned",
    passCondition: "refsAligned === true",
    required: true,
    description: "P3 code governance acceptance",
  },
  {
    id: "QGOV-ACP-004",
    qualityGateRef: "QGOV-GATE-004",
    criterion: "standards_registry",
    passCondition: "registry.registryComplete === true",
    required: true,
    description: "P4 technical standards acceptance",
  },
  {
    id: "QGOV-ACP-005",
    qualityGateRef: "QGOV-GATE-005",
    criterion: "security_boundaries",
    passCondition: "boundaries.catalogComplete === true",
    required: true,
    description: "P5 security governance acceptance",
  },
  {
    id: "QGOV-ACP-006",
    qualityGateRef: "QGOV-GATE-006",
    criterion: "typescript_clean",
    passCondition: "tsc exit code 0",
    required: true,
    description: "TypeScript compile acceptance",
  },
  {
    id: "QGOV-ACP-007",
    qualityGateRef: "QGOV-GATE-007",
    criterion: "cross_refs",
    passCondition: "isQualityGovernanceRefsAligned()",
    required: true,
    description: "Cross-reference alignment acceptance",
  },
  {
    id: "QGOV-ACP-008",
    qualityGateRef: "QGOV-GATE-008",
    criterion: "governance_ready",
    passCondition: "governanceReady === true && readinessScore === 100",
    required: true,
    description: "P6 quality governance acceptance",
  },
];

export function buildAcceptanceRuleManifest(): AcceptanceRuleManifest {
  const rules = ACCEPTANCE_RULE_CATALOG;
  const catalogComplete = rules.length >= 6;

  return {
    version: V69_QUALITY_GOVERNANCE_VERSION,
    entryCount: rules.length,
    catalogComplete,
    rules,
    summary: [
      `acceptance-rules count=${rules.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getAcceptanceRulesByGateRef(
  qualityGateRef: string,
): AcceptanceRuleEntry[] {
  return ACCEPTANCE_RULE_CATALOG.filter((r) => r.qualityGateRef === qualityGateRef);
}
