import { runDeterministicOcr, runEvidenceLinkingRuntime } from "../../lib/evidence";
import { createEmptyRegistry, ingestEvidenceRecord } from "../../lib/evidence/registry";
import { classifyOcrExtraction } from "../../lib/evidence/semantic";
import { toOcrExtraction } from "../../lib/evidence/ocr";
import type { AttachmentFile } from "../../lib/evidence/types";

export async function buildFixtureLinking() {
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

  const attachments: AttachmentFile[] = [
    {
      id: certDoc.attachmentId,
      fileName: certDoc.metadata.fileName,
      mimeType: certDoc.metadata.mimeType,
      sourceType: "upload",
      size: certBuf.length,
      uploadedAt: new Date().toISOString(),
    },
    {
      id: specDoc.attachmentId,
      fileName: specDoc.metadata.fileName,
      mimeType: specDoc.metadata.mimeType,
      sourceType: "upload",
      size: specBuf.length,
      uploadedAt: new Date().toISOString(),
    },
  ];

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
        runtimeRunId: "fixture",
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

  return { requirements, linking, registry, attachments, ocrDocuments: [certDoc, specDoc] };
}
