/**
 * V59 SaaS — Plan-driven feature definitions (no hardcoded permissions in gates)
 */

import type { SaasPlan } from "@/lib/saas/types";

export interface FeatureFlags {
  canGenerateQuote: boolean;
  canGenerateBudget: boolean;
  canGenerateTender: boolean;
  canExportPDF: boolean;
  canUseAPI: boolean;
}

export type FeatureKey = keyof FeatureFlags;

export type UsageLimitConfig = {
  QUOTE: number;
  BUDGET: number;
  TENDER: number;
  PDF: number;
};

/** -1 = unlimited */
export const PLAN_FEATURE_MATRIX: Record<SaasPlan, FeatureFlags> = {
  BASIC: {
    canGenerateQuote: true,
    canGenerateBudget: false,
    canGenerateTender: false,
    canExportPDF: false,
    canUseAPI: false,
  },
  PRO: {
    canGenerateQuote: true,
    canGenerateBudget: true,
    canGenerateTender: false,
    canExportPDF: true,
    canUseAPI: false,
  },
  ENTERPRISE: {
    canGenerateQuote: true,
    canGenerateBudget: true,
    canGenerateTender: true,
    canExportPDF: true,
    canUseAPI: true,
  },
};

export const PLAN_USAGE_LIMITS: Record<SaasPlan, UsageLimitConfig> = {
  BASIC: { QUOTE: 50, BUDGET: 0, TENDER: 0, PDF: 0 },
  PRO: { QUOTE: 500, BUDGET: 200, TENDER: 0, PDF: 100 },
  ENTERPRISE: { QUOTE: -1, BUDGET: -1, TENDER: -1, PDF: -1 },
};

export const FEATURE_TO_USAGE: Partial<Record<FeatureKey, keyof UsageLimitConfig>> = {
  canGenerateQuote: "QUOTE",
  canGenerateBudget: "BUDGET",
  canGenerateTender: "TENDER",
  canExportPDF: "PDF",
};

export function resolveFeatureFlags(plan: SaasPlan): FeatureFlags {
  return { ...PLAN_FEATURE_MATRIX[plan] };
}

export function resolveUsageLimit(plan: SaasPlan, type: keyof UsageLimitConfig): number {
  return PLAN_USAGE_LIMITS[plan][type];
}
