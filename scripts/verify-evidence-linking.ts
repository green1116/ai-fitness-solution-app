/**
 * V3.4-E3 Evidence Linking Runtime 冒烟验证
 */
import {
  EVIDENCE_LINKING_RUNTIME_CONTRACT,
  buildOcrKeywordIndex,
  mapRequirementKeywords,
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

async function testLinkingPipeline() {
  assert(
    EVIDENCE_LINKING_RUNTIME_CONTRACT.pipeline.join("→") ===
      "keyword_mapping→evidence_match→ocr_locate→coverage_status",
    "linking contract",
  );

  const certBuf = Buffer.from(
    "ISO9001 质量管理体系认证证书\n认证范围：健身器材生产制造",
    "utf8",
  );
  const specBuf = Buffer.from(
    "技术参数表\n最大速度：22km/h\n额定功率：3HP",
    "utf8",
  );

  const certDoc = await runDeterministicOcr({
    attachmentId: "att-cert",
    fileName: "ISO9001证书.txt",
    mimeType: "text/plain",
    buffer: certBuf,
  });
  const specDoc = await runDeterministicOcr({
    attachmentId: "att-spec",
    fileName: "技术参数.txt",
    mimeType: "text/plain",
    buffer: specBuf,
  });

  const index = buildOcrKeywordIndex([certDoc, specDoc]);
  assert(Object.keys(index.byTerm).length > 0, "keyword index");

  const requirements = [
    {
      id: "req-qual",
      title: "ISO9001 认证",
      text: "投标人须具备 ISO9001 质量管理体系认证",
      keywords: ["ISO9001", "认证"],
      mandatory: true,
      category: "qualification" as const,
    },
    {
      id: "req-tech",
      title: "速度要求",
      text: "跑步机最大速度 ≥ 20km/h",
      keywords: ["速度", "20"],
      mandatory: true,
      category: "technical" as const,
    },
  ];

  const mapping = mapRequirementKeywords(requirements[0]);
  assert(mapping.keywords.includes("iso9001") || mapping.keywords.some((k) => k.includes("iso")), "mapped keywords");

  let registry = createEmptyRegistry();
  for (const doc of [certDoc, specDoc]) {
    const ext = toOcrExtraction(doc);
    const classification = classifyOcrExtraction(ext);
    registry = ingestEvidenceRecord(registry, {
      extraction: ext,
      classification,
      provenance: {
        sourceKind: "attachment",
        sourceId: doc.attachmentId,
        runtimeRunId: "verify-e3",
        phaseId: "registry",
        ingestedAt: new Date().toISOString(),
      },
    });
  }

  const linking = runEvidenceLinkingRuntime({
    requirements,
    ocrDocuments: [certDoc, specDoc],
    classifications: [certDoc, specDoc].map((d) =>
      classifyOcrExtraction(toOcrExtraction(d)),
    ),
    registry,
    minLinkScore: 0.25,
  });

  assert(linking.version === "3.4-e3", "linking version");
  assert(linking.matches.length > 0, "has matches");
  assert(linking.links.length > 0, "registry links");
  assert(
    linking.matches.some((m) => m.locations.length > 0),
    "ocr locations",
  );
  assert(
    linking.results.some((r) => r.coverageLevel !== "unsupported"),
    "coverage not all unsupported",
  );
  assert(linking.trace.events.length >= 4, "linking trace");

  const qual = linking.results.find((r) => r.requirementId === "req-qual");
  assert(qual && qual.matches.length > 0, "qualification linked");
  assert(qual.matches[0].explain.length > 0, "explainable");

  console.log("✓ Evidence Linking Runtime (V3.4-E3)");
  console.log("  matches:", linking.matches.length);
  console.log("  locations:", linking.matches.reduce((n, m) => n + m.locations.length, 0));
  console.log(
    "  coverage:",
    linking.results.map((r) => `${r.requirementId}:${r.coverageLevel}`).join(", "),
  );
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
  assert(result.linking?.version === "3.4-e3", "linking in runtime");
  assert(result.linking.matches.length > 0, "runtime matches");

  console.log("✓ Linking integrated with External Evidence Runtime");
}

async function main() {
  await testLinkingPipeline();
  await testFullRuntimeIntegration();
  console.log("\nAll evidence linking checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
