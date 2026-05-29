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
  | "production-operations"
  | "operational-intelligence"
  | "operational-governance"
  | "operational-rulebook"
  | "operational-policy-pack"
  | "operational-orchestration"
  | "operational-lifecycle"
  | "operational-persistence"
  | "operational-store"
  | "operational-recovery"
  | "operational-incident-recovery-profile"
  | "operational-incident-recovery-profile-config"
  | "operational-incident-recovery-profile-json-source"
  | "operational-incident-recovery-profile-json-schema-guard"
  | "operational-incident-recovery-profile-json-schema-evolution"
  | "operational-incident-recovery-profile-migration-rule-registry"
  | "operational-incident-recovery-profile-rendering-policy"
  | "operational-incident-recovery-profile-migration-execution"
  | "operational-incident-recovery-profile-canonical-contract"
  | "operational-incident-recovery-profile-external-consumer-registry"
  | "operational-incident-recovery-profile-external-consumer-registry-config"
  | "operational-incident-recovery-profile-external-consumer-registry-source-adapter"
  | "consumer-capability-negotiation"
  | "federation-runtime"
  | "federation-consensus"
  | "federation-policy-propagation"
  | "federation-lifecycle-continuity"
  | "federation-observability"
  | "governance-intelligence"
  | "governance-autonomous"
  | "governance-self-optimization"
  | "governance-meta-governance"
  | "governance-platform-baseline"
  | "operational-autonomous-execution"
  | "autonomous-change-management"
  | "autonomous-incident-management"
  | "autonomous-recovery-orchestration"
  | "autonomous-operations-center"
  | "autonomous-command-platform"
  | "command-execution-bridge"
  | "command-hitl";

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
  "operational-intelligence": "V4-A2 operational intelligence runtime",
  "operational-governance": "V4-A3 operational governance runtime",
  "operational-rulebook": "V4-A3-R2 operational governance rulebook runtime",
  "operational-policy-pack": "V4-A3-R3 operational governance policy pack runtime",
  "operational-orchestration": "V4-A3-R4 operational governance orchestration runtime",
  "operational-lifecycle": "V4-A3-R5 operational governance lifecycle runtime",
  "operational-persistence": "V4-A3-R6 operational governance persistence runtime",
  "operational-store": "V4-A3-R7 operational governance store adapter runtime",
  "operational-recovery": "V4-A3-R8 operational governance recovery runtime",
  "operational-incident-recovery-profile": "V4-A3-R9 operational governance incident recovery profile runtime",
  "operational-incident-recovery-profile-config":
    "V4-A3-R9.1 operational governance incident recovery profile config runtime",
  "operational-incident-recovery-profile-json-source":
    "V4-A3-R9.1.1 operational governance incident recovery profile json source runtime",
  "operational-incident-recovery-profile-json-schema-guard":
    "V4-A3-R9.1.2 operational governance incident recovery profile json schema guard runtime",
  "operational-incident-recovery-profile-json-schema-evolution":
    "V4-A3-R9.1.3 operational governance incident recovery profile json schema evolution runtime",
  "operational-incident-recovery-profile-migration-rule-registry":
    "V4-A3-R9.1.4 operational governance incident recovery profile migration rule registry runtime",
  "operational-incident-recovery-profile-rendering-policy":
    "V4-A3-R9.1.4 operational governance incident recovery profile rendering policy runtime",
  "operational-incident-recovery-profile-migration-execution":
    "V4-A3-R9.1.5 operational governance incident recovery profile migration execution runtime",
  "operational-incident-recovery-profile-canonical-contract":
    "V4-A3-R9.1.6 operational governance incident recovery profile canonical contract runtime",
  "operational-incident-recovery-profile-external-consumer-registry":
    "V4-A3-R9.1.7 operational governance incident recovery profile external consumer registry runtime",
  "operational-incident-recovery-profile-external-consumer-registry-config":
    "V4-A3-R9.1.8 operational governance incident recovery profile external consumer registry config runtime",
  "operational-incident-recovery-profile-external-consumer-registry-source-adapter":
    "V4-A3-R9.1.9 operational governance incident recovery profile external consumer registry source adapter runtime",
  "consumer-capability-negotiation":
    "V4-A3-R9.2 operational governance consumer capability negotiation runtime",
  "federation-runtime":
    "V4-A3-R9.3 operational governance federation runtime",
  "federation-consensus":
    "V4-A3-R9.4 operational governance federation consensus runtime",
  "federation-policy-propagation":
    "V4-A3-R9.5 operational governance federation policy propagation runtime",
  "federation-lifecycle-continuity":
    "V4-A3-R9.6 operational governance federation lifecycle continuity runtime",
  "federation-observability":
    "V4-A3-R10 operational governance federation observability runtime",
  "governance-intelligence":
    "V4-A3-R11 operational governance intelligence runtime",
  "governance-autonomous":
    "V4-A3-R12 operational governance autonomous runtime",
  "governance-self-optimization":
    "V4-A3-R13 operational governance self-optimization runtime",
  "governance-meta-governance":
    "V4-A3-R14 operational governance meta-governance runtime",
  "governance-platform-baseline":
    "V4-A3-FINAL governance platform baseline freeze",
  "operational-autonomous-execution":
    "V4-A4-A1 operational autonomous execution runtime",
  "autonomous-change-management":
    "V4-A4-A2 autonomous change management runtime",
  "autonomous-incident-management":
    "V4-A4-A3 autonomous incident management runtime",
  "autonomous-recovery-orchestration":
    "V4-A4-A4 autonomous recovery orchestration runtime",
  "autonomous-operations-center":
    "V4-A4-A5 autonomous operations center",
  "autonomous-command-platform":
    "V4-A5 autonomous command platform",
  "command-execution-bridge":
    "V4-A5-A1 command execution bridge",
  "command-hitl":
    "V4-A5-A2 human-in-the-loop command control",
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
  { id: "operational-intelligence", npmScript: "verify:operational-intelligence", file: "scripts/verify-operational-intelligence.ts", group: "operational-intelligence", required: true },
  { id: "operational-governance", npmScript: "verify:operational-governance", file: "scripts/verify-operational-governance.ts", group: "operational-governance", required: true },
  { id: "operational-rulebook", npmScript: "verify:operational-rulebook", file: "scripts/verify-operational-rulebook.ts", group: "operational-rulebook", required: true },
  { id: "operational-policy-pack", npmScript: "verify:operational-policy-pack", file: "scripts/verify-operational-policy-pack.ts", group: "operational-policy-pack", required: true },
  { id: "operational-orchestration", npmScript: "verify:operational-orchestration", file: "scripts/verify-operational-orchestration.ts", group: "operational-orchestration", required: true },
  { id: "operational-lifecycle", npmScript: "verify:operational-lifecycle", file: "scripts/verify-operational-lifecycle.ts", group: "operational-lifecycle", required: true },
  { id: "operational-persistence", npmScript: "verify:operational-persistence", file: "scripts/verify-operational-persistence.ts", group: "operational-persistence", required: true },
  { id: "operational-store", npmScript: "verify:operational-store", file: "scripts/verify-operational-store.ts", group: "operational-store", required: true },
  { id: "operational-recovery", npmScript: "verify:operational-recovery", file: "scripts/verify-operational-recovery.ts", group: "operational-recovery", required: true },
  { id: "operational-incident-recovery-profile", npmScript: "verify:operational-incident-recovery-profile", file: "scripts/verify-operational-incident-recovery-profile.ts", group: "operational-incident-recovery-profile", required: true },
  { id: "operational-incident-recovery-profile-config", npmScript: "verify:operational-incident-recovery-profile-config", file: "scripts/verify-operational-incident-recovery-profile-config.ts", group: "operational-incident-recovery-profile-config", required: true },
  { id: "operational-incident-recovery-profile-json-source", npmScript: "verify:operational-incident-recovery-profile-json-source", file: "scripts/verify-operational-incident-recovery-profile-json-source.ts", group: "operational-incident-recovery-profile-json-source", required: true },
  { id: "operational-incident-recovery-profile-json-schema-guard", npmScript: "verify:operational-incident-recovery-profile-json-schema-guard", file: "scripts/verify-operational-incident-recovery-profile-json-schema-guard.ts", group: "operational-incident-recovery-profile-json-schema-guard", required: true },
  { id: "operational-incident-recovery-profile-json-schema-evolution", npmScript: "verify:operational-incident-recovery-profile-json-schema-evolution", file: "scripts/verify-operational-incident-recovery-profile-json-schema-evolution.ts", group: "operational-incident-recovery-profile-json-schema-evolution", required: true },
  { id: "operational-incident-recovery-profile-migration-rule-registry", npmScript: "verify:operational-incident-recovery-profile-migration-rule-registry", file: "scripts/verify-operational-incident-recovery-profile-migration-rule-registry.ts", group: "operational-incident-recovery-profile-migration-rule-registry", required: true },
  { id: "operational-incident-recovery-profile-rendering-policy", npmScript: "verify:operational-incident-recovery-profile-rendering-policy", file: "scripts/verify-operational-incident-recovery-profile-rendering-policy.ts", group: "operational-incident-recovery-profile-rendering-policy", required: true },
  { id: "operational-incident-recovery-profile-migration-execution", npmScript: "verify:operational-incident-recovery-profile-migration-execution", file: "scripts/verify-operational-incident-recovery-profile-migration-execution.ts", group: "operational-incident-recovery-profile-migration-execution", required: true },
  { id: "operational-incident-recovery-profile-canonical-contract", npmScript: "verify:operational-incident-recovery-profile-canonical-contract", file: "scripts/verify-operational-incident-recovery-profile-canonical-contract.ts", group: "operational-incident-recovery-profile-canonical-contract", required: true },
  { id: "operational-incident-recovery-profile-external-consumer-registry", npmScript: "verify:operational-incident-recovery-profile-external-consumer-registry", file: "scripts/verify-operational-incident-recovery-profile-external-consumer-registry.ts", group: "operational-incident-recovery-profile-external-consumer-registry", required: true },
  { id: "operational-incident-recovery-profile-external-consumer-registry-config", npmScript: "verify:operational-incident-recovery-profile-external-consumer-registry-config", file: "scripts/verify-operational-incident-recovery-profile-external-consumer-registry-config.ts", group: "operational-incident-recovery-profile-external-consumer-registry-config", required: true },
  { id: "operational-incident-recovery-profile-external-consumer-registry-source-adapter", npmScript: "verify:operational-incident-recovery-profile-external-consumer-registry-source-adapter", file: "scripts/verify-operational-incident-recovery-profile-external-consumer-registry-source-adapter.ts", group: "operational-incident-recovery-profile-external-consumer-registry-source-adapter", required: true },
  { id: "consumer-capability-negotiation", npmScript: "verify:consumer-capability-negotiation", file: "scripts/verify-consumer-capability-negotiation.ts", group: "consumer-capability-negotiation", required: true },
  { id: "federation-runtime", npmScript: "verify:federation-runtime", file: "scripts/verify-federation-runtime.ts", group: "federation-runtime", required: true },
  { id: "federation-consensus", npmScript: "verify:federation-consensus", file: "scripts/verify-federation-consensus.ts", group: "federation-consensus", required: true },
  { id: "federation-policy-propagation", npmScript: "verify:federation-policy-propagation", file: "scripts/verify-federation-policy-propagation.ts", group: "federation-policy-propagation", required: true },
  { id: "federation-lifecycle-continuity", npmScript: "verify:federation-lifecycle-continuity", file: "scripts/verify-federation-lifecycle-continuity.ts", group: "federation-lifecycle-continuity", required: true },
  { id: "federation-observability", npmScript: "verify:federation-observability", file: "scripts/verify-federation-observability.ts", group: "federation-observability", required: true },
  { id: "governance-intelligence", npmScript: "verify:governance-intelligence", file: "scripts/verify-governance-intelligence.ts", group: "governance-intelligence", required: true },
  { id: "governance-autonomous", npmScript: "verify:governance-autonomous", file: "scripts/verify-governance-autonomous.ts", group: "governance-autonomous", required: true },
  { id: "governance-self-optimization", npmScript: "verify:governance-self-optimization", file: "scripts/verify-governance-self-optimization.ts", group: "governance-self-optimization", required: true },
  { id: "governance-meta-governance", npmScript: "verify:governance-meta-governance", file: "scripts/verify-governance-meta-governance.ts", group: "governance-meta-governance", required: true },
  { id: "governance-platform-baseline", npmScript: "verify:governance-platform-baseline", file: "scripts/verify-governance-platform-baseline.ts", group: "governance-platform-baseline", required: true },
  { id: "operational-autonomous-execution", npmScript: "verify:operational-autonomous-execution", file: "scripts/verify-operational-autonomous-execution.ts", group: "operational-autonomous-execution", required: true },
  { id: "autonomous-change-management", npmScript: "verify:autonomous-change-management", file: "scripts/verify-autonomous-change-management.ts", group: "autonomous-change-management", required: true },
  { id: "autonomous-incident-management", npmScript: "verify:autonomous-incident-management", file: "scripts/verify-autonomous-incident-management.ts", group: "autonomous-incident-management", required: true },
  { id: "autonomous-recovery-orchestration", npmScript: "verify:autonomous-recovery-orchestration", file: "scripts/verify-autonomous-recovery-orchestration.ts", group: "autonomous-recovery-orchestration", required: true },
  { id: "autonomous-operations-center", npmScript: "verify:autonomous-operations-center", file: "scripts/verify-autonomous-operations-center.ts", group: "autonomous-operations-center", required: true },
  { id: "autonomous-command-platform", npmScript: "verify:autonomous-command-platform", file: "scripts/verify-autonomous-command-platform.ts", group: "autonomous-command-platform", required: true },
  { id: "command-execution-bridge", npmScript: "verify:command-execution-bridge", file: "scripts/verify-command-execution-bridge.ts", group: "command-execution-bridge", required: true },
  { id: "command-hitl", npmScript: "verify:command-hitl", file: "scripts/verify-command-hitl.ts", group: "command-hitl", required: true },
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
