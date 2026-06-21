/**
 * V59 Product Engine — shared types
 */

export type CompanyInfoInput = {
  companyName: string;
  industry?: string;
  city?: string;
  targetUsers?: number;
  areaM2?: number;
  notes?: string;
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
  items: Array<{ category: string; min: number; max: number }>;
  assumptions: string[];
};

export type TenderArtifact = {
  fileName: string;
  renderVersion: string;
  metadata: Record<string, unknown>;
};
