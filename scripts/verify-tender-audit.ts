/**
 * V3.4-E6 Tender Audit Runtime 冒烟验证
 */
import {
  TENDER_AUDIT_RUNTIME_CONTRACT,
  runExternalEvidenceRuntime,
  runTenderAuditRuntime,
  summarizeTenderAudit,
} from "../lib/evidence";
import { runEvidenceCoverageRuntime } from "../lib/evidence/coverage";
import { runTenderValidationRuntime } from "../lib/evidence/validation";
import { buildFixtureLinking } from "./helpers/evidence-fixture";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const EVENT_TYPES = [
  "requirement-linked",
  "coverage-evaluated",
  "validation-issued",
  "ocr-trace-created",
  "evidence-matched",
  "compliance-flagged",
] as const;

async function testAuditRuntime() {
  assert(
    TENDER_AUDIT_RUNTIME_CONTRACT.pipeline.join("→") ===
      "collect_traces→build_audit_trail→governance_status→audit_result",
    "audit contract",
  );

  const { requirements, linking, registry, attachments, ocrDocuments } =
    await buildFixtureLinking();
  const coverageRuntime = runEvidenceCoverageRuntime({ requirements, linking });
  const tenderValidation = runTenderValidationRuntime({
    document: { documentId: "audit-doc-1", tenderTitle: "审计测试项目" },
    requirements,
    coverageRuntime,
    linking,
    registry,
    attachments,
  });

  const audit = runTenderAuditRuntime({
    runId: "audit-run-1",
    documentId: "audit-doc-1",
    startedAt: new Date().toISOString(),
    requirements,
    ocrDocuments,
    linking,
    coverageRuntime,
    tenderValidation,
    registry,
    attachments,
  });

  assert(audit.version === "3.4-e6", "version");
  assert(audit.trail.entries.length > 0, "audit entries");
  assert(audit.trail.summary.totalEntries === audit.trail.entries.length, "summary count");

  const types = new Set(audit.trail.entries.map((e) => e.type));
  assert(types.has("evidence-matched"), "has evidence-matched");
  assert(types.has("coverage-evaluated"), "has coverage-evaluated");
  assert(types.has("validation-issued"), "has validation-issued");
  assert(types.has("ocr-trace-created"), "has ocr-trace-created");

  for (const t of types) {
    assert(EVENT_TYPES.includes(t), `valid event type ${t}`);
  }

  assert(
    ["clear", "review_required", "blocked"].includes(audit.governanceStatus),
    "governance status",
  );
  assert(audit.explain.length > 0, "explain");

  console.log("✓ Tender Audit Runtime (V3.4-E6)");
  console.log(" ", summarizeTenderAudit(audit));
  console.log("  event types:", [...types].join(", "));
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
    tenderDocument: { documentId: "bid-audit-001", tenderTitle: "审计集成测试" },
  });

  assert(result.ok, "runtime ok");
  if (!result.ok) return;

  assert(result.tenderAudit?.version === "3.4-e6", "tenderAudit in pipeline");
  assert(result.tenderAudit.trail.entries.length > 5, "rich audit trail");
  assert(result.tenderAudit.governanceStatus === "clear", "clear for good bid");

  console.log("✓ Full pipeline with tender audit");
  console.log("  governance:", result.tenderAudit.governanceStatus);
  console.log("  entries:", result.tenderAudit.trail.summary.totalEntries);
}

async function main() {
  await testAuditRuntime();
  await testFullPipeline();
  console.log("\nAll tender audit checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
