/**
 * PI-3.3 — Resolve Domain ports + runtime adapters for a service plan.
 */
import { getCommandOwnership } from "../foundation/command-ownership";
import { resolveServiceForAction } from "../services/action-service-routing";
import {
  resolveDomainPort,
  resolveSupportingPorts,
  type ResolvedDomainPort,
} from "./domain-port-registry";
import {
  adaptersForService,
  SERVICE_RUNTIME_SURFACES,
  type RuntimeAdapterBinding,
} from "./runtime-bindings";
import type { RuntimeSurfaceId } from "./runtime-surfaces";
import type { BackendServiceId } from "../foundation/service-catalogue";

export type RuntimeBindingPlan = Readonly<{
  actionId: string;
  serviceId: BackendServiceId;
  primaryPort: ResolvedDomainPort;
  supportingPorts: readonly ResolvedDomainPort[];
  surfaces: readonly RuntimeSurfaceId[];
  adapters: readonly RuntimeAdapterBinding[];
  requiresRuntimeAdapter: boolean;
}>;

/**
 * Bind PI-3.2 service routing to L3 ports + L2 runtime adapters.
 */
export function resolveRuntimeBindingPlan(
  actionId: string,
): RuntimeBindingPlan {
  const ownership = getCommandOwnership(actionId);
  if (!ownership) {
    throw new Error(`Unknown action for runtime binding: ${actionId}`);
  }
  const serviceId = resolveServiceForAction(actionId);
  if (!serviceId) {
    throw new Error(`No service routing for ${actionId}`);
  }

  const surfaces = SERVICE_RUNTIME_SURFACES[serviceId];
  const adapters =
    ownership.executionKind === "NavPref" ? [] : adaptersForService(serviceId);

  return {
    actionId,
    serviceId,
    primaryPort: resolveDomainPort(ownership.primaryDomain, "primary-decision"),
    supportingPorts: resolveSupportingPorts(ownership.supportingDomains),
    surfaces,
    adapters,
    requiresRuntimeAdapter: ownership.executionKind !== "NavPref",
  };
}
