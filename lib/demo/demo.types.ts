/**
 * V64 P1 — Demo types
 */

export type DemoCompanyInput = {
  companyName: string;
  companySize?: string;
  goal?: string;
  industry?: string;
};

/** Formal buildPlan preview slice for /demo (no sales/risk dump). */
export type DemoSolutionPreview = {
  rationale: string[];
  zones: string[];
  equipmentRationale: {
    zone: string;
    name: string;
    qty: number;
    rationale: string;
  }[];
  implementation: { name: string; duration: string; desc: string }[];
};

export type DemoQuoteOutput = {
  title: string;
  summary: string;
  equipment: { name: string; qty: number; zone: string }[];
  estimatedArea: string;
  solutionPreview: DemoSolutionPreview;
  mode: "demo-stub";
};

export type DemoBudgetOutput = {
  total: number;
  currency: string;
  breakdown: { category: string; amount: number }[];
  mode: "demo-stub";
};

export type DemoTenderOutput = {
  title: string;
  sections: string[];
  complianceScore: number;
  preview: string;
  mode: "demo-stub";
};

export type DemoOrchestratorResult = {
  sessionId: string;
  company: DemoCompanyInput;
  quote: DemoQuoteOutput;
  budget: DemoBudgetOutput;
  tender: DemoTenderOutput;
  upsellPrompts: string[];
  generatedAt: string;
  runtimeStub: string;
};
