import type { RealBrandEntry, RealEquipmentEntry } from "@/lib/real-catalog-foundation/shared/types";
import type {
  DealerEntry,
  InventoryEntry,
  SupplierEntry,
} from "@/lib/regional-supplier-foundation/shared/types";
import type {
  BenchmarkProfile,
  HistoricalBidOutcome,
  HistoricalProposal,
  HistoricalTender,
} from "@/lib/tender-knowledge/shared/types";

export const DATA_ASSET_SPRINT_VERSION = "data-asset-sprint-2" as const;

export type DataAssetBenchmarkIndustry =
  | "commercial-gym"
  | "hotel"
  | "campus"
  | "community"
  | "enterprise"
  | "government"
  | "fitness-club";

export interface ProjectHistoricalTenderSummary {
  projectId: string;
  city: string;
  industry: HistoricalTender["industry"];
  area: number;
  budget: number;
  brand: string;
  sku: string;
  result: "won" | "lost";
}

export interface ProjectHistoricalProposalSummary {
  score: number;
  winProbability: number;
  strategy: string;
}

export interface ProjectHistoricalOutcomeSummary {
  result: "won" | "lost";
  winningPrice: number | null;
  grossMargin: number | null;
}

export interface ProjectAssetFile {
  schemaVersion: string;
  compatibleLayers: string[];
  projectId: string;
  historicalTender: ProjectHistoricalTenderSummary;
  historicalProposal: ProjectHistoricalProposalSummary;
  historicalBidOutcome: ProjectHistoricalOutcomeSummary;
  tender: HistoricalTender;
  proposal: HistoricalProposal;
  outcome: HistoricalBidOutcome;
  knowledgeAssisted?: {
    baselineProbability: number;
    calibratedProbability: number | null;
    confidence: string;
  };
}

export interface BenchmarkAssetFile {
  schemaVersion: string;
  compatibleLayers: string[];
  industry: DataAssetBenchmarkIndustry;
  profiles: Array<Omit<BenchmarkProfile, "industry"> & { industry: DataAssetBenchmarkIndustry }>;
  summary: {
    industryLabel: string;
    primaryCity: string;
    avgWinProbability: number;
    avgProposalScore: number;
    avgMarginPercent: number;
  };
}

export interface BrandAssetFile {
  schemaVersion: string;
  compatibleLayers: string[];
  brand: RealBrandEntry;
  equipment: RealEquipmentEntry[];
}

export interface SupplierAssetFile {
  schemaVersion: string;
  compatibleLayers: string[];
  supplier: SupplierEntry;
  dealers: DealerEntry[];
  inventory: InventoryEntry[];
}

export interface DataAssetCatalog {
  brands: BrandAssetFile[];
  suppliers: SupplierAssetFile[];
  projects: ProjectAssetFile[];
  benchmarks: BenchmarkAssetFile[];
}

export interface DataAssetStatistics {
  brandCount: number;
  skuCount: number;
  supplierCount: number;
  projectCount: number;
  benchmarkCount: number;
  wonCount: number;
  lostCount: number;
  citiesCovered: string[];
  industriesCovered: string[];
  projectCitiesCovered: string[];
}

export interface LayerReadValidation {
  valid: boolean;
  brandCount?: number;
  skuCount?: number;
  supplierCount?: number;
  dealerCount?: number;
  projectCount?: number;
  benchmarkCount?: number;
  errors: string[];
}

export interface DataAssetReadValidation {
  v20: LayerReadValidation;
  v21: LayerReadValidation;
  v25: LayerReadValidation;
  allValid: boolean;
}

export interface V25TenderKnowledgeCatalog {
  tenders: HistoricalTender[];
  proposals: HistoricalProposal[];
  outcomes: HistoricalBidOutcome[];
  coreBenchmarks: BenchmarkProfile[];
  extendedBenchmarks: BenchmarkAssetFile[];
}

export interface DataAssetSprintReport {
  version: typeof DATA_ASSET_SPRINT_VERSION;
  reportId: string;
  statistics: DataAssetStatistics;
  validation: DataAssetReadValidation;
  summary: string;
  generatedAt: string;
}
