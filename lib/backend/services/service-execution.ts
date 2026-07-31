/**
 * PI-3.2 — Service / Command execution planning (PD-5.2).
 * Plans L4 orchestration against existing Domains/APIs — no transport ownership here.
 */
import { API_FAMILY_OWNERSHIP } from "../foundation/api-ownership";
import {
  BACKEND_COMMAND_OWNERSHIP,
  getCommandOwnership,
  type CommandExecutionKind,
} from "../foundation/command-ownership";
import type { ProductDomainId } from "../foundation/domain-ownership";
import {
  BACKEND_SERVICE_CATALOGUE,
  type BackendServiceId,
} from "../foundation/service-catalogue";
import {
  resolveServiceForAction,
  serviceAllowsPrimaryDomain,
} from "./action-service-routing";
import {
  resolveDomainPort,
  resolveSupportingPorts,
  type DomainCapabilityPort,
} from "./domain-ports";

export const SERVICE_LAYER_ID = "product-backend-service-layer-v1" as const;

export type OrchestrationStep =
  | "identify-command"
  | "resolve-service"
  | "authorize"
  | "execute-primary-domain"
  | "execute-supporting-domains"
  | "map-response-dto"
  | "return-api-edge";

export type ServiceExecutionPlan = Readonly<{
  actionId: string;
  command: string;
  serviceId: BackendServiceId;
  executionKind: CommandExecutionKind;
  requiresHttpOrchestration: boolean;
  primaryDomain: ProductDomainId;
  supportingDomains: readonly ProductDomainId[];
  primaryPort: DomainCapabilityPort;
  supportingPorts: readonly DomainCapabilityPort[];
  apiFamilyHint: string | null;
  steps: readonly OrchestrationStep[];
  mutatesDomain: boolean;
}>;

const HTTP_STEPS: readonly OrchestrationStep[] = [
  "identify-command",
  "resolve-service",
  "authorize",
  "execute-primary-domain",
  "execute-supporting-domains",
  "map-response-dto",
  "return-api-edge",
] as const;

const NAV_PREF_STEPS: readonly OrchestrationStep[] = [
  "identify-command",
  "resolve-service",
] as const;

function hintApiFamily(primaryDomain: ProductDomainId): string | null {
  const row = API_FAMILY_OWNERSHIP.find((f) => f.ownerDomain === primaryDomain);
  return row?.family ?? null;
}

/**
 * Plan Command/Query execution for an ACT-* (CH / QH / OR rules).
 * Does not invoke Domain modules or HTTP.
 */
export function planServiceExecution(actionId: string): ServiceExecutionPlan {
  const ownership = getCommandOwnership(actionId);
  if (!ownership) {
    throw new Error(`Unknown action for service layer: ${actionId}`);
  }

  const serviceId = resolveServiceForAction(actionId);
  if (!serviceId) {
    throw new Error(`No service routing for ${actionId}`);
  }

  if (!serviceAllowsPrimaryDomain(serviceId, ownership.primaryDomain)) {
    throw new Error(
      `Service ${serviceId} cannot own primary ${ownership.primaryDomain} for ${actionId}`,
    );
  }

  const catalogue = BACKEND_SERVICE_CATALOGUE.find((s) => s.id === serviceId);
  if (!catalogue) {
    throw new Error(`Unknown service catalogue row ${serviceId}`);
  }

  const requiresHttpOrchestration = ownership.executionKind !== "NavPref";
  const mutatesDomain = ownership.executionKind === "Command";

  return {
    actionId: ownership.actionId,
    command: ownership.command,
    serviceId,
    executionKind: ownership.executionKind,
    requiresHttpOrchestration,
    primaryDomain: ownership.primaryDomain,
    supportingDomains: ownership.supportingDomains,
    primaryPort: resolveDomainPort(ownership.primaryDomain, "primary-decision"),
    supportingPorts: resolveSupportingPorts(ownership.supportingDomains),
    apiFamilyHint: requiresHttpOrchestration
      ? hintApiFamily(ownership.primaryDomain)
      : null,
    steps: requiresHttpOrchestration ? HTTP_STEPS : NAV_PREF_STEPS,
    mutatesDomain,
  };
}

/**
 * Settle a planned execution as acceptance acknowledgment (no Domain call).
 * Queries never report mutation; NavPref skips Domain mutation.
 */
export function settleServicePlan(plan: ServiceExecutionPlan): Readonly<{
  accepted: true;
  serviceId: BackendServiceId;
  primaryDomain: string;
  wroteDomain: boolean;
  emptyAllowed: boolean;
}> {
  return {
    accepted: true,
    serviceId: plan.serviceId,
    primaryDomain: plan.primaryDomain,
    wroteDomain: plan.mutatesDomain,
    emptyAllowed: plan.executionKind === "Query",
  };
}

/** PD-5.2 §4.3 Golden Path dominant service sequences. */
export const GOLDEN_PATH_SERVICE_SEQUENCES = [
  {
    pathId: "GP-01",
    services: [
      "SVC-ACCESS",
      "SVC-AGENT",
      "SVC-INTELLIGENCE",
      "SVC-PROJECT",
      "SVC-AGENT",
      "SVC-INTELLIGENCE",
      "SVC-DOCUMENT",
    ] as const satisfies readonly BackendServiceId[],
  },
  {
    pathId: "GP-01R",
    services: ["SVC-PROJECT", "SVC-AGENT"] as const satisfies readonly BackendServiceId[],
  },
  {
    pathId: "GP-02",
    services: [
      "SVC-ACCESS",
      "SVC-KNOWLEDGE-INTAKE",
      "SVC-AGENT",
      "SVC-INTELLIGENCE",
      "SVC-DOCUMENT",
    ] as const satisfies readonly BackendServiceId[],
  },
  {
    pathId: "GP-03",
    services: [
      "SVC-ACCESS",
      "SVC-AGENT",
      "SVC-INTELLIGENCE",
      "SVC-EVOLUTION",
      "SVC-DOCUMENT",
    ] as const satisfies readonly BackendServiceId[],
  },
  {
    pathId: "GP-04",
    services: ["SVC-OPS", "SVC-EVOLUTION"] as const satisfies readonly BackendServiceId[],
  },
] as const;

export function listRoutedActionIds(): string[] {
  return BACKEND_COMMAND_OWNERSHIP.map((row) => row.actionId);
}
