/**
 * V3.4-E17 Runtime Event Intelligence 冒烟验证
 */
import {
  RUNTIME_EVENT_INTELLIGENCE_VERSION,
  RuntimeEventBus,
  buildRuntimeEventIntelligence,
  createEvidenceRuntimeOrchestrationSession,
  emitPostPipelineRuntimeEvents,
  finalizeOrchestration,
  registerDefaultRuntimeEventHandlers,
  runExternalEvidenceRuntime,
} from "../lib/evidence";
import { RuntimeEventTraceStore } from "../lib/evidence/events/traces";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function testValidationFailureIntelligence() {
  const traceStore = new RuntimeEventTraceStore();
  const bus = new RuntimeEventBus(traceStore);
  registerDefaultRuntimeEventHandlers(bus);
  const session = createEvidenceRuntimeOrchestrationSession({
    runtimeInput: {
      attachments: [],
      tenderDocument: { documentId: "intel-fail" },
    },
    runId: "intel-fail",
    ranAt: new Date().toISOString(),
  });

  session.ctx.snapshot.tenderValidation = {
    version: "3.4-e5",
    runId: "intel-fail",
    ranAt: new Date().toISOString(),
    durationMs: 1,
    document: { documentId: "intel-fail" },
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
      runId: "intel-fail",
      documentId: "intel-fail",
      events: [],
    },
  };

  await bus.emit(
    "VALIDATION_FAILED",
    session.ctx,
    {
      traceId: "intel-fail",
      correlationId: "corr-intel-fail",
      source: "test",
      reason: "rejected",
    },
  );

  const orchestration = finalizeOrchestration(session);
  const intel = buildRuntimeEventIntelligence({
    orchestration,
    runtimeSnapshot: { validationOutcome: "rejected" },
    priorSnapshots: [{ validationFailures: 2, validationRisk: 30 }],
  });

  assert(intel.version === RUNTIME_EVENT_INTELLIGENCE_VERSION, "version");
  assert(intel.risk.dimensions.validation.score >= 25, "validation risk elevated");
  assert(intel.risk.dimensions.validation.score > 0, "validation risk");
  assert(intel.timeline.failureNodes.length > 0, "failure nodes");
  assert(intel.correlation.edges.length > 0, "correlation edges");
  assert(
    intel.governanceHotspots.hotspots.length >= 0,
    "hotspots",
  );
  assert(intel.health.healthScore <= 100, "health bounded");
  assert(intel.debug.summary.includes("Runtime Health"), "debug summary");

  console.log("✓ validation-failure intelligence");
  console.log(
    " ",
    `risk=${intel.risk.overallScore} health=${intel.health.healthScore} anomalies=${intel.anomalies.length}`,
  );
}

async function testPipelineIntelligence() {
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
    tenderDocument: { documentId: "intel-pipe", tenderTitle: "智能分析测试" },
    correlationId: "corr-intel-pipe",
  });

  assert(result.ok, "runtime ok");
  if (!result.ok) return;

  const intel = result.runtimeEventIntelligence;
  assert(intel?.version === RUNTIME_EVENT_INTELLIGENCE_VERSION, "attached");
  assert(intel.timeline.orderedSteps.length > 0, "timeline");
  assert(intel.timeline.traceId === result.runId, "traceId");
  assert(intel.correlation.relatedGroups.length > 0, "related groups");
  assert(intel.releaseStability.stabilityScore >= 0, "stability");
  assert(intel.health.labels.executiveReadiness.length > 0, "labels");

  const phases = new Set(intel.timeline.orderedSteps.map((s) => s.phase));
  assert(phases.has("ocr") || phases.has("validation"), "lifecycle phases");

  console.log("✓ pipeline intelligence attached");
  console.log(" ", intel.debug.summary.replace(/\n/g, " | "));
}

async function main() {
  await testValidationFailureIntelligence();
  await testPipelineIntelligence();
  console.log("\n✅ V3.4-E17 Runtime Event Intelligence 验证通过");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
