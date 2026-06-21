/**
 * V60 P4 — API platform gateway (feature-gate aware, no billing bypass)
 */

import type { NextRequest } from "next/server";

import { FeatureGateError } from "@/lib/feature-flags/feature-gate";
import { validateApiAccess } from "./api.plan.manager";
import { listApiEndpoints } from "./api.registry";

export type ApiGatewayContext = {
  organizationId: string;
  endpoint: string;
  apiKeyId?: string;
  allowed: boolean;
  rateLimit?: number;
};

export async function runApiPlatformGate(input: {
  organizationId: string;
  endpoint: string;
  apiKeyId?: string;
}): Promise<ApiGatewayContext> {
  const access = await validateApiAccess({
    organizationId: input.organizationId,
    endpoint: input.endpoint,
  });

  if (!access.allowed) {
    throw new FeatureGateError(access.reason ?? "API platform access denied");
  }

  return {
    organizationId: input.organizationId,
    endpoint: input.endpoint,
    apiKeyId: input.apiKeyId,
    allowed: true,
    rateLimit: access.rateLimit,
  };
}

export function extractApiKeyFromRequest(req: NextRequest): string | undefined {
  const header = req.headers.get("x-api-key")?.trim();
  if (header) return header;
  const auth = req.headers.get("authorization")?.trim();
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return undefined;
}

export function getPlatformCatalog() {
  return {
    endpoints: listApiEndpoints(),
    authMethods: ["session", "x-api-key", "bearer"],
    requiredFeature: "canUseAPI",
    requiredPlan: "ENTERPRISE",
  };
}
