/**
 * V69 P5 — Risk control catalog (declarative)
 */
import type { RiskControlEntry, RiskControlManifest } from "./governance.types";
import { V69_SECURITY_GOVERNANCE_VERSION } from "./governance.types";

export const RISK_CONTROL_CATALOG: RiskControlEntry[] = [
  {
    id: "SEC-RISK-001",
    sensitiveSurfaceRef: "SEC-SUR-002",
    riskLevel: "critical",
    controlKind: "encryption-at-rest",
    mitigation: "encrypt credential stores",
    required: true,
    description: "Credential surface encryption control",
  },
  {
    id: "SEC-RISK-002",
    sensitiveSurfaceRef: "SEC-SUR-004",
    riskLevel: "critical",
    controlKind: "secret-manager",
    mitigation: "no secrets in source control",
    required: true,
    description: "Environment secret management control",
  },
  {
    id: "SEC-RISK-003",
    sensitiveSurfaceRef: "SEC-SUR-001",
    riskLevel: "high",
    controlKind: "data-masking",
    mitigation: "mask PII in logs",
    required: true,
    description: "PII data masking control",
  },
  {
    id: "SEC-RISK-004",
    sensitiveSurfaceRef: "SEC-SUR-003",
    riskLevel: "high",
    controlKind: "token-rotation",
    mitigation: "rotate session tokens",
    required: true,
    description: "API token rotation control",
  },
  {
    id: "SEC-RISK-005",
    sensitiveSurfaceRef: "SEC-SUR-005",
    riskLevel: "medium",
    controlKind: "access-review",
    mitigation: "quarterly access review",
    required: true,
    description: "Domain PII access review control",
  },
  {
    id: "SEC-RISK-006",
    sensitiveSurfaceRef: "SEC-SUR-008",
    riskLevel: "high",
    controlKind: "pipeline-gate",
    mitigation: "signed deploy artifacts only",
    required: true,
    description: "Deployment pipeline integrity control",
  },
  {
    id: "SEC-RISK-007",
    sensitiveSurfaceRef: "SEC-SUR-007",
    riskLevel: "medium",
    controlKind: "immutable-audit",
    mitigation: "append-only audit logs",
    required: true,
    description: "Monitoring audit immutability control",
  },
  {
    id: "SEC-RISK-008",
    sensitiveSurfaceRef: "SEC-SUR-006",
    riskLevel: "low",
    controlKind: "freeze-guard",
    mitigation: "declarative read-only import only",
    required: true,
    description: "Frozen platform mutation guard",
  },
];

export function buildRiskControlManifest(): RiskControlManifest {
  const controls = RISK_CONTROL_CATALOG;
  const levels = new Set(controls.map((c) => c.riskLevel));
  const catalogComplete = controls.length >= 6 && levels.size >= 3;

  return {
    version: V69_SECURITY_GOVERNANCE_VERSION,
    entryCount: controls.length,
    riskLevelCount: levels.size,
    catalogComplete,
    controls,
    summary: [
      `risk-controls count=${controls.length}`,
      `levels=${levels.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getRiskControlsBySurfaceRef(
  sensitiveSurfaceRef: string,
): RiskControlEntry[] {
  return RISK_CONTROL_CATALOG.filter((c) => c.sensitiveSurfaceRef === sensitiveSurfaceRef);
}

export function computeDeclarativeRiskAcceptance(input: {
  riskLevel: RiskControlEntry["riskLevel"];
  controlKind: string;
}): boolean {
  const requiredControls: Record<RiskControlEntry["riskLevel"], string[]> = {
    low: ["freeze-guard"],
    medium: ["access-review", "immutable-audit"],
    high: ["data-masking", "token-rotation", "pipeline-gate"],
    critical: ["encryption-at-rest", "secret-manager"],
  };
  return requiredControls[input.riskLevel].includes(input.controlKind);
}
