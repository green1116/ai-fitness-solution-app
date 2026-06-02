import type { CustomerHealth, CustomerHealthStatus } from "./types";

function resolveHealthStatus(score: number): CustomerHealthStatus {
  if (score >= 80) return "healthy";
  if (score >= 65) return "attention";
  if (score >= 45) return "at-risk";
  return "critical";
}

export function buildCustomerHealth(input?: {
  deploymentId?: string;
  customerId?: string;
  score?: number;
}): CustomerHealth {
  const deploymentId = input?.deploymentId ?? "customer-success-default";
  const customerId = input?.customerId ?? `customer-${deploymentId}`;
  const score = input?.score ?? 76;
  const status = resolveHealthStatus(score);

  return {
    healthId: `customer-health-${deploymentId}`,
    customerId,
    status,
    score,
    summary: `customer-health customer=${customerId} status=${status} score=${score}`,
  };
}
