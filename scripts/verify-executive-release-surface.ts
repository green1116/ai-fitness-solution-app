/**
 * V3.4-E11 Executive Release Surface Runtime 冒烟验证
 */
import {
  buildExecutiveReleaseSurface,
  buildReleaseManifestLines,
  EXECUTIVE_RELEASE_SURFACE_RUNTIME_CONTRACT,
  runExecutiveApprovalGateRuntime,
  runExecutiveOversightRuntime,
  runExecutiveReleaseSurfaceRuntime,
  runExternalEvidenceRuntime,
  runTenderGovernanceRuntime,
  summarizeExecutiveReleaseSurface,
  toDownloadSurfaceHeaders,
  toPdfMetadataKeywords,
} from "../lib/evidence";
import { runEvidenceCoverageRuntime } from "../lib/evidence/coverage";
import { runTenderAuditRuntime } from "../lib/evidence/audit";
import { runTenderDecisionRuntime } from "../lib/evidence/decision";
import { runTenderValidationRuntime } from "../lib/evidence/validation";
import { buildFixtureLinking } from "./helpers/evidence-fixture";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function testBuildSurface() {
  assert(
    EXECUTIVE_RELEASE_SURFACE_RUNTIME_CONTRACT.pipeline.join("→") ===
      "map_gate→build_labels→build_manifest→surface_adapters→debug",
    "surface contract",
  );

  const { requirements, linking, registry, attachments, ocrDocuments } =
    await buildFixtureLinking();
  const coverageRuntime = runEvidenceCoverageRuntime({ requirements, linking });
  const tenderValidation = runTenderValidationRuntime({
    document: { documentId: "surf-doc-1" },
    requirements,
    coverageRuntime,
    linking,
    registry,
    attachments,
  });
  const tenderAudit = runTenderAuditRuntime({
    runId: "surf-run-1",
    documentId: "surf-doc-1",
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
    runId: "surf-run-1",
    documentId: "surf-doc-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    linking,
  });
  const tenderGovernance = runTenderGovernanceRuntime({
    runId: "surf-run-1",
    documentId: "surf-doc-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
  });
  const executiveOversight = runExecutiveOversightRuntime({
    runId: "surf-run-1",
    documentId: "surf-doc-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
    tenderGovernance,
    linking,
    ocrDocuments,
  });
  const gate = runExecutiveApprovalGateRuntime({
    runId: "surf-run-1",
    documentId: "surf-doc-1",
    executiveOversight,
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
    tenderGovernance,
    linking,
    ocrDocuments,
  });

  const pkg = buildExecutiveReleaseSurface({
    executiveApprovalGate: gate,
    executiveOversight,
    runId: "surf-run-1",
    documentId: "surf-doc-1",
  });

  assert(pkg.version === "3.4-e11", "version");
  assert(pkg.labels.length >= 4, "labels");
  assert(pkg.manifest.lines.length >= 8, "manifest lines");
  assert(toPdfMetadataKeywords(pkg).some((k) => k.includes("ExecutiveGate")), "pdf keywords");
  assert(toDownloadSurfaceHeaders(pkg)["x-executive-releasable"] !== undefined, "download headers");

  const surface = runExecutiveReleaseSurfaceRuntime({
    runId: "surf-run-1",
    documentId: "surf-doc-1",
    executiveApprovalGate: gate,
    executiveOversight,
  });

  assert(surface.delivery.releasable === pkg.releasable, "delivery envelope");
  assert(surface.debug.summary.includes("[ExecutiveReleaseSurfaceRuntime]"), "debug");

  const manifestSection = buildReleaseManifestLines(pkg).join("\n");
  assert(manifestSection.includes("executiveGateStatus="), "manifest section");

  console.log("✓ buildExecutiveReleaseSurface (V3.4-E11)");
  console.log(" ", summarizeExecutiveReleaseSurface(surface));
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
    tenderDocument: { documentId: "surf-bid-001", tenderTitle: "释放面测试" },
  });

  assert(result.ok, "runtime ok");
  if (!result.ok) return;

  const surf = result.executiveReleaseSurface;
  assert(surf?.version === "3.4-e11", "executiveReleaseSurface");
  assert(surf.decision === "release" || surf.decision === "conditional-release", "release decision");
  assert(surf.manifest.lines.length > 0, "manifest");
  assert(surf.delivery.pdfKeywords.length > 0, "pdf keywords in delivery");

  console.log("✓ Full pipeline release surface");
  console.log("  decision:", surf.decision);
  console.log("  labels:", surf.labels.join(", "));
}

async function main() {
  await testBuildSurface();
  await testFullPipeline();
  console.log("\nAll executive release surface checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
