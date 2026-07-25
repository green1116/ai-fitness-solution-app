/**
 * Product P5 — Solution overview types
 */

export type SolutionOverviewMetadata = Record<string, unknown>;

export type SolutionOverview = {
  id: string;
  proposalId: string;
  approach: string;
  capabilities: string[];
  outcomes: string[];
  detail: string;
  metadata: SolutionOverviewMetadata;
  createdAt: string;
};

export type CreateSolutionOverviewInput = {
  id?: string;
  proposalId: string;
  approach: string;
  capabilities?: string[];
  outcomes?: string[];
  metadata?: SolutionOverviewMetadata;
};
