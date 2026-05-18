/**
 * V3.4 External Evidence Intelligence Runtime 冒烟验证
 */
import { analyzeTender } from "../lib/tender/analyzeTender";
import { buildSemanticGraph } from "../lib/tender/semantic";
import { buildSkuMappings } from "../lib/tender/sku";
import { buildTechnicalCompliancePackage } from "../lib/tender/compliance";
import { runExternalEvidenceIntelligence } from "../lib/tender/evidence-intelligence";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function testFullPipeline() {
  const tenderText = `
    技术要求：跑步机最大速度 ≥ 20km/h
    资质：ISO9001 质量管理体系认证
  `;
  const parsed = await analyzeTender({ rawText: tenderText, fileName: "t.txt" });
  const { graph } = buildSemanticGraph(parsed);
  const sku = buildSkuMappings(graph);
  const compliance = buildTechnicalCompliancePackage({ graph, skuResult: sku });

  const cert = Buffer.from(
    "ISO9001 质量管理体系认证证书\n认证范围：健身器材",
    "utf8",
  );
  const spec = Buffer.from(
    "技术参数表\n最大速度：22km/h\n额定功率：3HP",
    "utf8",
  );

  const result = await runExternalEvidenceIntelligence({
    attachments: [
      { buffer: cert, fileName: "ISO9001证书.txt", mimeType: "text/plain" },
      { buffer: spec, fileName: "技术参数.txt", mimeType: "text/plain" },
    ],
    snapshot: { graph, compliance, skuResult: sku },
    mergeInternalEvidence: true,
  });

  assert(result.ok, "eir ok");
  if (!result.ok) return;

  assert(result.version === "3.4", "version");
  assert(result.phases.length === 6, "6 phases");
  assert(result.registry.registry.documents.length > 0, "registry docs");
  assert(result.coverage.runtime.decision.action != null, "decision");
  assert(result.ocr.totalChars > 0, "ocr chars");

  const hasAttachment = result.registry.registry.documents.some(
    (d) => d.provenance?.sourceKind === "attachment",
  );
  assert(hasAttachment, "attachment docs in registry");

  console.log("✓ External Evidence Intelligence Runtime");
  console.log("  runId:", result.runId);
  console.log("  phases:", result.phases.map((p) => p.phaseId).join(" → "));
  console.log("  decision:", result.coverage.runtime.decision.action);
  console.log("  registry docs:", result.registry.registry.documents.length);
  console.log("  merged internal:", result.registry.mergedInternal);
}

async function main() {
  await testFullPipeline();
  console.log("\nAll evidence intelligence runtime checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
