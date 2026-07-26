/**
 * Product API Gateway — Release manifest + checksum
 */

import { createHash } from "node:crypto";

import { listGatewayRequestPolicies } from "../policy/policy.registry";
import { getGateway } from "../registry/gateway.registry";
import { listGatewayRoutes } from "../route/route.registry";
import { listGatewayRequestValidations } from "../validation/validation.registry";

export type ApiGatewayReleaseManifest = {
  id: string;
  gatewayId: string;
  gatewayKey: string;
  checksum: string;
  routeId: string;
  policyId: string;
  validationId: string;
  createdAt: string;
};

const releases = new Map<string, ApiGatewayReleaseManifest>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRelease(
  release: ApiGatewayReleaseManifest,
): ApiGatewayReleaseManifest {
  return { ...release };
}

export function createApiGatewayReleaseManifest(input: {
  id?: string;
  gatewayId: string;
}): ApiGatewayReleaseManifest {
  const gatewayId = input.gatewayId.trim();
  if (!gatewayId) throw new Error("manifest.gatewayId is required");

  const gateway = getGateway(gatewayId);
  if (!gateway) throw new Error(`gateway not found: ${gatewayId}`);

  const routes = listGatewayRoutes({ gatewayId });
  if (routes.length < 1) throw new Error("gateway route missing");
  const policies = listGatewayRequestPolicies({ gatewayId });
  if (policies.length < 1) throw new Error("request policy missing");
  const validations = listGatewayRequestValidations({ gatewayId });
  const accepted = validations.find((v) => v.verdict === "ACCEPTED");
  if (!accepted) throw new Error("accepted validation missing");

  const payload = {
    gatewayKey: gateway.gatewayKey,
    status: gateway.status,
    route: {
      routeKey: routes[0].routeKey,
      method: routes[0].method,
      path: routes[0].path,
      apiKeyRef: routes[0].apiKeyRef,
    },
    policy: {
      mode: policies[0].mode,
      requireCredential: policies[0].requireCredential,
    },
    validation: {
      verdict: accepted.verdict,
      method: accepted.method,
      path: accepted.path,
    },
  };

  const id = input.id?.trim() || createId("apigwrel");
  if (releases.has(id)) throw new Error(`release already exists: ${id}`);

  const release: ApiGatewayReleaseManifest = {
    id,
    gatewayId,
    gatewayKey: gateway.gatewayKey,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    routeId: routes[0].id,
    policyId: policies[0].id,
    validationId: accepted.id,
    createdAt: nowIso(),
  };
  releases.set(id, release);
  return cloneRelease(release);
}

export function getApiGatewayReleaseManifest(
  id: string,
): ApiGatewayReleaseManifest | undefined {
  const release = releases.get(id.trim());
  return release ? cloneRelease(release) : undefined;
}

export function listApiGatewayReleaseManifests(): ApiGatewayReleaseManifest[] {
  return [...releases.values()]
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRelease);
}

export function clearApiGatewayReleaseManifests(): void {
  releases.clear();
}
