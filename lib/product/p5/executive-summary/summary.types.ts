/**
 * Product P5 — Executive summary types
 */

export type ExecutiveSummaryMetadata = Record<string, unknown>;

export type ExecutiveSummary = {
  id: string;
  proposalId: string;
  headline: string;
  narrative: string;
  keyPoints: string[];
  detail: string;
  metadata: ExecutiveSummaryMetadata;
  createdAt: string;
};

export type CreateExecutiveSummaryInput = {
  id?: string;
  proposalId: string;
  headline: string;
  narrative: string;
  keyPoints?: string[];
  metadata?: ExecutiveSummaryMetadata;
};
