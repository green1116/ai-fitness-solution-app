/**
 * V64 P1 — Demo types
 */

export type DemoCompanyInput = {
  companyName: string;
  companySize?: string;
  goal?: string;
  industry?: string;
};

export type DemoQuoteOutput = {
  title: string;
  summary: string;
  equipment: { name: string; qty: number; zone: string }[];
  estimatedArea: string;
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
