/**
 * Product API Gateway — request policy registry (no authorization)
 */

import { GATEWAY_POLICY_MODES } from "../management/management.constants";
import { getGateway } from "../registry/gateway.registry";
import { getGatewayRoute } from "../route/route.registry";
import type {
  AttachGatewayRequestPolicyInput,
  GatewayRequestPolicy,
} from "./policy.types";

const policies = new Map<string, GatewayRequestPolicy>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePolicy(policy: GatewayRequestPolicy): GatewayRequestPolicy {
  return { ...policy, metadata: { ...policy.metadata } };
}

export function attachGatewayRequestPolicy(
  input: AttachGatewayRequestPolicyInput,
): GatewayRequestPolicy {
  const gatewayId = input.gatewayId.trim();
  const routeId = input.routeId.trim();
  if (!gatewayId) throw new Error("policy.gatewayId is required");
  if (!routeId) throw new Error("policy.routeId is required");
  if (!(GATEWAY_POLICY_MODES as readonly string[]).includes(input.mode)) {
    throw new Error(`invalid policy mode: ${input.mode}`);
  }

  const gateway = getGateway(gatewayId);
  if (!gateway) throw new Error(`gateway not found: ${gatewayId}`);

  const route = getGatewayRoute(routeId);
  if (!route) throw new Error(`route not found: ${routeId}`);
  if (route.gatewayId !== gatewayId) {
    throw new Error(`route gateway mismatch: ${routeId}`);
  }

  const duplicate = [...policies.values()].find((p) => p.routeId === routeId);
  if (duplicate) throw new Error(`policy already exists: ${routeId}`);

  const id = input.id?.trim() || createId("apigwpol");
  if (policies.has(id)) throw new Error(`policy already exists: ${id}`);

  const requireCredential = input.requireCredential === true;
  const policy: GatewayRequestPolicy = {
    id,
    gatewayId,
    routeId,
    mode: input.mode,
    requireCredential,
    detail: `mode=${input.mode} requireCredential=${requireCredential}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  policies.set(id, policy);
  return clonePolicy(policy);
}

export function getGatewayRequestPolicy(
  id: string,
): GatewayRequestPolicy | undefined {
  const policy = policies.get(id.trim());
  return policy ? clonePolicy(policy) : undefined;
}

export function listGatewayRequestPolicies(filter?: {
  gatewayId?: string;
  routeId?: string;
}): GatewayRequestPolicy[] {
  let result = [...policies.values()];
  if (filter?.gatewayId) {
    const gatewayId = filter.gatewayId.trim();
    result = result.filter((p) => p.gatewayId === gatewayId);
  }
  if (filter?.routeId) {
    const routeId = filter.routeId.trim();
    result = result.filter((p) => p.routeId === routeId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePolicy);
}

export function clearGatewayRequestPolicies(): void {
  policies.clear();
}
