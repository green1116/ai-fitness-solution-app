import type { SaasPlanDefinition } from "../shared/types";

const BASE_FEATURES: Record<string, boolean> = {
  "commercial.quote": true,
  "commercial.summary_pdf": true,
  "commercial.deliverable_package": false,
  "commercial.delivery_orchestrator": false,
  "commercial.approval": false,
  "commercial.audit": false,
  "commercial.release": false,
};

const BASE_QUOTAS: Record<string, number> = {
  "commercial.quote": 10,
  "seats.max": 1,
};

export const SAAS_PLANS: SaasPlanDefinition[] = [
  {
    code: "trial",
    name: "Trial",
    priceMonthly: 0,
    features: { ...BASE_FEATURES, "commercial.deliverable_package": true },
    quotas: { "commercial.quote": 20, "seats.max": 3 },
  },
  {
    code: "starter",
    name: "Starter",
    priceMonthly: 9900,
    features: { ...BASE_FEATURES, "commercial.deliverable_package": true, "commercial.approval": true },
    quotas: { "commercial.quote": 50, "seats.max": 5 },
  },
  {
    code: "pro",
    name: "Pro",
    priceMonthly: 29900,
    features: {
      ...BASE_FEATURES,
      "commercial.deliverable_package": true,
      "commercial.delivery_orchestrator": true,
      "commercial.approval": true,
      "commercial.audit": true,
    },
    quotas: { "commercial.quote": 200, "seats.max": 15 },
  },
  {
    code: "enterprise",
    name: "Enterprise",
    priceMonthly: 99900,
    features: {
      "commercial.quote": true,
      "commercial.summary_pdf": true,
      "commercial.deliverable_package": true,
      "commercial.delivery_orchestrator": true,
      "commercial.approval": true,
      "commercial.audit": true,
      "commercial.release": true,
    },
    quotas: { "commercial.quote": 1000, "seats.max": 50 },
  },
  {
    code: "platform",
    name: "Platform",
    priceMonthly: 0,
    features: {
      "commercial.quote": true,
      "commercial.summary_pdf": true,
      "commercial.deliverable_package": true,
      "commercial.delivery_orchestrator": true,
      "commercial.approval": true,
      "commercial.audit": true,
      "commercial.release": true,
    },
    quotas: { "commercial.quote": 999999, "seats.max": 999 },
  },
];

export function getPlanByCode(code: string): SaasPlanDefinition | undefined {
  return SAAS_PLANS.find((plan) => plan.code === code);
}
