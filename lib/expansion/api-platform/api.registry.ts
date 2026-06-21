/**
 * V60 P4 — API platform registry
 */

import type { ApiAccessPlan } from "../expansion.types";

export type ApiEndpointDefinition = {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  feature: "canUseAPI";
  description: string;
};

export const API_ENDPOINT_REGISTRY: ApiEndpointDefinition[] = [
  { path: "/api/quote/generate", method: "POST", feature: "canUseAPI", description: "Generate quote" },
  { path: "/api/budget/calculate", method: "POST", feature: "canUseAPI", description: "Calculate budget" },
  { path: "/api/tender/generate", method: "POST", feature: "canUseAPI", description: "Generate tender" },
  { path: "/api/crm/customers", method: "GET", feature: "canUseAPI", description: "List CRM customers" },
  { path: "/api/sales/analyze", method: "POST", feature: "canUseAPI", description: "Sales AI analysis" },
  { path: "/api/expansion/deploy", method: "POST", feature: "canUseAPI", description: "Deploy tenant instance" },
];

export const API_ACCESS_PLANS: Record<string, ApiAccessPlan> = {
  basic_api: {
    planId: "basic_api",
    name: "Basic API",
    saasPlan: "BASIC",
    rateLimitPerMinute: 0,
    allowedEndpoints: [],
  },
  pro_api: {
    planId: "pro_api",
    name: "Pro API",
    saasPlan: "PRO",
    rateLimitPerMinute: 60,
    allowedEndpoints: ["/api/quote/generate", "/api/budget/calculate"],
  },
  enterprise_api: {
    planId: "enterprise_api",
    name: "Enterprise API",
    saasPlan: "ENTERPRISE",
    rateLimitPerMinute: 600,
    allowedEndpoints: API_ENDPOINT_REGISTRY.map((e) => e.path),
  },
};

export function registerAPIAccessPlan(plan: ApiAccessPlan): ApiAccessPlan {
  API_ACCESS_PLANS[plan.planId] = plan;
  return plan;
}

export function getApiAccessPlan(planId: string): ApiAccessPlan | undefined {
  return API_ACCESS_PLANS[planId];
}

export function listApiEndpoints(): ApiEndpointDefinition[] {
  return [...API_ENDPOINT_REGISTRY];
}
