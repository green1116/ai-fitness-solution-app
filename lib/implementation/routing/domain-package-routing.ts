/**
 * PI-7.2 — Domain bias for package routing (M11–M15 only).
 * Domains are never primary package owners — packages route to layers.
 */
import {
  IMPLEMENTATION_DOMAIN_IDS,
  type ImplementationDomainId,
} from "../foundation/layer-refs";
import type { ImplementationPackageId } from "../foundation/package-refs";

/** Packages that may cite a primary Domain for route bias. */
export const DOMAIN_AWARE_PACKAGES = [
  "PI-2",
  "PI-3",
  "PI-4",
  "PI-5",
  "PI-6",
] as const satisfies readonly ImplementationPackageId[];

export function packageAllowsDomainBias(
  packageId: ImplementationPackageId,
): boolean {
  return (DOMAIN_AWARE_PACKAGES as readonly string[]).includes(packageId);
}

export function isImplementationDomainId(
  id: string,
): id is ImplementationDomainId {
  return (IMPLEMENTATION_DOMAIN_IDS as readonly string[]).includes(id);
}
