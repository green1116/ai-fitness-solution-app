/**
 * V59 Product Engine — Tender (V58 History + Orchestrator)
 */

import {
  buildAuditSnapshot,
  getQuoteHistory,
  type QuoteHistoryStore,
} from "@/lib/quote-lifecycle";

import type { TenderArtifact } from "./types";

export type TenderEngineInput = {
  quoteId: string;
  projectId: string;
  projectName: string;
  historyStore: QuoteHistoryStore;
};

export type TenderEngineResult = {
  artifact: TenderArtifact;
  auditTraceable: boolean;
  eventCount: number;
};

export function runTenderEngine(input: TenderEngineInput): TenderEngineResult {
  const records = getQuoteHistory(input.historyStore, input.quoteId);
  const audit = buildAuditSnapshot(records);
  const safeName = input.projectName.replace(/[^\w\u4e00-\u9fa5-]+/g, "-").slice(0, 48);

  return {
    artifact: {
      fileName: `tender-${safeName}-${input.projectId.slice(0, 8)}.pdf`,
      renderVersion: "v59-tender-1",
      metadata: {
        quoteId: input.quoteId,
        projectId: input.projectId,
        orchestrationChain: audit?.causationChain ?? [],
        eventCount: audit?.eventCount ?? records.length,
      },
    },
    auditTraceable: audit?.traceable ?? false,
    eventCount: audit?.eventCount ?? records.length,
  };
}
