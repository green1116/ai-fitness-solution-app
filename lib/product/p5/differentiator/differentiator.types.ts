/**
 * Product P5 — Differentiator types
 */

export type DifferentiatorMetadata = Record<string, unknown>;

export type Differentiator = {
  id: string;
  proposalId: string;
  title: string;
  claim: string;
  evidence: string[];
  detail: string;
  metadata: DifferentiatorMetadata;
  createdAt: string;
};

export type CreateDifferentiatorInput = {
  id?: string;
  proposalId: string;
  title: string;
  claim: string;
  evidence?: string[];
  metadata?: DifferentiatorMetadata;
};
