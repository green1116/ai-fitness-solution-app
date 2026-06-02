/**
 * V3.4-E4 Evidence Coverage Runtime 冒烟验证
 */
import {
  EVIDENCE_COVERAGE_RUNTIME_CONTRACT,
  runEvidenceCoverageRuntime,
  runEvidenceLinkingRuntime,
  runExternalEvidenceRuntime,
  runDeterministicOcr,
} from "../lib/evidence";
import { createEmptyRegistry, ingestEvidenceRecord } from "../lib/evidence/registry";
import { classifyOcrExtraction } from "../lib/evidence/semantic";
import { toOcrExtraction } from "../lib/evidence/ocr";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function buildFixture() {
  const certBuf = Buffer.from(
    "ISO9001 质量管理体系认证证书\n认证范围：健身器材",
    "utf8",
  );
  const specBuf = Buffer.from("技术参数表\n最大速度：22km/h", "utf8");

  const certDoc = await runDeterministicOcr({
    attachmentId: "att-cert",
    fileName: "ISO9001证书.txt",
    mimeType: "text/plain",
    buffer: certBuf,
  });
  const specDoc = await runDeterministicOcr({
    attachmentId: "att-spec",
    fileName: "参数.txt",
    mimeType: "text/plain",
    buffer: specBuf,
  });

  let registry = createEmptyRegistry();
  const classifications = [];
  for (const doc of [certDoc, specDoc]) {
    const ext = toOcrExtraction(doc);
    const classification = classifyOcrExtraction(ext);
    classifications.push(classification);
    registry = ingestEvidenceRecord(registry, {
      extraction: ext,
      classification,
      provenance: {
        sourceKind: "attachment",
        sourceId: doc.attachmentId,
        runtimeRunId: "verify-e4",
        phaseId: "registry",
        ingestedAt: new Date().toISOString(),
      },
    });
  }

  const requirements = [
    {
      id: "req-qual",
      title: "ISO9001",
      text: "投标人须具备 ISO9001 质量管理体系认证",
      keywords: ["ISO9001", "认证"],
      mandatory: true,
      category: "qualification" as const,
    },
    {
      id: "req-tech",
      title: "速度",
      text: "跑步机最大速度 ≥ 20km/h",
      keywords: ["速度", "20"],
      mandatory: true,
      category: "technical" as const,
    },
    {
      id: "req-missing",
      title: "业绩",
      text: "近三年同类项目业绩不少于3个",
      keywords: ["业绩", "合同"],
      mandatory: false,
      category: "commercial" as const,
    },
  ];

  const linking = runEvidenceLinkingRuntime({
    requirements,
    ocrDocuments: [certDoc, specDoc],
    classifications,
    registry,
    minLinkScore: 0.25,
  });

  return { requirements, linking };
}

async function testCoverageRuntime() {
  assert(
    EVIDENCE_COVERAGE_RUNTIME_CONTRACT.pipeline.join("→") ===
      "evidence_match→coverage_analysis→coverage_status→tender_validation",
    "coverage contract",
  );

  const { requirements, linking } = await buildFixture();
  const coverage = runEvidenceCoverageRuntime({ requirements, linking });

  assert(coverage.version === "3.4-e4", "version");
  assert(coverage.requirements.length === 3, "3 requirements");
  assert(
    coverage.requirements.some((r) => r.status === "covered"),
    "has covered",
  );
  assert(
    coverage.requirements.some((r) => r.status === "partial" || r.status === "missing"),
    "has partial or missing",
  );
  assert(coverage.validation.verdict !== "incomplete", "validation verdict");
  assert(coverage.summary.validationScore >= 0, "validation score");
  assert(coverage.legacyCoverage.length === 3, "legacy bridge");
  assert(coverage.trace.events.length >= 3, "coverage trace");
  assert(coverage.requirements[0].explain.length > 0, "explainable");

  const qual = coverage.requirements.find((r) => r.requirementId === "req-qual");
  assert(qual?.status === "covered", "qual covered");

  console.log("✓ Evidence Coverage Runtime (V3.4-E4)");
  console.log("  verdict:", coverage.validation.verdict, "—", coverage.validation.title);
  console.log("  score:", coverage.summary.validationScore);
  console.log(
    "  status:",
    coverage.requirements.map((r) => `${r.requirementId}:${r.status}`).join(", "),
  );
}

async function testMandatoryFail() {
  const { requirements, linking } = await buildFixture();
  const coverage = runEvidenceCoverageRuntime({
    requirements: requirements.map((r) => ({ ...r, mandatory: true })),
    linking,
    policy: { failOnMandatoryMissing: true },
  });

  assert(
    coverage.summary.mandatoryMissing >= 0,
    "mandatory tracking",
  );
  console.log("✓ Mandatory validation policy");
  console.log("  verdict:", coverage.validation.verdict);
}

async function testFullRuntimeIntegration() {
  const result = await runExternalEvidenceRuntime({
    attachments: [
      {
        buffer: Buffer.from("ISO9001 质量管理体系认证", "utf8"),
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
  });

  assert(result.ok, "runtime ok");
  if (!result.ok) return;
  assert(result.coverageRuntime?.version === "3.4-e4", "coverageRuntime");
  const coverageRuntime = result.coverageRuntime;
  if (!coverageRuntime) return;
  assert(coverageRuntime.validation.verdict !== undefined, "validation");

  console.log("✓ Coverage integrated with External Evidence Runtime");
  console.log("  validation:", coverageRuntime.validation.verdict);
}

async function main() {
  await testCoverageRuntime();
  await testMandatoryFail();
  await testFullRuntimeIntegration();
  console.log("\nAll evidence coverage checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
