import type { EvidenceRuntimeTrace, ExternalEvidenceRuntimeSuccess } from "../types";

/**
 * Debug — 可读的审计轨迹（供日志 / 运维）
 */
export function formatRuntimeTrace(trace: EvidenceRuntimeTrace): string {
  const lines = [
    `[${trace.version}] run=${trace.runId}`,
    `started=${trace.startedAt}${trace.finishedAt ? ` finished=${trace.finishedAt}` : ""}`,
    `events=${trace.events.length}`,
    "---",
  ];

  for (const e of trace.events) {
    lines.push(
      `${e.at} [${e.phaseId}] ${e.kind}: ${e.message}${e.payload ? ` ${JSON.stringify(e.payload)}` : ""}`,
    );
  }

  return lines.join("\n");
}

export function summarizeRuntimeResult(result: ExternalEvidenceRuntimeSuccess): string {
  return [
    `Evidence Runtime ${result.version}`,
    `runId=${result.runId} durationMs=${result.durationMs}`,
    `attachments=${result.attachments.length} ocrChars=${result.ocr.reduce((n, o) => n + o.charCount, 0)}`,
    `records=${result.registry.records.length} links=${result.registry.links.length}`,
    `coverage fully=${result.coverageSummary.fully} partial=${result.coverageSummary.partial} unsupported=${result.coverageSummary.unsupported}`,
    `warnings=${result.warnings.length}`,
  ].join("\n");
}
