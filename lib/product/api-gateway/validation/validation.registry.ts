/**
 * Product API Gateway — request validation (no business logic)
 */

import { GATEWAY_HTTP_METHODS } from "../management/management.constants";
import { listGatewayRequestPolicies } from "../policy/policy.registry";
import { getGateway } from "../registry/gateway.registry";
import { resolveGatewayRoute } from "../route/route.registry";
import type {
  GatewayRequestValidation,
  GatewayValidationVerdict,
  ValidateGatewayRequestInput,
} from "./validation.types";

const validations = new Map<string, GatewayRequestValidation>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneValidation(
  validation: GatewayRequestValidation,
): GatewayRequestValidation {
  return { ...validation, metadata: { ...validation.metadata } };
}

export function validateGatewayRequest(
  input: ValidateGatewayRequestInput,
): GatewayRequestValidation {
  const gatewayId = input.gatewayId.trim();
  const path = input.path.trim();
  const credentialRef = input.credentialRef?.trim().toUpperCase();
  if (!gatewayId) throw new Error("validation.gatewayId is required");
  if (!path) throw new Error("validation.path is required");
  if (!(GATEWAY_HTTP_METHODS as readonly string[]).includes(input.method)) {
    throw new Error(`invalid validation method: ${input.method}`);
  }

  const gateway = getGateway(gatewayId);
  if (!gateway || gateway.status !== "ACTIVE") {
    throw new Error(`gateway not available: ${gatewayId}`);
  }

  const resolution = resolveGatewayRoute({
    gatewayId,
    method: input.method,
    path,
  });

  let verdict: GatewayValidationVerdict = "UNRESOLVED";
  let routeId: string | undefined;
  let policyId: string | undefined;
  let detail = resolution.detail;

  if (resolution.resolved && resolution.route) {
    routeId = resolution.route.id;
    const policies = listGatewayRequestPolicies({ routeId });
    const policy = policies[0];
    if (!policy) {
      verdict = "REJECTED";
      detail = "request policy missing";
    } else {
      policyId = policy.id;
      if (policy.mode === "OPEN") {
        verdict = "ACCEPTED";
        detail = "accepted open policy";
      } else if (
        policy.requireCredential === true ||
        policy.mode === "AUTH_REQUIRED" ||
        policy.mode === "INTERNAL"
      ) {
        if (credentialRef) {
          verdict = "ACCEPTED";
          detail = `accepted credentialRef=${credentialRef}`;
        } else {
          verdict = "REJECTED";
          detail = "credential required";
        }
      } else {
        verdict = "ACCEPTED";
        detail = `accepted mode=${policy.mode}`;
      }
    }
  }

  const id = input.id?.trim() || createId("apigwval");
  if (validations.has(id)) {
    throw new Error(`validation already exists: ${id}`);
  }

  const validation: GatewayRequestValidation = {
    id,
    gatewayId,
    method: input.method,
    path: resolution.route?.path ?? path,
    routeId,
    policyId,
    credentialRef: credentialRef || undefined,
    verdict,
    detail,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  validations.set(id, validation);
  return cloneValidation(validation);
}

export function getGatewayRequestValidation(
  id: string,
): GatewayRequestValidation | undefined {
  const validation = validations.get(id.trim());
  return validation ? cloneValidation(validation) : undefined;
}

export function listGatewayRequestValidations(filter?: {
  gatewayId?: string;
}): GatewayRequestValidation[] {
  let result = [...validations.values()];
  if (filter?.gatewayId) {
    const gatewayId = filter.gatewayId.trim();
    result = result.filter((v) => v.gatewayId === gatewayId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneValidation);
}

export function clearGatewayRequestValidations(): void {
  validations.clear();
}
