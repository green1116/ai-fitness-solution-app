/**
 * V3.7 Runtime Verification Freeze — unified verify script registry
 */

export type VerifyGroup =
  | "evidence"
  | "executive"
  | "runtime"
  | "tender"
  | "orchestration"
  | "commercial"
  | "hardening"
  | "observability"
  | "dashboard"
  | "audit"
  | "audit-review"
  | "release-ledger"
  | "release-ledger-api"
  | "ops-portal"
  | "access-control"
  | "access-control-api"
  | "governance"
  | "governance-api"
  | "ops-overview"
  | "dashboard-integration"
  | "command-center"
  | "dashboard-shell"
  | "enterprise-landing"
  | "rollout-readiness"
  | "rollout"
  | "go-live"
  | "launch-closure"
  | "archival"
  | "retention"
  | "lifecycle"
  | "preservation-closure"
  | "production-release"
  | "production-operations";

export type VerifyScriptEntry = {
  id: string;
  npmScript: string;
  file: string;
  group: VerifyGroup;
  required: boolean;
};

export const VERIFY_GROUP_LABELS: Record<VerifyGroup, string> = {
  evidence: "Evidence runtime",
  executive: "Executive runtime",
  runtime: "Runtime correlation / policy / state",
  tender: "Tender pipeline",
  orchestration: "Tender orchestration",
  commercial: "Commercialization V3.7",
  hardening: "Production hardening H1",
  observability: "Production observability H2",
  dashboard: "Release gate & ops dashboard H3",
  audit: "Production audit & release trace H4",
  "audit-review": "Production audit API & release review H5",
  "release-ledger": "Production release ledger & evidence export H6",
  "release-ledger-api": "Release ledger API & evidence export H7",
  "ops-portal": "Ops portal navigation & access control H8",
  "access-control": "Production access matrix & policy review H9",
  "access-control-api": "Access control API & policy review H10",
  governance: "Enterprise role catalog & access governance H11",
  "governance-api": "Governance review API & enterprise portal H12",
  "ops-overview": "Enterprise ops portal & unified navigation H13",
  "dashboard-integration": "Unified enterprise dashboard integration H14",
  "command-center": "Unified enterprise command center H15",
  "dashboard-shell": "Dashboard shell & command center entry H16",
  "enterprise-landing": "Enterprise landing cards & SaaS deployment readiness H17",
  "rollout-readiness": "Enterprise deployment readiness & rollout surface H18",
  rollout: "Production rollout documentation & launch checklist H19",
  "go-live": "Production go-live control & launch freeze H20",
  "launch-closure": "Production launch finalization & enterprise readiness closure H21",
  archival: "Production archival & enterprise preservation H22",
  retention: "Production archive access & retention review H23",
  lifecycle: "Production lifecycle finalization & enterprise continuity H24",
  "preservation-closure": "Enterprise lifecycle final archive & preservation closure H25",
  "production-release": "V3.7 FINAL production freeze & release baseline",
  "production-operations": "V4-A1 production operations runtime",
};

