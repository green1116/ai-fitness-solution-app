/**
 * V3.3 Attachment Evidence 冒烟验证
 */
import { analyzeTender } from "../lib/tender/analyzeTender";
import { buildSemanticGraph } from "../lib/tender/semantic";
import { runAttachmentEvidenceIngest } from "../lib/tender/attachment-evidence";
import { getEvidenceByRequirement } from "../lib/tender/evidence/registry";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function testIngestWithLinking() {
  const tenderText = `
    技术要求：跑步机最大速度 ≥ 20km/h
    资质要求：投标人须具备 ISO9001 质量管理体系认证
  `;
  const parsed = await analyzeTender({ rawText: tenderText, fileName: "t.txt" });
  const { graph } = buildSemanticGraph(parsed);

  const certText = Buffer.from(
    "ISO9001 质量管理体系认证证书\n认证范围：健身器材生产制造\n证书编号：CN-2024-001",
    "utf8",
  );
  const reportText = Buffer.from(
    "检测报告\n产品：电动跑步机\n最大速度：22km/h\n检测结论：合格",
    "utf8",
  );

  const result = await runAttachmentEvidenceIngest({
    attachments: [
      { buffer: certText, fileName: "ISO9001证书.txt", mimeType: "text/plain" },
      { buffer: reportText, fileName: "检测报告.txt", mimeType: "text/plain" },
    ],
    graph,
  });

  assert(result.ok, "ingest ok");
  assert(result.extractions.length === 2, "2 extractions");
  assert(result.payloads.length === 2, "2 payloads");
  assert(
    result.extractions.some((e) => e.evidenceType === "certification"),
    "cert classified",
  );
  assert(result.registry.documents.length >= 2, "registry docs");
  assert(result.links.length > 0, "requirement links");

  const qualReq = graph.requirements.find((r) => r.category === "qualification");
  if (qualReq) {
    const linked = getEvidenceByRequirement(result.registry, qualReq.id);
    assert(linked.length > 0, "qualification linked to attachment evidence");
  }

  console.log("✓ attachment evidence ingest");
  console.log("  intelligence:", result.intelligence);
  console.log("  links:", result.links.length);
  console.log(
    "  types:",
    result.extractions.map((e) => `${e.fileName}:${e.evidenceType}`).join(", "),
  );
}

async function main() {
  await testIngestWithLinking();
  console.log("\nAll attachment evidence checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
