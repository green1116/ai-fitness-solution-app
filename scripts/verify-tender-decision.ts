/**
 * V3.4-E7 Tender Decision Runtime 冒烟验证
 */
import {
  TENDER_DECISION_RUNTIME_CONTRACT,
  runExternalEvidenceRuntime,
  runTenderAuditRuntime,
  runTenderDecisionRuntime,
  summarizeTenderDecision,
} from "../lib/evidence";
import { runEvidenceCoverageRuntime } from "../lib/evidence/coverage";
import { runTenderValidationRuntime } from "../lib/evidence/validation";
import { buildFixtureLinking } from "./helpers/evidence-fixture";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function testDecisionRuntime() {
  assert(
    TENDER_DECISION_RUNTIME_CONTRACT.pipeline.join("→") ===
      "collect_inputs→build_factors→resolve_status→decision_result",
    "decision contract",
  );

  const { requirements, linking, registry, attachments, ocrDocuments } =
    await buildFixtureLinking();
  const coverageRuntime = runEvidenceCoverageRuntime({ requirements, linking });
  const tenderValidation = runTenderValidationRuntime({
    document: { documentId: "dec-doc-1" },
    requirements,
    coverageRuntime,
    linking,
    registry,
    attachments,
  });
  const tenderAudit = runTenderAuditRuntime({
    runId: "dec-run-1",
    documentId: "dec-doc-1",
    startedAt: new Date().toISOString(),
    requirements,
    ocrDocuments,
    linking,
    coverageRuntime,
    tenderValidation,
    registry,
    attachments,
  });

  const decision = runTenderDecisionRuntime({
    runId: "dec-run-1",
    documentId: "dec-doc-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    linking,
  });

  assert(decision.version === "3.4-e7", "version");
  assert(
    ["recommended", "conditional", "high-risk", "rejected"].includes(decision.status),
    "valid status",
  );
  assert(decision.factors.length > 0, "factors");
  assert(decision.confidence > 0 && decision.confidence <= 1, "confidence");
  assert(decision.reasons.length > 0, "reasons");
  assert(decision.trace.events.length >= 4, "trace");

  console.log("✓ Tender Decision Runtime (V3.4-E7)");
  console.log(" ", summarizeTenderDecision(decision));
  console.log("  factors:", decision.factors.length);
}

async function testRecommendedPath() {
  const result = await runExternalEvidenceRuntime({
    attachments: [
      {
        buffer: Buffer.from("ISO9001 质量管理体系认证证书\n认证范围：健身器材", "utf8"),
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
    tenderDocument: { documentId: "bid-dec-001" },
  });

  assert(result.ok, "runtime ok");
  if (!result.ok) return;
  assert(result.tenderDecision?.version === "3.4-e7", "tenderDecision");
  assert(result.tenderDecision.status === "recommended", "recommended for strong cert");
  assert(result.tenderDecision.confidence >= 0.8, "high confidence");

  console.log("✓ Full pipeline → recommended");
  console.log("  status:", result.tenderDecision.status);
  console.log("  confidence:", result.tenderDecision.confidence);
}

async function testRejectedPath() {
  const { requirements, linking, registry, attachments } = await buildFixtureLinking();
  const coverageRuntime = runEvidenceCoverageRuntime({ requirements, linking });
  const tenderValidation = runTenderValidationRuntime({
    document: { documentId: "dec-fail" },
    requirements,
    coverageRuntime,
    linking,
    registry,
    attachments: [],
    policy: { requireAttachments: true },
  });
  const tenderAudit = runTenderAuditRuntime({
    runId: "dec-fail",
    documentId: "dec-fail",
    startedAt: new Date().toISOString(),
    requirements,
    linking,
    coverageRuntime,
    tenderValidation,
    registry,
    attachments: [],
  });

  const decision = runTenderDecisionRuntime({
    runId: "dec-fail",
    documentId: "dec-fail",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    linking,
  });

  assert(decision.status === "rejected", "rejected when validation fails");
  console.log("✓ Rejected decision path");
  console.log("  status:", decision.status);
}

async function main() {
  await testDecisionRuntime();
  await testRecommendedPath();
  await testRejectedPath();
  console.log("\nAll tender decision checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
