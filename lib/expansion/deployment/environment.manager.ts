/**
 * V60 P4 — Environment manager
 */

import type { DeploymentEnvironment } from "../expansion.types";

export function resolveDeploymentEnvironment(): DeploymentEnvironment {
  const env = process.env.APP_ENV?.trim() || process.env.NODE_ENV?.trim() || "development";
  if (env === "production" || env === "prod") return "production";
  if (env === "staging" || env === "stage") return "staging";
  return "development";
}

export function isProductionDeployment(): boolean {
  return resolveDeploymentEnvironment() === "production";
}

export function getEnvironmentConfig(env?: DeploymentEnvironment) {
  const resolved = env ?? resolveDeploymentEnvironment();
  return {
    environment: resolved,
    allowMockBilling: resolved !== "production",
    requireStripeWebhook: resolved === "production",
    maxTenantsPerInstance: resolved === "production" ? 10_000 : 100,
  };
}
