/**
 * V3.4-E12 Executive Runtime Visualization 冒烟验证
 */
import {
  buildRuntimeVisualization,
  EXECUTIVE_RUNTIME_VISUALIZATION_CONTRACT,
  runExecutiveApprovalGateRuntime,
  runExecutiveOversightRuntime,
  runExecutiveReleaseSurfaceRuntime,
  runExecutiveRuntimeVisualization,
  runExternalEvidenceRuntime,
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

async function testVisualizationFromGate() {
  assert(
    EXECUTIVE_RUNTIME_VISUALIZATION_CONTRACT.pipeline.join("→") ===
      "collect_runtime→build_metrics→build_panel→build_pipeline_stages→debug",
    "contract",
  );

  const { requirements, linking, registry, attachments, ocrDocuments } =
    await buildFixtureLinking();
  const coverageRuntime = runEvidenceCoverageRuntime({ requirements, linking });
  const tenderValidation = runTenderValidationRuntime({
    document: { documentId: "viz-1" },
    requirements,
    coverageRuntime,
    linking,
    registry,
    attachments,
  });
  const tenderAudit = runTenderAuditRuntime({
    runId: "viz-1",
    documentId: "viz-1",
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
    runId: "viz-1",
    documentId: "viz-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    linking,
  });
  const tenderGovernance = runTenderGovernanceRuntime({
    runId: "viz-1",
    documentId: "viz-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
  });
  const executiveOversight = runExecutiveOversightRuntime({
    runId: "viz-1",
    documentId: "viz-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
    tenderGovernance,
    linking,
    ocrDocuments,
  });
  const gate = runExecutiveApprovalGateRuntime({
    runId: "viz-1",
    documentId: "viz-1",
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
    runId: "viz-1",
    documentId: "viz-1",
    executiveOversight,
    executiveApprovalGate: gate,
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
    tenderGovernance,
    linking,
    ocrDocuments,
  });

  const pkg = buildRuntimeVisualization({
    runId: "viz-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
    tenderGovernance,
    executiveOversight,
    executiveApprovalGate: gate,
    executiveReleaseSurface: surface,
    linking,
    ocrDocuments,
  });

  assert(pkg.version === "3.4-e12", "version");
  assert(pkg.metrics.length === 6, "six metrics");
  assert(pkg.pipeline.length === 10, "ten pipeline stages");
  assert(pkg.debug.summary.includes("[ExecutiveRuntimeVisualization]"), "debug");

  const viz = runExecutiveRuntimeVisualization({
    runId: "viz-1",
    documentId: "viz-1",
    executiveApprovalGate: gate,
    executiveOversight,
    executiveReleaseSurface: surface,
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
    tenderGovernance,
    linking,
    ocrDocuments,
  });

  assert(viz.executiveGate === pkg.executiveGate, "gate match");
  assert(viz.delivery.releasable === pkg.releasable, "delivery");

  console.log("✓ buildRuntimeVisualization (V3.4-E12)");
  console.log(
    " ",
    `score=${viz.executiveScore} gate=${viz.executiveGate} decision=${viz.releaseDecision}`,
  );
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
    tenderDocument: { documentId: "viz-bid", tenderTitle: "可视化测试" },
  });

  assert(result.ok, "runtime ok");
  if (!result.ok) return;

  const viz = result.executiveRuntimeVisualization;
  assert(viz?.version === "3.4-e12", "visualization on runtime");
  assert(viz.metrics.length >= 6, "metrics");
  assert(viz.pipeline.length >= 10, "pipeline");
  assert(viz.releasable === true || viz.releasable === false, "releasable bool");

  console.log("✓ Full pipeline executive visualization");
  console.log("  releasable:", viz.releasable);
  console.log("  findings:", viz.findings.length);
}

async function main() {
  await testVisualizationFromGate();
  await testFullPipeline();
  console.log("\nAll executive runtime visualization checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
