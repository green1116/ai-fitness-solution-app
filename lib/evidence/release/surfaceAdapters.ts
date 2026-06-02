import type { ExecutiveReleaseManifest, ExecutiveReleaseSurface } from "../types";

export type ReleaseManifestContext = {
  runId?: string;
  documentId?: string;
  tenderId?: string;
  planId?: string;
};

/**
 * PDF 元数据 keywords（不改版式，仅 keywords/subject 扩展）
 */
export function toPdfMetadataKeywords(
  surface: ExecutiveReleaseSurface,
): string[] {
  return [
    `ExecutiveGate:${surface.gateStatus}`,
    `ExecutiveDecision:${surface.decision}`,
    `ExecutiveScore:${surface.executiveScore}`,
    surface.releasable ? "Releasable:yes" : "Releasable:no",
    surface.conditionalRelease ? "ConditionalRelease:yes" : "ConditionalRelease:no",
    ...(surface.executiveRecommendation
      ? [`ExecutiveRecommendation:${surface.executiveRecommendation}`]
      : []),
    ...(surface.tenderReleaseDecision
      ? [`TenderRelease:${surface.tenderReleaseDecision}`]
      : []),
    ...(surface.labels ?? []).map((l) => `Label:${l}`),
    ...(surface.blockReasons?.slice(0, 3).map((r) => `BlockReason:${r}`) ?? []),
  ];
}

/**
 * MANIFEST.txt 追加行（key=value，确定性）
 */
export function buildReleaseManifestLines(
  surface: ExecutiveReleaseSurface,
  ctx?: ReleaseManifestContext,
): string[] {
  const lines = [
    "--- Executive Release Surface (V3.4-E11) ---",
    `executiveGateStatus=${surface.gateStatus}`,
    `executiveSurfaceStatus=${surface.status}`,
    `executiveDecision=${surface.decision}`,
    `executiveRecommendation=${surface.executiveRecommendation ?? ""}`,
    `executiveScore=${surface.executiveScore}`,
    `releasable=${surface.releasable ? "1" : "0"}`,
    `conditionalRelease=${surface.conditionalRelease ? "1" : "0"}`,
    `tenderReleaseDecision=${surface.tenderReleaseDecision ?? ""}`,
    `gateReasons=${surface.gateReasons.join("|")}`,
    `labels=${surface.labels.join(",")}`,
  ];
  if (surface.blockReasons?.length) {
    lines.push(`blockReasons=${surface.blockReasons.join("|")}`);
  }
  if (ctx?.runId) lines.push(`evidenceRunId=${ctx.runId}`);
  if (ctx?.documentId) lines.push(`evidenceDocumentId=${ctx.documentId}`);
  if (ctx?.tenderId) lines.push(`tenderId=${ctx.tenderId}`);
  if (ctx?.planId) lines.push(`planId=${ctx.planId}`);
  return lines;
}

export function formatReleaseManifestSection(
  surface: ExecutiveReleaseSurface,
  ctx?: ReleaseManifestContext,
): string {
  return buildReleaseManifestLines(surface, ctx).join("\n");
}

/**
 * ZIP 内 EXECUTIVE_RELEASE_MANIFEST.json
 */
export function toReleaseManifestJson(
  manifest: ExecutiveReleaseManifest,
): string {
  return JSON.stringify(manifest, null, 2);
}

/**
 * 下载响应头（交付层 / API 网关可透传）
 */
export function toDownloadSurfaceHeaders(
  surface: ExecutiveReleaseSurface,
): Record<string, string> {
  return {
    "x-executive-gate-status": surface.gateStatus,
    "x-executive-release-decision": surface.decision,
    "x-executive-score": String(surface.executiveScore),
    "x-executive-releasable": surface.releasable ? "1" : "0",
    "x-executive-conditional-release": surface.conditionalRelease ? "1" : "0",
    ...(surface.tenderReleaseDecision
      ? { "x-tender-release-decision": surface.tenderReleaseDecision }
      : {}),
    ...(surface.blockReasons?.length
      ? { "x-executive-block-reasons": surface.blockReasons.slice(0, 5).join("|") }
      : {}),
  };
}

/**
 * 交付层 envelope（供前端 / orchestration 消费，非 AI）
 */
export function toDeliveryEnvelope(
  surface: ExecutiveReleaseSurface,
  manifest: ExecutiveReleaseManifest,
) {
  return {
    releaseSurface: surface,
    releaseManifest: manifest,
    pdfKeywords: toPdfMetadataKeywords(surface),
    downloadHeaders: toDownloadSurfaceHeaders(surface),
    releasable: surface.releasable,
    blocked: surface.decision === "block-release",
    conditional: surface.decision === "conditional-release",
  };
}
