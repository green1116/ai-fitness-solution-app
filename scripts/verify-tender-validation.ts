/**
 * V3.4-E5 Tender Validation Runtime 冒烟验证
 */
import {
  TENDER_VALIDATION_RUNTIME_CONTRACT,
  runExternalEvidenceRuntime,
  runTenderValidationRuntime,
} from "../lib/evidence";
import { runEvidenceCoverageRuntime } from "../lib/evidence/coverage";
import { buildFixtureLinking } from "./helpers/evidence-fixture";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function testValidationRuntime() {
  assert(
    TENDER_VALIDATION_RUNTIME_CONTRACT.pipeline.join("→") ===
      "requirement_runtime→evidence_coverage→validation_rules→compliance_check→validation_result→tender_audit",
    "validation contract",
  );

  const { requirements, linking, registry, attachments } = await buildFixtureLinking();

  const coverageRuntime = runEvidenceCoverageRuntime({ requirements, linking });
  const validation = runTenderValidationRuntime({
    document: { documentId: "tender-doc-1", fileName: "投标包.zip", tenderTitle: "健身器材采购" },
    requirements,
    coverageRuntime,
    linking,
    registry,
    attachments,
  });

  assert(validation.version === "3.4-e5", "version");
  assert(validation.findings.length > 0, "findings");
  assert(validation.complianceChecks.length === 4, "4 compliance checks");
  assert(validation.audit.events.length >= 5, "audit trace");
  assert(
    ["approved", "conditional", "rejected", "incomplete"].includes(validation.outcome),
    "outcome",
  );
  assert(validation.summary.validationScore >= 0, "score");

  const critical = validation.findings.filter((f) => f.severity === "critical");
  console.log("✓ Tender Validation Runtime (V3.4-E5)");
  console.log("  outcome:", validation.outcome, "—", validation.title);
  console.log("  findings:", validation.findings.length, "critical:", critical.length);
  console.log(
    "  compliance:",
    validation.complianceChecks.map((c) => `${c.checkId}:${c.passed ? "ok" : "fail"}`).join(", "),
  );
}

async function testRejectedOnMandatory() {
  const { requirements, linking, registry, attachments } = await buildFixtureLinking();
  const coverageRuntime = runEvidenceCoverageRuntime({ requirements, linking });

  const validation = runTenderValidationRuntime({
    document: { documentId: "tender-fail" },
    requirements: requirements.map((r) => ({ ...r, mandatory: true })),
    coverageRuntime,
    linking,
    registry,
    attachments: [],
    policy: { requireAttachments: true, rejectOnCritical: true },
  });

  assert(validation.outcome === "rejected" || validation.outcome === "incomplete", "rejected when no attachments");
  console.log("✓ Rejection policy (no attachments)");
  console.log("  outcome:", validation.outcome);
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
    tenderDocument: { documentId: "bid-001", tenderTitle: "测试招标项目" },
  });

  assert(result.ok, "runtime ok");
  if (!result.ok) return;
  assert(result.tenderValidation?.version === "3.4-e5", "tenderValidation");
  const tenderValidation = result.tenderValidation;
  if (!tenderValidation) return;
  assert(tenderValidation.outcome === "approved", "approved for good cert");

  console.log("✓ Full evidence pipeline with tender validation");
  console.log("  outcome:", tenderValidation.outcome);
}

async function main() {
  await testValidationRuntime();
  await testRejectedOnMandatory();
  await testFullPipeline();
  console.log("\nAll tender validation checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
