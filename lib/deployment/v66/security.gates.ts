/**
 * V66 P5 — Deployment security gates (declarative, read-only)
 */
import type {
  DeploymentSecuritySignals,
  SecurityGateDefinition,
  SecurityGateManifest,
  SecurityGateStatus,
} from "./security.types";
import { V66_DEPLOYMENT_SECURITY_VERSION } from "./security.types";

type SecurityGateRule = {
  id: string;
  label: string;
  required: boolean;
  blocker: boolean;
  evaluate: (signals: DeploymentSecuritySignals) => SecurityGateStatus;
  notes?: string;
};

const SECURITY_GATE_RULES: SecurityGateRule[] = [
  {
    id: "SG-001",
    label: "P4 release orchestration ready",
    required: true,
    blocker: true,
    evaluate: (s) => (s.orchestrationReady ? "closed" : "blocked"),
  },
  {
    id: "SG-002",
    label: "Security policy catalog complete",
    required: true,
    blocker: true,
    evaluate: (s) => (s.policyCatalogComplete ? "closed" : "blocked"),
  },
  {
    id: "SG-003",
    label: "Compliance checklist pass",
    required: true,
    blocker: true,
    evaluate: (s) => (s.complianceChecklistPass ? "closed" : "blocked"),
  },
  {
    id: "SG-004",
    label: "Artifact integrity inventory complete",
    required: true,
    blocker: true,
    evaluate: (s) => (s.artifactIntegrityComplete ? "closed" : "blocked"),
  },
  {
    id: "SG-005",
    label: "Forbidden production flags gate",
    required: true,
    blocker: true,
    evaluate: (s) => (s.policyCatalogComplete ? "closed" : "open"),
    notes: "Declarative; live check via v92:env-audit",
  },
  {
    id: "SG-006",
    label: "Upstream frozen layer gate",
    required: true,
    blocker: true,
    evaluate: (s) => (s.orchestrationReady ? "closed" : "blocked"),
    notes: "V48–V65 reference-only",
  },
  {
    id: "SG-007",
    label: "V66 P5 security verify gate",
    required: true,
    blocker: false,
    evaluate: (s) => (s.securityGatesPass ? "closed" : "open"),
    notes: "npm run verify:v66-p5-deployment-security",
  },
  {
    id: "SG-008",
    label: "Production cutover security hold (declarative)",
    required: false,
    blocker: false,
    evaluate: (s) => (s.securityGatesPass ? "closed" : "open"),
    notes: "No live enforcement in P5",
  },
];

export const SECURITY_GATE_COUNT = SECURITY_GATE_RULES.length;

export function buildSecurityGateManifest(
  signals: DeploymentSecuritySignals,
): SecurityGateManifest {
  const gates: SecurityGateDefinition[] = SECURITY_GATE_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    status: rule.evaluate(signals),
    required: rule.required,
    blocker: rule.blocker,
    notes: rule.notes,
  }));

  const closedCount = gates.filter((g) => g.status === "closed").length;
  const gatesPass = gates
    .filter((g) => g.required && g.blocker)
    .every((g) => g.status === "closed");

  return {
    version: V66_DEPLOYMENT_SECURITY_VERSION,
    gateCount: gates.length,
    closedCount,
    gatesPass,
    gates,
    summary: [
      `security-gates closed=${closedCount}/${gates.length}`,
      `gatesPass=${gatesPass}`,
    ].join(" "),
  };
}
