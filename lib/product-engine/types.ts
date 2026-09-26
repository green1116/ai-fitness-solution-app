/**
 * V59 Product Engine — shared types
 */

import type { ProductSelection } from "./product-intelligence";

export type CompanyInfoInput = {
  companyName: string;
  industry?: string;
  city?: string;
  targetUsers?: number;
  areaM2?: number;
  notes?: string;
  /** PI.1 professional selection input for this Quote version. */
  productSelections?: ProductSelection[];
};

export type QuoteProposal = {
  summary: string;
  sections: Array<{ title: string; body: string }>;
  generatedAt: string;
};

export type BudgetStructure = {
  currency: string;
  totalMin: number;
  totalMax: number;
  /** Alias for API / UI consumers that expect DB field names. */
  totalEstimateMin?: number;
  totalEstimateMax?: number;
  items: Array<{ category: string; min: number; max: number }>;
  assumptions: string[];
};

export type TenderArtifact = {
  fileName: string;
  renderVersion: string;
  metadata: Record<string, unknown>;
};
