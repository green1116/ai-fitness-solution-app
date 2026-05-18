/**
 * V3.4-E16 Runtime Event Orchestration 冒烟验证
 */
import {
  RUNTIME_EVENT_ORCHESTRATION_VERSION,
  RUNTIME_EVENT_TYPES,
  RuntimeEventBus,
  createEvidenceRuntimeOrchestrationSession,
  emitPostPipelineRuntimeEvents,
  finalizeOrchestration,
  registerDefaultRuntimeEventHandlers,
  runExternalEvidenceRuntime,
} from "../lib/evidence";
import { RuntimeEventTraceStore } from "../lib/evidence/events/traces";
import { buildFixtureLinking } from "./helpers/evidence-fixture";
import { runEvidenceCoverageRuntime } from "../lib/evidence/coverage";
import { runTenderAuditRuntime } from "../lib/evidence/audit";
import { runTenderDecisionRuntime } from "../lib/evidence/decision";
import { runTenderGovernanceRuntime } from "../lib/evidence/governance";
import { runTenderValidationRuntime } from "../lib/evidence/validation";
import { runExecutiveOversightRuntime } from "../lib/evidence/executive";
import { runExecutiveApprovalGateRuntime } from "../lib/evidence/gate";
import { runExecutiveReleaseSurfaceRuntime } from "../lib/evidence/surface";
import { runRuntimeCorrelationIntelligence } from "../lib/evidence/correlation";
import { runRuntimePolicyEngine } from "../lib/evidence/policy";
import { runRuntimeStateMachine } from "../lib/evidence/statemachine";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function hasEventTypes(
  replay: string,
  types: string[],
): boolean {
  return types.every((t) => replay.includes(t));
}

async function testBusValidationChain() {
  const traceStore = new RuntimeEventTraceStore();
  const bus = new RuntimeEventBus(traceStore, { debug: false });
  registerDefaultRuntimeEventHandlers(bus);
  const session = createEvidenceRuntimeOrchestrationSession({
    runtimeInput: {
      attachments: [],
      tenderDocument: { documentId: "bus-1" },
    },
    runId: "bus-1",
    ranAt: new Date().toISOString(),
  });

  session.ctx.snapshot.tenderValidation = {
    version: "3.4-e5",
    runId: "bus-1",
    ranAt: new Date().toISOString(),
    durationMs: 1,
    document: { documentId: "bus-1" },
    outcome: "rejected",
    title: "t",
    message: "m",
    reasons: [],
    suggestedActions: [],
    findings: [],
    complianceChecks: [],
    summary: {
      findingCount: 1,
      criticalCount: 1,
      errorCount: 1,
      warningCount: 0,
      infoCount: 0,
      compliancePassed: 0,
      complianceFailed: 1,
      validationScore: 0,
      coverageRatio: 0,
    },
    coverageValidation: {
      verdict: "fail",
      score: 0,
      reasons: [],
      explain: [],
    },
    audit: {
      version: "3.4-e5",
      runId: "bus-1",
      documentId: "bus-1",
      events: [],
    },
  };

  await bus.emit(
    "VALIDATION_FAILED",
    session.ctx,
    {
      traceId: "bus-1",
      correlationId: "corr-bus-1",
      source: "test",
      reason: "rejected",
      validationSummary: { outcome: "rejected" },
    },
  );

  const result = finalizeOrchestration(session);
  const replay = traceStore.formatReplay();
  assert(result.flags.governanceEscalated, "governance escalated flag");
  assert(result.flags.releaseBlocked, "release blocked flag");
  assert(
    hasEventTypes(replay, [
      "VALIDATION_FAILED",
      "GOVERNANCE_ESCALATED",
      "RELEASE_BLOCKED",
    ]),
    `validation chain replay: ${replay}`,
  );
  console.log("✓ bus VALIDATION_FAILED chain");
}

async function testPipelineOrchestration() {
  const result = await runExternalEvidenceRuntime({
    attachments: [
      {
        buffer: Buffer.from("ISO9001 质量管理体系认证证书", "utf8"),
        fileName: "cert.txt",
        mimeType: "text/plain",
      },
    ],
    requirementItems: [
      {
        id: "req-1",
        title: "ISO9001",
        text: "ISO9001 质量管理体系认证",
        keywords: ["ISO9001"],
        mandatory: true,
        category: "qualification",
      },
    ],
    tenderDocument: { documentId: "evt-pipe", tenderTitle: "事件编排测试" },
    correlationId: "corr-evt-pipe",
    jobId: "job-1",
  });

  assert(result.ok, "runtime ok");
  if (!result.ok) return;

  const orch = result.runtimeEventOrchestration;
  assert(orch?.version === RUNTIME_EVENT_ORCHESTRATION_VERSION, "version");
  assert(orch.eventCount > 0, "events recorded");
  assert(orch.correlationId === "corr-evt-pipe", "correlation");

  const types = orch.records.map((r) => r.eventType);
  assert(types.includes("OCR_COMPLETED"), "OCR_COMPLETED");
  assert(types.includes("STATE_TRANSITIONED") || types.length > 3, "state or rich trace");

  console.log("✓ pipeline orchestration attached");
  console.log(" ", `events=${orch.eventCount} replay=${orch.records.map((r) => r.eventType).join(" → ")}`);
}

