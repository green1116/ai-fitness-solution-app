/**
 * V3.4-E1 Evidence Runtime Foundation 冒烟验证
 */
import {
  EXTERNAL_EVIDENCE_RUNTIME_CONTRACT,
  getEvidenceByRequirement,
  runExternalEvidenceRuntime,
  summarizeRuntimeResult,
} from "../lib/evidence";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function testFoundationRuntime() {
  assert(
    EXTERNAL_EVIDENCE_RUNTIME_CONTRACT.phases.join("→") ===
      "attachment→ocr→semantic→registry→linker→coverage",
    "contract phases",
  );

  const cert = Buffer.from(
    "ISO9001 质量管理体系认证证书\n认证范围：健身器材生产制造",
    "utf8",
  );
  const spec = Buffer.from(
    "技术参数表\n最大速度：22km/h\n额定功率：3HP",
    "utf8",
  );

  const result = await runExternalEvidenceRuntime({
    attachments: [
      { buffer: cert, fileName: "ISO9001证书.txt", mimeType: "text/plain" },
      { buffer: spec, fileName: "技术参数.txt", mimeType: "text/plain" },
    ],
    requirements: [
      {
        id: "req-qual",
        text: "投标人须具备 ISO9001 质量管理体系认证",
        category: "qualification",
        mandatory: true,
      },
      {
        id: "req-tech",
        text: "跑步机最大速度 ≥ 20km/h",
        category: "technical",
        mandatory: true,
      },
    ],
    minLinkScore: 0.3,
  });

  assert(result.ok, "runtime ok");
  if (!result.ok) return;

  assert(result.version === "3.4-e1", "version");
  assert(result.attachments.length === 2, "2 attachments");
  assert(result.attachments.every((a) => a.sha256?.length === 64), "sha256");
  assert(result.ocr.length === 2, "2 ocr");
  assert(
    result.classifications.some((c) => c.kind === "certification"),
    "cert classified",
  );
  assert(result.registry.records.length === 2, "2 records");
  assert(result.registry.links.length > 0, "links");
  assert(result.coverage.length === 2, "coverage rows");
  assert(result.trace.events.length > 0, "audit events");
  assert(result.phases.length === 6, "6 phases");

  const qualLinked = getEvidenceByRequirement(result.registry, "req-qual");
  assert(qualLinked.length > 0, "qualification linked");

  console.log("✓ Evidence Runtime Foundation (V3.4-E1)");
  console.log(" ", summarizeRuntimeResult(result));
  console.log(
    "  types:",
    result.classifications.map((c) => `${c.attachmentId.slice(-6)}:${c.kind}`).join(", "),
  );
}

async function main() {
  await testFoundationRuntime();
  console.log("\nAll evidence foundation checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
