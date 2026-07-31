/**
 * PI-3.3 — Domain port registry (L3).
 * Aligns with PI-3.1 DOMAIN_OWNERSHIP — reuses M11–M15 only.
 */
import {
  DOMAIN_OWNERSHIP,
  type ProductDomainId,
} from "../foundation/domain-ownership";

export const DOMAIN_PORT_LAYER_ID =
  "product-backend-domain-ports-v1" as const;

export type DomainCapabilityKind =
  | "knowledge"
  | "agent"
  | "os"
  | "intelligence"
  | "evolution";

export type DomainPortRecord = Readonly<{
  domainId: ProductDomainId;
  modulePath: string;
  baselineId: string;
  capabilityKind: DomainCapabilityKind;
  indexPath: string;
  baselineLockPath: string;
}>;

const CAPABILITY_KIND: Record<ProductDomainId, DomainCapabilityKind> = {
  M11: "knowledge",
  M12: "agent",
  M13: "os",
  M14: "intelligence",
  M15: "evolution",
};

export const DOMAIN_PORT_REGISTRY: readonly DomainPortRecord[] =
  DOMAIN_OWNERSHIP.map((row) => ({
    domainId: row.id,
    modulePath: row.path,
    baselineId: row.baselineId,
    capabilityKind: CAPABILITY_KIND[row.id],
    indexPath: `${row.path}/index.ts`,
    baselineLockPath: `${row.path}/baseline/freeze/freeze.lock.ts`,
  }));

export type ResolvedDomainPort = Readonly<{
  domainId: ProductDomainId;
  modulePath: string;
  baselineId: string;
  capabilityKind: DomainCapabilityKind;
  role: "primary-decision" | "supporting-assist";
}>;

export function getDomainPortRecord(
  domainId: ProductDomainId,
): DomainPortRecord {
  const row = DOMAIN_PORT_REGISTRY.find((p) => p.domainId === domainId);
  if (!row) throw new Error(`Unknown domain port ${domainId}`);
  return row;
}

export function resolveDomainPort(
  domainId: ProductDomainId,
  role: ResolvedDomainPort["role"] = "primary-decision",
): ResolvedDomainPort {
  const row = getDomainPortRecord(domainId);
  return {
    domainId: row.domainId,
    modulePath: row.modulePath,
    baselineId: row.baselineId,
    capabilityKind: row.capabilityKind,
    role,
  };
}

export function resolveSupportingPorts(
  supporting: readonly ProductDomainId[],
): ResolvedDomainPort[] {
  return supporting.map((id) => resolveDomainPort(id, "supporting-assist"));
}
