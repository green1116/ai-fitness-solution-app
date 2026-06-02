import type { ProductTier } from "../catalog";

export const SALES_ENABLEMENT_VERSION = "v8.3-sales-enablement-1" as const;

export type CaseStudySegment = "small-office" | "medium-enterprise" | "large-enterprise";

export interface SalesDeckSlide {
  id: string;
  order: number;
  title: string;
  bullets: string[];
}

export interface SalesDeck {
  deckId: string;
  version: typeof SALES_ENABLEMENT_VERSION;
  productName: string;
  title: string;
  slides: SalesDeckSlide[];
  summary: string;
}

export interface ROICalculatorInput {
  employeeCount: number;
  spaceSizeSqm: number;
  projectBudget: number;
  expectedUtilization: number;
}

export interface ROICalculator {
  calculatorId: string;
  input: ROICalculatorInput;
  estimatedRoi: number;
  productivityImpact: number;
  wellnessImpact: number;
  investmentSummary: string;
  summary: string;
}

export interface CaseStudy {
  id: string;
  segment: CaseStudySegment;
  title: string;
  problem: string;
  solution: string;
  budget: string;
  outcome: string;
  roi: number;
}

export interface CaseStudyCatalog {
  catalogId: string;
  version: typeof SALES_ENABLEMENT_VERSION;
  caseStudies: CaseStudy[];
  summary: string;
}

export interface ProposalTemplate {
  id: string;
  tier: ProductTier;
  title: string;
  description: string;
  recommendedPackage: ProductTier;
  commercialSummary: string;
  sections: string[];
}

export interface ProposalTemplateCatalog {
  catalogId: string;
  version: typeof SALES_ENABLEMENT_VERSION;
  templates: ProposalTemplate[];
  summary: string;
}

export interface DemoEnvironment {
  environmentId: string;
  name: string;
  description: string;
  tiers: ProductTier[];
  features: string[];
  ready: boolean;
}

export interface SalesAssetCatalog {
  catalogId: string;
  version: typeof SALES_ENABLEMENT_VERSION;
  productName: string;
  deck: SalesDeck;
  roiCalculator: ROICalculator;
  caseStudies: CaseStudy[];
  proposalTemplates: ProposalTemplate[];
  demoEnvironment: DemoEnvironment;
  totalAssets: number;
  summary: string;
}

export interface SalesEnablementResponse {
  version: typeof SALES_ENABLEMENT_VERSION;
  salesAssets: SalesAssetCatalog;
  roiCalculator: ROICalculator;
  caseStudies: CaseStudy[];
  proposalTemplates: ProposalTemplate[];
  salesDeck: SalesDeck;
}
