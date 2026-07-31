/**
 * PI-3.2 — Action → L4 Service routing (PD-5.2 §5–§7).
 * One product binding → one primary service entry; respects PI-3.1 Domain ownership.
 */
import type { BackendServiceId } from "../foundation/service-catalogue";
import type { ProductDomainId } from "../foundation/domain-ownership";

/**
 * Closed map: every ACT-* resolves to exactly one SVC-*.
 * NavPref still names a service surface; HTTP orchestration is skipped at plan time.
 */
export const ACTION_SERVICE_ROUTING = [
  { actionId: "ACT-01-01", serviceId: "SVC-ACCESS" },
  { actionId: "ACT-01-02", serviceId: "SVC-ACCESS" },
  { actionId: "ACT-01-03", serviceId: "SVC-ACCESS" },
  { actionId: "ACT-01-04", serviceId: "SVC-ACCESS" },
  { actionId: "ACT-01-05", serviceId: "SVC-ACCESS" },
  { actionId: "ACT-01-06", serviceId: "SVC-PROJECT" },
  { actionId: "ACT-02-01", serviceId: "SVC-AGENT" },
  { actionId: "ACT-02-02", serviceId: "SVC-INTELLIGENCE" },
  { actionId: "ACT-02-03", serviceId: "SVC-PROJECT" },
  { actionId: "ACT-03-01", serviceId: "SVC-KNOWLEDGE-INTAKE" },
  { actionId: "ACT-03-02", serviceId: "SVC-KNOWLEDGE-INTAKE" },
  { actionId: "ACT-03-03", serviceId: "SVC-KNOWLEDGE-INTAKE" },
  { actionId: "ACT-04-01", serviceId: "SVC-AGENT" },
  { actionId: "ACT-04-02", serviceId: "SVC-PROJECT" },
  { actionId: "ACT-04-03", serviceId: "SVC-KNOWLEDGE-INTAKE" },
  { actionId: "ACT-04-04", serviceId: "SVC-AGENT" },
  { actionId: "ACT-04-05", serviceId: "SVC-INTELLIGENCE" },
  { actionId: "ACT-04-06", serviceId: "SVC-INTELLIGENCE" },
  { actionId: "ACT-04-07", serviceId: "SVC-INTELLIGENCE" },
  { actionId: "ACT-04-08", serviceId: "SVC-DOCUMENT" },
  { actionId: "ACT-05-01", serviceId: "SVC-INTELLIGENCE" },
  { actionId: "ACT-05-02", serviceId: "SVC-INTELLIGENCE" },
  { actionId: "ACT-05-03", serviceId: "SVC-DOCUMENT" },
  { actionId: "ACT-05-04", serviceId: "SVC-EVOLUTION" },
  { actionId: "ACT-05-05", serviceId: "SVC-INTELLIGENCE" },
  { actionId: "ACT-05-06", serviceId: "SVC-DOCUMENT" },
  { actionId: "ACT-05-07", serviceId: "SVC-PROJECT" },
  { actionId: "ACT-06-01", serviceId: "SVC-INTELLIGENCE" },
  { actionId: "ACT-06-02", serviceId: "SVC-DOCUMENT" },
  { actionId: "ACT-06-03", serviceId: "SVC-PROJECT" },
  { actionId: "ACT-06-04", serviceId: "SVC-DOCUMENT" },
  { actionId: "ACT-06-05", serviceId: "SVC-PROJECT" },
  { actionId: "ACT-07-01", serviceId: "SVC-PROJECT" },
  { actionId: "ACT-07-02", serviceId: "SVC-PROJECT" },
  { actionId: "ACT-07-03", serviceId: "SVC-DOCUMENT" },
  { actionId: "ACT-08-01", serviceId: "SVC-DOCUMENT" },
  { actionId: "ACT-08-02", serviceId: "SVC-DOCUMENT" },
  { actionId: "ACT-08-03", serviceId: "SVC-DOCUMENT" },
  { actionId: "ACT-08-04", serviceId: "SVC-EVOLUTION" },
  { actionId: "ACT-08-05", serviceId: "SVC-PROJECT" },
  { actionId: "ACT-08-06", serviceId: "SVC-PROJECT" },
  { actionId: "ACT-09-01", serviceId: "SVC-OPS" },
  { actionId: "ACT-09-02", serviceId: "SVC-OPS" },
  { actionId: "ACT-09-03", serviceId: "SVC-OPS" },
  { actionId: "ACT-09-04", serviceId: "SVC-OPS" },
  { actionId: "ACT-09-05", serviceId: "SVC-OPS" },
  { actionId: "ACT-09-06", serviceId: "SVC-EVOLUTION" },
] as const satisfies readonly Readonly<{
  actionId: string;
  serviceId: BackendServiceId;
}>[];

/** PD-5.2 §7.2 — Domain primary → allowed service bias. */
export const DOMAIN_SERVICE_BIAS: Record<
  ProductDomainId,
  readonly BackendServiceId[]
> = {
  M11: ["SVC-KNOWLEDGE-INTAKE", "SVC-DOCUMENT"],
  M12: ["SVC-AGENT"],
  M13: ["SVC-ACCESS", "SVC-PROJECT", "SVC-OPS"],
  M14: ["SVC-INTELLIGENCE"],
  M15: ["SVC-EVOLUTION"],
};

export function resolveServiceForAction(
  actionId: string,
): BackendServiceId | undefined {
  return ACTION_SERVICE_ROUTING.find((row) => row.actionId === actionId)
    ?.serviceId;
}

export function serviceAllowsPrimaryDomain(
  serviceId: BackendServiceId,
  primaryDomain: ProductDomainId,
): boolean {
  return DOMAIN_SERVICE_BIAS[primaryDomain].includes(serviceId);
}