/** Canonical registry — single source for smoke pipeline + stability guard. */
export const VERIFY_REGISTRY: VerifyScriptEntry[] = [
  // evidence
  { id: "evidence-foundation", npmScript: "verify:evidence-foundation", file: "scripts/verify-evidence-foundation.ts", group: "evidence", required: true },
  { id: "evidence-query", npmScript: "verify:evidence-query", file: "scripts/verify-evidence-query.ts", group: "evidence", required: true },
  { id: "evidence-runtime", npmScript: "verify:evidence-runtime", file: "scripts/verify-evidence-runtime.ts", group: "evidence", required: true },
  { id: "evidence-intelligence", npmScript: "verify:evidence-intelligence", file: "scripts/verify-evidence-intelligence.ts", group: "evidence", required: true },
  { id: "deterministic-ocr", npmScript: "verify:deterministic-ocr", file: "scripts/verify-deterministic-ocr.ts", group: "evidence", required: true },
  { id: "evidence-linking", npmScript: "verify:evidence-linking", file: "scripts/verify-evidence-linking.ts", group: "evidence", required: true },
  { id: "evidence-coverage", npmScript: "verify:evidence-coverage", file: "scripts/verify-evidence-coverage.ts", group: "evidence", required: true },
  { id: "attachment-evidence", npmScript: "verify:attachment-evidence", file: "scripts/verify-attachment-evidence.ts", group: "evidence", required: true },
  // executive
  { id: "executive-oversight", npmScript: "verify:executive-oversight", file: "scripts/verify-executive-oversight.ts", group: "executive", required: true },
  { id: "executive-gate", npmScript: "verify:executive-gate", file: "scripts/verify-executive-gate.ts", group: "executive", required: true },
  { id: "executive-release-surface", npmScript: "verify:executive-release-surface", file: "scripts/verify-executive-release-surface.ts", group: "executive", required: true },
  { id: "executive-runtime-visualization", npmScript: "verify:executive-runtime-visualization", file: "scripts/verify-executive-runtime-visualization.ts", group: "executive", required: true },
  // runtime (correlation / policy / state / events)
  { id: "runtime-correlation", npmScript: "verify:runtime-correlation", file: "scripts/verify-runtime-correlation.ts", group: "runtime", required: true },
  { id: "runtime-policy", npmScript: "verify:runtime-policy", file: "scripts/verify-runtime-policy.ts", group: "runtime", required: true },
  { id: "runtime-state-machine", npmScript: "verify:runtime-state-machine", file: "scripts/verify-runtime-state-machine.ts", group: "runtime", required: true },
  { id: "runtime-events", npmScript: "verify:runtime-events", file: "scripts/verify-runtime-events.ts", group: "runtime", required: true },
  { id: "runtime-event-intelligence", npmScript: "verify:runtime-event-intelligence", file: "scripts/verify-runtime-event-intelligence.ts", group: "runtime", required: true },
  // tender
  { id: "tender-validation", npmScript: "verify:tender-validation", file: "scripts/verify-tender-validation.ts", group: "tender", required: true },
  { id: "tender-audit", npmScript: "verify:tender-audit", file: "scripts/verify-tender-audit.ts", group: "tender", required: true },
  { id: "tender-decision", npmScript: "verify:tender-decision", file: "scripts/verify-tender-decision.ts", group: "tender", required: true },
  { id: "tender-governance", npmScript: "verify:tender-governance", file: "scripts/verify-tender-governance.ts", group: "tender", required: true },
  { id: "semantic-evidence", npmScript: "verify:semantic-evidence", file: "scripts/verify-semantic-evidence.ts", group: "tender", required: true },
  { id: "semantic-runtime", npmScript: "verify:semantic-runtime", file: "scripts/verify-semantic-runtime.ts", group: "tender", required: true },
  // orchestration
  { id: "tender-runtime", npmScript: "verify:tender-runtime", file: "scripts/verify-tender-runtime-workflow.ts", group: "orchestration", required: true },
  { id: "tender-orchestration", npmScript: "verify:tender-orchestration", file: "scripts/verify-tender-orchestration.ts", group: "orchestration", required: true },
  // commercial (existing smoke tests only — hub scripts retained in package.json)
  { id: "commercial-stabilization", npmScript: "verify:commercialization-v37-stabilization", file: "lib/commercialization/__tests__/commercial-v37-stabilization.smoke.ts", group: "commercial", required: true },
  { id: "verification-matrix", npmScript: "verify:verification-matrix", file: "scripts/stabilization/verification-matrix.smoke.ts", group: "commercial", required: true },
  // hardening
  { id: "production-hardening", npmScript: "verify:hardening", file: "scripts/verify-production-hardening.ts", group: "hardening", required: true },
  // observability
  { id: "production-observability", npmScript: "verify:observability", file: "scripts/verify-production-observability.ts", group: "observability", required: true },
  // dashboard
  { id: "release-dashboard", npmScript: "verify:dashboard", file: "scripts/verify-release-dashboard.ts", group: "dashboard", required: true },
  // audit
  { id: "production-audit", npmScript: "verify:audit", file: "scripts/verify-production-audit.ts", group: "audit", required: true },
  // audit review
  { id: "audit-review", npmScript: "verify:audit-review", file: "scripts/verify-audit-review.ts", group: "audit-review", required: true },
  // release ledger
  { id: "release-ledger", npmScript: "verify:release-ledger", file: "scripts/verify-production-release-ledger.ts", group: "release-ledger", required: true },
  // release ledger API
  { id: "release-ledger-api", npmScript: "verify:release-ledger-api", file: "scripts/verify-release-ledger-api.ts", group: "release-ledger-api", required: true },
  // ops portal
  { id: "ops-portal", npmScript: "verify:ops-portal", file: "scripts/verify-ops-portal.ts", group: "ops-portal", required: true },
  // access control
  { id: "access-control", npmScript: "verify:access-control", file: "scripts/verify-access-control.ts", group: "access-control", required: true },
  // access control API
  { id: "access-control-api", npmScript: "verify:access-control-api", file: "scripts/verify-access-control-api.ts", group: "access-control-api", required: true },
  // governance
  { id: "governance-surface", npmScript: "verify:governance", file: "scripts/verify-governance-surface.ts", group: "governance", required: true },
  // governance API
  { id: "governance-api", npmScript: "verify:governance-api", file: "scripts/verify-governance-api.ts", group: "governance-api", required: true },
  // enterprise ops portal
  { id: "ops-overview", npmScript: "verify:ops-overview", file: "scripts/verify-enterprise-ops-portal.ts", group: "ops-overview", required: true },
  // dashboard integration
  { id: "dashboard-integration", npmScript: "verify:dashboard-integration", file: "scripts/verify-dashboard-integration.ts", group: "dashboard-integration", required: true },
  // command center
  { id: "command-center", npmScript: "verify:command-center", file: "scripts/verify-command-center.ts", group: "command-center", required: true },
  // dashboard shell
  { id: "dashboard-shell", npmScript: "verify:dashboard-shell", file: "scripts/verify-dashboard-shell.ts", group: "dashboard-shell", required: true },
  // enterprise landing
  { id: "enterprise-landing", npmScript: "verify:enterprise-landing", file: "scripts/verify-enterprise-landing.ts", group: "enterprise-landing", required: true },
  // rollout readiness
  { id: "rollout-readiness", npmScript: "verify:rollout-readiness", file: "scripts/verify-rollout-readiness.ts", group: "rollout-readiness", required: true },
  // production rollout launch
  { id: "rollout", npmScript: "verify:rollout", file: "scripts/verify-production-rollout.ts", group: "rollout", required: true },
  // production go-live
  { id: "go-live", npmScript: "verify:go-live", file: "scripts/verify-production-go-live.ts", group: "go-live", required: true },
  // launch closure
  { id: "launch-closure", npmScript: "verify:launch-closure", file: "scripts/verify-launch-closure.ts", group: "launch-closure", required: true },
  // archival
  { id: "archival", npmScript: "verify:archival", file: "scripts/verify-archival.ts", group: "archival", required: true },
  // retention
  { id: "retention", npmScript: "verify:retention", file: "scripts/verify-retention.ts", group: "retention", required: true },
  // lifecycle
  { id: "lifecycle", npmScript: "verify:lifecycle", file: "scripts/verify-lifecycle.ts", group: "lifecycle", required: true },
  // preservation closure
  { id: "preservation-closure", npmScript: "verify:preservation-closure", file: "scripts/verify-preservation-closure.ts", group: "preservation-closure", required: true },
  // V3.7 FINAL production release
  { id: "production-freeze", npmScript: "verify:production-freeze", file: "scripts/verify-production-freeze.ts", group: "production-release", required: true },
  { id: "release-baseline", npmScript: "verify:release-baseline", file: "scripts/verify-release-baseline.ts", group: "production-release", required: true },
  { id: "freeze-integrity", npmScript: "verify:freeze-integrity", file: "scripts/verify-freeze-integrity.ts", group: "production-release", required: true },
  { id: "release-snapshot", npmScript: "verify:release-snapshot", file: "scripts/verify-release-snapshot.ts", group: "production-release", required: true },
  { id: "release-governance", npmScript: "verify:release-governance", file: "scripts/verify-release-governance.ts", group: "production-release", required: true },
  { id: "production-operations", npmScript: "verify:production-operations", file: "scripts/verify-production-operations.ts", group: "production-operations", required: true },
];

export function verifyEntriesForGroup(group: VerifyGroup): VerifyScriptEntry[] {
  return VERIFY_REGISTRY.filter((entry) => entry.group === group);
}

export function verifyNpmScriptsForGroup(group: VerifyGroup): string[] {
  return verifyEntriesForGroup(group).map((entry) => entry.npmScript);
}

export function allVerifyNpmScripts(): string[] {
  return VERIFY_REGISTRY.map((entry) => entry.npmScript);
}
