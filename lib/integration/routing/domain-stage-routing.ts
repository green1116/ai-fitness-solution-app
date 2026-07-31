/**
 * PI-5.2 — Primary Domain → Domain integration point (PD-6.1 O-05).
 * Closed M11–M15 only.
 */
import type { IntegrationPointId } from "../foundation/integration-points";

export const INTEGRATION_DOMAIN_IDS = [
  "M11",
  "M12",
  "M13",
  "M14",
  "M15",
] as const;

export type IntegrationDomainId = (typeof INTEGRATION_DOMAIN_IDS)[number];

export const DOMAIN_INTEGRATION_POINT: Record<
  IntegrationDomainId,
  IntegrationPointId
> = {
  M11: "INTP-DOMAIN-M11",
  M12: "INTP-DOMAIN-M12",
  M13: "INTP-DOMAIN-M13",
  M14: "INTP-DOMAIN-M14",
  M15: "INTP-DOMAIN-M15",
};

export function domainIntegrationPoint(
  domainId: IntegrationDomainId,
): IntegrationPointId {
  return DOMAIN_INTEGRATION_POINT[domainId];
}
