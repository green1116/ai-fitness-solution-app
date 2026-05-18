/**
 * V3.4-E2 Deterministic OCR Runtime 冒烟验证
 */
import {
  DETERMINISTIC_OCR_RUNTIME_CONTRACT,
  formatOcrTrace,
  normalizeBlockCoordinates,
  runDeterministicOcr,
  runExternalEvidenceRuntime,
  summarizeOcrDocument,
} from "../lib/evidence";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function testOcrPipeline() {
  assert(
    DETERMINISTIC_OCR_RUNTIME_CONTRACT.pipeline.join("→") ===
      "extract_raw→segment_blocks→assign_coordinates→build_metadata",
    "ocr contract pipeline",
  );

  const buffer = Buffer.from(
    `ISO9001 质量管理体系认证证书

认证范围：健身器材生产制造

证书编号：CN-2024-001

技术参数表
最大速度：22km/h`,
    "utf8",
  );

  const doc = await runDeterministicOcr({
    attachmentId: "att-test-ocr",
    fileName: "证书与参数.txt",
    mimeType: "text/plain",
    buffer,
  });

  assert(doc.metadata.version === "3.4-e2", "ocr version");
  assert(doc.blocks.length >= 2, "multiple blocks");
  assert(doc.pages.length >= 1, "page layout");
  assert(doc.blocks.every((b) => b.coordinates.width > 0), "coordinates width");
  assert(doc.blocks.every((b) => b.blockId.startsWith("blk-")), "block ids");
  assert(doc.trace.events.length >= 4, "ocr audit events");
  assert(doc.rawText.includes("ISO9001"), "raw text preserved");

  const normalized = normalizeBlockCoordinates(doc.blocks);
  assert(normalized[0].coordinates.unit === "normalized", "normalized coords");

  const heading = doc.blocks.find((b) => b.kind === "heading" || b.kind === "paragraph");
  assert(!!heading, "has structured block kind");

  console.log("✓ Deterministic OCR Runtime (V3.4-E2)");
  console.log(" ", summarizeOcrDocument(doc));
  console.log("  blocks:", doc.blocks.map((b) => `${b.kind}@${b.page}`).join(", "));
  console.log("  trace events:", doc.trace.events.length);
}

async function testRuntimeIntegration() {
  const cert = Buffer.from("ISO9001 认证证书\n范围：健身器材", "utf8");
  const result = await runExternalEvidenceRuntime({
    attachments: [{ buffer: cert, fileName: "cert.txt", mimeType: "text/plain" }],
    requirements: [
      {
        id: "req-1",
        text: "ISO9001 质量管理体系认证",
        category: "qualification",
        mandatory: true,
      },
    ],
  });

  assert(result.ok, "runtime ok");
  if (!result.ok) return;

  assert(result.ocrDocuments.length === 1, "ocrDocuments");
  assert(result.ocrDocuments[0].blocks.length > 0, "blocks in runtime");
  assert(result.ocr.length === 1, "legacy ocr flat");

  console.log("✓ OCR integrated with Evidence Runtime");
  console.log(" ", formatOcrTrace(result.ocrDocuments[0].trace).split("\n")[0]);
}

async function main() {
  await testOcrPipeline();
  await testRuntimeIntegration();
  console.log("\nAll deterministic OCR checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