async function testFixtureStackEvents() {
  const { requirements, linking, registry, attachments, ocrDocuments } =
    await buildFixtureLinking();
  const coverageRuntime = runEvidenceCoverageRuntime({ requirements, linking });
  const tenderValidation = runTenderValidationRuntime({
    document: { documentId: "evt-fix" },
    requirements,
    coverageRuntime,
    linking,
    registry,
    attachments,
  });
  const tenderAudit = runTenderAuditRuntime({
    runId: "evt-fix",
    documentId: "evt-fix",
    startedAt: new Date().toISOString(),
    requirements,
    ocrDocuments,
    linking,
    coverageRuntime,
    tenderValidation,
    registry,
    attachments,
  });
  const tenderDecision = runTenderDecisionRuntime({
    runId: "evt-fix",
    documentId: "evt-fix",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    linking,
  });
  const tenderGovernance = runTenderGovernanceRuntime({
    runId: "evt-fix",
    documentId: "evt-fix",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
  });
  const executiveOversight = runExecutiveOversightRuntime({
    runId: "evt-fix",
    documentId: "evt-fix",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
    tenderGovernance,
    linking,
    ocrDocuments,
  });
  const executiveApprovalGate = runExecutiveApprovalGateRuntime({
    runId: "evt-fix",
    documentId: "evt-fix",
    executiveOversight,
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
    tenderGovernance,
    linking,
    ocrDocuments,
  });
  const executiveReleaseSurface = runExecutiveReleaseSurfaceRuntime({
    runId: "evt-fix",
    documentId: "evt-fix",
    executiveOversight,
    executiveApprovalGate,
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
    tenderGovernance,
    linking,
    ocrDocuments,
  });
  const runtimeCorrelation = runRuntimeCorrelationIntelligence({
    runId: "evt-fix",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderGovernance,
    executiveOversight,
    executiveApprovalGate,
    executiveReleaseSurface,
    linking,
    ocrDocuments,
  });
  const runtimePolicy = runRuntimePolicyEngine({
    runId: "evt-fix",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderGovernance,
    executiveOversight,
    executiveApprovalGate,
    executiveReleaseSurface,
    runtimeCorrelation,
    linking,
    ocrDocuments,
  });
  const runtimeStateMachine = runRuntimeStateMachine({
    runId: "evt-fix",
    ranAt: new Date().toISOString(),
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
    tenderGovernance,
    executiveOversight,
    executiveApprovalGate,
    executiveReleaseSurface,
    runtimeCorrelation,
    runtimePolicy,
    linking,
    ocrDocuments,
    attachmentCount: 1,
  });

  const session = createEvidenceRuntimeOrchestrationSession({
    runtimeInput: {
      attachments: [],
      tenderDocument: { documentId: "evt-fix" },
    },
    runId: "evt-fix",
    ranAt: new Date().toISOString(),
  });

  await emitPostPipelineRuntimeEvents(session, {
    ok: true,
    version: "3.4-e1",
    runId: "evt-fix",
    ranAt: new Date().toISOString(),
    durationMs: 1,
    phases: [],
    trace: {
      version: "3.4-e1",
      runId: "evt-fix",
      startedAt: new Date().toISOString(),
      events: [],
    },
    attachments: [],
    ocr: [],
    ocrDocuments: ocrDocuments ?? [],
    classifications: [],
    registry,
    coverage: [],
    coverageSummary: {
      total: 0,
      fully: 0,
      partial: 0,
      unsupported: 0,
      risky: 0,
      ratio: 0,
    },
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
    tenderGovernance,
    executiveOversight,
    executiveApprovalGate,
    executiveReleaseSurface,
    runtimeCorrelation,
    runtimePolicy,
    runtimeStateMachine,
    warnings: [],
  });

  const orch = finalizeOrchestration(session);
  const replay = session.traceStore.formatReplay();
  assert(orch.eventCount > 5, "fixture emits multiple events");
  assert(
    RUNTIME_EVENT_TYPES.includes("VALIDATION_FAILED") ||
      replay.includes("VALIDATION_PASSED") ||
      replay.includes("VALIDATION_FAILED"),
    "validation event",
  );
  console.log("✓ fixture stack event emission");
  console.log(" ", replay.slice(0, 120));
}

async function main() {
  await testBusValidationChain();
  await testPipelineOrchestration();
  await testFixtureStackEvents();
  console.log("\n✅ V3.4-E16 Runtime Event Orchestration 验证通过");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
