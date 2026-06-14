import { buildCommercialBundle } from "../bridge/commercial-bridge";
import { buildProcurementBundle } from "../bridge/procurement-bridge";
import { getAllChannelPricing } from "../channel-pricing";
import { getAllDiscountRules } from "../discount-rules";
import { getAllLeadTimeIntelligence } from "../lead-time-intelligence";
import { getAllProjectPricing } from "../project-pricing";
import type {
  CommercialBundleReport,
  ProcurementIntelligencePhase1Report,
  ProcurementReport,
} from "../shared/types";
import { PROCUREMENT_INTELLIGENCE_VERSION } from "../shared/types";
import {
  validateCommercialBundle,
  validateProcurementBundle,
  validateProcurementIntelligencePhase1,
} from "../validation/validators";

export function buildProcurementIntelligencePhase1Report(): ProcurementIntelligencePhase1Report {
  const validation = validateProcurementIntelligencePhase1();
  const channelPricing = getAllChannelPricing();
  const projectPricing = getAllProjectPricing();
  const discountRules = getAllDiscountRules();
  const leadTime = getAllLeadTimeIntelligence();

  return {
    version: PROCUREMENT_INTELLIGENCE_VERSION,
    reportId: `procurement-intelligence-phase1-report-${Date.now()}`,
    channelPricingCount: channelPricing.length,
    projectPricingCount: projectPricing.length,
    discountRuleCount: discountRules.length,
    leadTimeCount: leadTime.length,
    validation: {
      valid: validation.valid,
      channelPricingValid: validation.channelPricing.valid,
      projectPricingValid: validation.projectPricing.valid,
      discountRulesValid: validation.discountRules.valid,
      leadTimeValid: validation.leadTime.valid,
    },
    summary: [
      "procurement-intelligence-phase1-report",
      `valid=${validation.valid}`,
      `channelPricing=${channelPricing.length}`,
      `projectPricing=${projectPricing.length}`,
      `discountRules=${discountRules.length}`,
      `leadTime=${leadTime.length}`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}

const EXAMPLE_BUNDLE_QUERY = {
  sku: "LF-T5-001",
  region: "East China",
  projectType: "commercial-gym" as const,
  quantity: 10,
};

export function buildProcurementReport(): ProcurementReport {
  const channelPricing = getAllChannelPricing();
  const projectPricing = getAllProjectPricing();
  const discountRules = getAllDiscountRules();
  const leadTime = getAllLeadTimeIntelligence();
  const bundleValidation = validateProcurementBundle(EXAMPLE_BUNDLE_QUERY);
  const exampleBundle = bundleValidation.valid
    ? buildProcurementBundle(EXAMPLE_BUNDLE_QUERY)
    : null;

  return {
    version: PROCUREMENT_INTELLIGENCE_VERSION,
    reportId: `procurement-report-${Date.now()}`,
    channelPricingCount: channelPricing.length,
    projectPricingCount: projectPricing.length,
    discountRuleCount: discountRules.length,
    leadTimeCount: leadTime.length,
    bundleValidation,
    exampleBundle,
    summary: [
      "procurement-report",
      `bundleValid=${bundleValidation.valid}`,
      `channelPricing=${channelPricing.length}`,
      `projectPricing=${projectPricing.length}`,
      `discountRules=${discountRules.length}`,
      `leadTime=${leadTime.length}`,
      exampleBundle
        ? `finalPrice=${exampleBundle.finalPrice} savings=${exampleBundle.savings}`
        : "example=null",
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}

const EXAMPLE_COMMERCIAL_QUERY = {
  sku: "LF-T5-001",
  city: "Shanghai",
  quantity: 10,
  projectType: "commercial-gym" as const,
};

export function buildCommercialBundleReport(): CommercialBundleReport {
  const bundleValidation = validateCommercialBundle(EXAMPLE_COMMERCIAL_QUERY);
  const exampleBundle = bundleValidation.valid
    ? buildCommercialBundle(EXAMPLE_COMMERCIAL_QUERY)
    : null;

  return {
    version: PROCUREMENT_INTELLIGENCE_VERSION,
    reportId: `commercial-bundle-report-${Date.now()}`,
    bundleValidation,
    exampleBundle,
    readinessScore: exampleBundle?.readinessScore ?? 0,
    summary: [
      "commercial-bundle-report",
      `valid=${bundleValidation.valid}`,
      exampleBundle
        ? `readiness=${exampleBundle.readinessScore} finalPrice=${exampleBundle.finalPrice} savings=${exampleBundle.savings}`
        : "example=null",
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
