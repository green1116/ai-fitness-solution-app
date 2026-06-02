/**
 * V3.4-E13 Runtime Correlation Intelligence 冒烟验证
 */
import {
  buildRuntimeCorrelation,
  RUNTIME_CORRELATION_INTELLIGENCE_CONTRACT,
  runExecutiveApprovalGateRuntime,
  runExecutiveOversightRuntime,
  runExecutiveReleaseSurfaceRuntime,
  runExternalEvidenceRuntime,
  runRuntimeCorrelationIntelligence,
  runTenderGovernanceRuntime,
} from "../lib/evidence";
import { runEvidenceCoverageRuntime } from "../lib/evidence/coverage";
import { runTenderAuditRuntime } from "../lib/evidence/audit";
import { runTenderDecisionRuntime } from "../lib/evidence/decision";
import { runTenderValidationRuntime } from "../lib/evidence/validation";
import { buildFixtureLinking } from "./helpers/evidence-fixture";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function testCorrelationFromFixture() {
  assert(
    RUNTIME_CORRELATION_INTELLIGENCE_CONTRACT.pipeline.join("→") ===
      "collect_runtime_state→build_dependency_edges→resolve_critical_paths→correlation_warnings→debug",
    "contract",
  );

  const { requirements, linking, registry, attachments, ocrDocuments } =
    await buildFixtureLinking();
  const coverageRuntime = runEvidenceCoverageRuntime({ requirements, linking });
  const tenderValidation = runTenderValidationRuntime({
    document: { documentId: "corr-1" },
    requirements,
    coverageRuntime,
    linking,
    registry,
    attachments,
  });
  const tenderAudit = runTenderAuditRuntime({
    runId: "corr-1",
    documentId: "corr-1",
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
    runId: "corr-1",
    documentId: "corr-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    linking,
  });
  const tenderGovernance = runTenderGovernanceRuntime({
    runId: "corr-1",
    documentId: "corr-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
  });
  const executiveOversight = runExecutiveOversightRuntime({
    runId: "corr-1",
    documentId: "corr-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
    tenderGovernance,
    linking,
    ocrDocuments,
  });
  const gate = runExecutiveApprovalGateRuntime({
    runId: "corr-1",
    documentId: "corr-1",
    executiveOversight,
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
    tenderGovernance,
    linking,
    ocrDocuments,
  });
  const surface = runExecutiveReleaseSurfaceRuntime({
    runId: "corr-1",
    documentId: "corr-1",
    executiveOversight,
    executiveApprovalGate: gate,
  });

  const pkg = buildRuntimeCorrelation({
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderGovernance,
    executiveOversight,
    executiveApprovalGate: gate,
    executiveReleaseSurface: surface,
    linking,
    ocrDocuments,
  });

  assert(pkg.version === "3.4-e13", "version");
  assert(pkg.edges.length > 0, "edges");
  assert(pkg.edges.every((e) => e.deterministic === true), "deterministic");
  assert(pkg.affectedRuntimeCount >= 2, "affected count");
  assert(pkg.debug.summary.includes("[RuntimeCorrelationIntelligence]"), "debug");

  const hasGovernanceGate = pkg.edges.some(
    (e) => e.source === "governance" && e.target === "gate",
  );
  const hasGateRelease = pkg.edges.some(
    (e) => e.source === "gate" && e.target === "release",
  );
  assert(hasGovernanceGate || hasGateRelease, "governance/gate chain");

  const corr = runRuntimeCorrelationIntelligence({
    runId: "corr-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderGovernance,
    executiveOversight,
    executiveApprovalGate: gate,
    executiveReleaseSurface: surface,
    linking,
    ocrDocuments,
  });

  assert(corr.edges.length === pkg.edges.length, "wrapper edges");

  console.log("✓ buildRuntimeCorrelation (V3.4-E13)");
  console.log(" ", `edges=${corr.edges.length} paths=${corr.criticalPaths.length}`);
  if (corr.criticalPaths[0]) {
    console.log(" ", corr.criticalPaths[0]);
  }
}

async function testFullPipeline() {
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
    tenderDocument: { documentId: "corr-bid", tenderTitle: "关联测试" },
  });

  assert(result.ok, "runtime ok");
  if (!result.ok) return;

  const corr = result.runtimeCorrelation;
  assert(corr?.version === "3.4-e13", "runtimeCorrelation");
  const runtimeCorrelation = corr;
  if (!runtimeCorrelation) return;
  assert(runtimeCorrelation.edges.length > 0, "pipeline edges");

  const hasExecutiveRelease = runtimeCorrelation.edges.some(
    (e) => e.source === "executive" && e.target === "gate",
  );
  assert(hasExecutiveRelease, "executive→gate on approve path");

  console.log("✓ Full pipeline runtime correlation");
  console.log("  warnings:", runtimeCorrelation.correlationWarnings.length);
}

async function testBlockPathCorrelation() {
  const { requirements, linking, registry } = await buildFixtureLinking();
  const coverageRuntime = runEvidenceCoverageRuntime({ requirements, linking });
  const tenderValidation = runTenderValidationRuntime({
    document: { documentId: "corr-block" },
    requirements,
    coverageRuntime,
    linking,
    registry,
    attachments: [],
    policy: { requireAttachments: true },
  });
  const tenderGovernance = runTenderGovernanceRuntime({
    runId: "corr-block",
    documentId: "corr-block",
    coverageRuntime,
    tenderValidation,
    policy: { haltOnCriticalRisk: true },
  });
  const oversight = runExecutiveOversightRuntime({
    runId: "corr-block",
    documentId: "corr-block",
    coverageRuntime,
    tenderValidation,
    tenderGovernance,
    linking,
  });
  const gate = runExecutiveApprovalGateRuntime({
    runId: "corr-block",
    documentId: "corr-block",
    executiveOversight: oversight,
    coverageRuntime,
    tenderValidation,
    tenderGovernance,
    linking,
  });

  const corr = buildRuntimeCorrelation({
    coverageRuntime,
    tenderValidation,
    tenderGovernance,
    executiveOversight: oversight,
    executiveApprovalGate: gate,
    linking,
  });

  assert(
    corr.edges.some((e) => e.target === "gate" && e.impact === "critical"),
    "critical to gate",
  );
  assert(corr.correlationWarnings.length > 0, "warnings");

  console.log("✓ Block path correlation");
}

async function main() {
  await testCorrelationFromFixture();
  await testFullPipeline();
  await testBlockPathCorrelation();
  console.log("\nAll runtime correlation intelligence checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
