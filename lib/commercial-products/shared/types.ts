import type {
  CommercialProductsMode,
  DeliverableType,
  PaymentMilestone,
  ProductSku,
  ProjectComplexity,
  SlaTier,
} from "./constants";

export interface ProductPackagingInput {
  projectName: string;
  areaSqm: number;
  headcount: number;
  budgetCny: number;
  complexity?: ProjectComplexity;
  slaTier?: SlaTier;
  region?: string;
}

export interface ProductDeliverable {
  deliverableId: string;
  type: DeliverableType;
  name: string;
  format: "pdf" | "report";
  ready: boolean;
  summary: string;
}

export interface ProductCatalogEntry {
  sku: ProductSku;
  name: string;
  description: string;
  inputs: string[];
  outputs: DeliverableType[];
  deliverables: DeliverableType[];
  slaTier: SlaTier;
  priceMinCny: number;
  priceMaxCny: number;
}

export interface ProductCatalogRegistry {
  registryId: string;
  records: ProductCatalogEntry[];
  count: number;
  mode: CommercialProductsMode;
}

export interface PricingQuote {
  quoteId: string;
  sku: ProductSku;
  suggestedPriceCny: number;
  priceMinCny: number;
  priceMaxCny: number;
  complexity: ProjectComplexity;
  slaTier: SlaTier;
  factors: {
    areaFactor: number;
    headcountFactor: number;
    budgetFactor: number;
    complexityFactor: number;
    slaFactor: number;
  };
  summary: string;
}

export interface SlaDefinition {
  tier: SlaTier;
  label: string;
  deliveryHours: number;
  revisionRounds: number;
  supportLevel: string;
}

export interface SlaAssignment {
  assignmentId: string;
  sku: ProductSku;
  tier: SlaTier;
  definition: SlaDefinition;
  dueAtIso: string;
}

export interface PaymentScheduleItem {
  milestone: PaymentMilestone;
  ratio: number;
  amountCny: number;
  trigger: string;
}

export interface ContractTemplate {
  contractId: string;
  projectName: string;
  sku: ProductSku;
  scope: string[];
  priceCny: number;
  paymentSchedule: PaymentScheduleItem[];
  acceptanceCriteria: string[];
  sla: SlaAssignment;
  summary: string;
}

export interface IntelligenceSnapshot {
  brandCount: number;
  requirementCount: number;
  tenderCount: number;
  procurementDecisionCount: number;
  winLossOutcomeCount: number;
  projectCount: number;
  performanceAverageScore: number;
  optimizationOpportunityCount: number;
}

export interface ProductPackageResult {
  packageId: string;
  sku: ProductSku;
  projectName: string;
  deliverables: ProductDeliverable[];
  intelligence: IntelligenceSnapshot;
  pricing: PricingQuote;
  sla: SlaAssignment;
  contract: ContractTemplate;
  mode: CommercialProductsMode;
}

export interface ProductPackagingValidation {
  valid: boolean;
  productCount: number;
  deliverableCount: number;
  catalogReady: boolean;
  summary: string;
}
