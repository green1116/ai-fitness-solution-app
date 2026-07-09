/**
 * V80 PRODUCT P2 — Growth & sales types (spec only)
 */
import type { ProductSaasPlan } from "@/lib/app/v80/product.compiler";

export const V80_PRODUCT_GROWTH_VERSION = "v80-product-growth-1" as const;
export const V80_PRODUCT_GROWTH_FREEZE_VERSION = "v80-product-growth-freeze-1" as const;

export type SalesFunnelStage = {
  id: string;
  stage: "lead" | "org" | "intake" | "pdf" | "paid";
  order: number;
  touchpoint: string;
  apiRoute?: string;
  pdfArtifact?: string;
  conversionGoal: string;
  p1Ref?: string;
  required: boolean;
};

export type ConversionTrigger = {
  id: string;
  triggerType: "api" | "workflow" | "pdf";
  hook: string;
  sourceRoute: string;
  gateCode: "FEATURE_GATE" | "USAGE_LIMIT";
  targetPlan: ProductSaasPlan;
  cta: string;
  upsellModule: string;
  required: boolean;
};

export type EnterpriseGtmMotion = {
  id: string;
  motion: "tender-procurement" | "compliance-sale" | "multi-site-rollout";
  buyerRole: string;
  procurementStep: string;
  apiRoute: string;
  deliverable: string;
  salesPlay: string;
  required: boolean;
};

export type ExpansionPath = {
  id: string;
  fromPlan: ProductSaasPlan;
  toPlan: ProductSaasPlan;
  triggerRule: string;
  unlockFeatures: string[];
  pricingDelta: string;
  salesMotion: "self-serve" | "sales-assist" | "enterprise-contract";
  required: boolean;
};

export type GrowthManifest = {
  version: typeof V80_PRODUCT_GROWTH_VERSION;
  productizationVersion: string;
  funnelStages: number;
  conversionTriggers: number;
  gtmMotions: number;
  expansionPaths: number;
  growthComplete: boolean;
  summary: string;
};

export type GrowthReport = {
  version: typeof V80_PRODUCT_GROWTH_VERSION;
  freezeVersion: typeof V80_PRODUCT_GROWTH_FREEZE_VERSION;
  reportId: string;
  productizationReady: boolean;
  manifest: GrowthManifest;
  funnel: SalesFunnelStage[];
  conversionTriggers: ConversionTrigger[];
  gtmMotions: EnterpriseGtmMotion[];
  expansionPaths: ExpansionPath[];
  growthReady: boolean;
  readinessScore: number;
  summary: string;
};
