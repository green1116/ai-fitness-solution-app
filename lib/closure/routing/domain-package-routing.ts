/**
 * PI-8.2 — Domain bias for closure package routing (M11–M15 only).
 */
import {
  CLOSURE_DOMAIN_IDS,
  type ClosureDomainId,
} from "../foundation/layer-refs";
import type { ClosurePackageId } from "../foundation/package-refs";

export const CLOSURE_DOMAIN_AWARE_PACKAGES = [
  "PI-2",
  "PI-3",
  "PI-4",
  "PI-5",
  "PI-6",
  "PI-7",
] as const satisfies readonly ClosurePackageId[];

export function closurePackageAllowsDomainBias(
  packageId: ClosurePackageId,
): boolean {
  return (CLOSURE_DOMAIN_AWARE_PACKAGES as readonly string[]).includes(
    packageId,
  );
}

export function isClosureDomainId(id: string): id is ClosureDomainId {
  return (CLOSURE_DOMAIN_IDS as readonly string[]).includes(id);
}
