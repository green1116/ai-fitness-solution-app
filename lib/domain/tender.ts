export type BudgetLevel = "low" | "mid" | "high" | "custom";
export type DeliveryMode = "standard" | "enterprise" | "tender";
export type PriceBand = "low" | "mid" | "high";
export type SiteType =
  | "office"
  | "factory"
  | "park"
  | "school"
  | "hospital"
  | "mixed";

export interface ProjectInput {
  name: string;
  clientName?: string;
  industry?: string;
  siteType: SiteType;
  areaM2?: number;
  targetUsers?: number;
  city?: string;
  budgetLevel: BudgetLevel;
  deliveryMode: DeliveryMode;
  notes?: string;
}

export interface ProjectRecord {
  id: string;
  input: ProjectInput;
  createdAt: string;
  updatedAt: string;
}

export interface Zone {
  name: string;
  purpose: string;
  areaRatio?: number;
  capacity?: number;
  notes?: string;
}

export interface Phase {
  title: string;
  durationDays?: number;
  tasks: string[];
  deliverables: string[];
}

export interface SolutionRecord {
  id: string;
  projectId: string;
  summary: string;
  background: string;
  requirements: string[];
  objectives: string[];
  zoning: Zone[];
  implementationPlan: Phase[];
  operationsPlan: string[];
  riskControl: string[];
  acceptanceCriteria: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductPlaceholder {
  id: string;
  projectId: string;
  category: string;
  subCategory?: string;
  specTags: string[];
  quantity: number;
  priceBand: PriceBand;
  recommendationReason: string;
  replaceable: boolean;
  skuId?: string;
  skuName?: string;
  brand?: string;
  model?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetItem {
  category: string;
  specLevel: string;
  quantity: number;
  unitPriceMin: number;
  unitPriceMax: number;
  subtotalMin: number;
  subtotalMax: number;
  remark?: string;
  sourceType: "placeholder" | "sku";
}

export interface BudgetRecord {
  id: string;
  projectId: string;
  currency: "CNY";
  totalEstimateMin: number;
  totalEstimateMax: number;
  items: BudgetItem[];
  assumptions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TenderPackage {
  project: ProjectRecord;
  solution: SolutionRecord;
  placeholders: ProductPlaceholder[];
  budget: BudgetRecord;
}
