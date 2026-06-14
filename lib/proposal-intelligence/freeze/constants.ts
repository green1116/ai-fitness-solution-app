export const PROPOSAL_INTELLIGENCE_FROZEN_DOMAINS = [
  "proposal-score",
  "risk-analysis",
  "recommendations",
  "win-probability",
  "bid-strategy",
] as const;

export const PROPOSAL_INTELLIGENCE_RISK_CATEGORIES = [
  "inventory",
  "supplier-concentration",
  "lead-time",
  "service-coverage",
  "pricing",
] as const;

export const PROPOSAL_INTELLIGENCE_STRATEGY_TYPES = [
  "high-confidence",
  "balanced",
  "aggressive",
  "cost-optimized",
] as const;

export const PROPOSAL_INTELLIGENCE_SCORING_DIMENSIONS = [
  "catalogScore",
  "supplierScore",
  "procurementScore",
  "deliveryScore",
  "coverageScore",
] as const;

export const PROPOSAL_INTELLIGENCE_VALIDATION_GATES = 15;
