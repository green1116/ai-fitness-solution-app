/**
 * V80 PRODUCT P1 — Productization mapping types (spec only)
 */
import type { ProductSaasPlan } from "@/lib/app/v80/product.compiler";

export const V80_PRODUCT_PRODUCTIZATION_VERSION = "v80-product-productization-1" as const;
export const V80_PRODUCT_PRODUCTIZATION_FREEZE_VERSION =
  "v80-product-productization-freeze-1" as const;

export type ProductPackagingTier = {
  id: string;
  plan: ProductSaasPlan;
  marketName: string;
  tagline: string;
  positioning: string;
  buyerPersona: string;
  modules: string[];
  codeReleaseRef: string;
  required: boolean;
};

export type ProductModulePack = {
  id: string;
  moduleKey: string;
  displayName: string;
  userValue: string;
  apiSurfaces: string[];
  pdfOutputs: string[];
  tiers: ProductSaasPlan[];
  appModuleRef: string;
  required: boolean;
};

export type ProductJourneyStep = {
  step: number;
  actor: string;
  action: string;
  touchpoint: string;
  apiRoute?: string;
  pdfArtifact?: string;
  successCriteria: string;
};

export type ProductJourneyFlow = {
  id: string;
  journeyKey: "enterprise-gym" | "tender-intake" | "budget-planning" | "proposal-delivery";
  persona: string;
  workflowRef: string;
  steps: ProductJourneyStep[];
  activationMetric: string;
  required: boolean;
};

export type ProductPricingTier = {
  id: string;
  plan: ProductSaasPlan;
  monthlyPriceUsd: number | "custom";
  features: { key: string; included: boolean; limit: string }[];
  billingRef: string;
  codeGateRef: string;
  required: boolean;
};

export type ProductOnboardingStep = {
  id: string;
  order: number;
  stage: "signup" | "setup" | "first-run" | "activation" | "expansion";
  title: string;
  userAction: string;
  apiRoute: string;
  deliverable: string;
  timeToValue: string;
  required: boolean;
};

export type ProductizationManifest = {
  version: typeof V80_PRODUCT_PRODUCTIZATION_VERSION;
  codeReleaseVersion: string;
  packagingCount: number;
  journeyCount: number;
  pricingTierCount: number;
  onboardingStepCount: number;
  productizationComplete: boolean;
  summary: string;
};

export type ProductizationReport = {
  version: typeof V80_PRODUCT_PRODUCTIZATION_VERSION;
  freezeVersion: typeof V80_PRODUCT_PRODUCTIZATION_FREEZE_VERSION;
  reportId: string;
  codeReleaseReady: boolean;
  manifest: ProductizationManifest;
  packaging: ProductPackagingTier[];
  modules: ProductModulePack[];
  journeys: ProductJourneyFlow[];
  pricing: ProductPricingTier[];
  onboarding: ProductOnboardingStep[];
  productizationReady: boolean;
  readinessScore: number;
  summary: string;
};
