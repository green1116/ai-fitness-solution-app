/**
 * PI-7.2 — Package dependency / chain routing (PI-2→…→PI-6).
 * Closed chain — no new packages or architecture.
 */
import {
  IMPLEMENTATION_PACKAGE_CATALOGUE,
  IMPLEMENTATION_PACKAGE_IDS,
  type ImplementationPackageId,
} from "../foundation/package-refs";

export type PackageDependencyRoute = Readonly<{
  packageId: ImplementationPackageId;
  /** Upstream packages that must remain frozen before this package. */
  upstreamPackageIds: readonly ImplementationPackageId[];
  /** Downstream packages that consume this package freeze. */
  downstreamPackageIds: readonly ImplementationPackageId[];
  notes: string;
}>;

export const PACKAGE_DEPENDENCY_ROUTES = [
  {
    packageId: "PI-2",
    upstreamPackageIds: [],
    downstreamPackageIds: ["PI-3", "PI-4", "PI-5", "PI-6"],
    notes: "Frontend freeze is first implementation package",
  },
  {
    packageId: "PI-3",
    upstreamPackageIds: ["PI-2"],
    downstreamPackageIds: ["PI-4", "PI-5", "PI-6"],
    notes: "Backend after Frontend baseline exists",
  },
  {
    packageId: "PI-4",
    upstreamPackageIds: ["PI-2", "PI-3"],
    downstreamPackageIds: ["PI-5", "PI-6"],
    notes: "Data after Backend persistence architecture",
  },
  {
    packageId: "PI-5",
    upstreamPackageIds: ["PI-2", "PI-3", "PI-4"],
    downstreamPackageIds: ["PI-6"],
    notes: "Integration after FE/BE/Data freezes",
  },
  {
    packageId: "PI-6",
    upstreamPackageIds: ["PI-2", "PI-3", "PI-4", "PI-5"],
    downstreamPackageIds: [],
    notes: "Delivery readiness after Integration freeze",
  },
] as const satisfies readonly PackageDependencyRoute[];

/** Canonical closed implementation chain. */
export const IMPLEMENTATION_PACKAGE_CHAIN = [
  "PI-2",
  "PI-3",
  "PI-4",
  "PI-5",
  "PI-6",
] as const satisfies readonly ImplementationPackageId[];

export function getPackageDependencyRoute(
  packageId: ImplementationPackageId,
): PackageDependencyRoute | undefined {
  return PACKAGE_DEPENDENCY_ROUTES.find((r) => r.packageId === packageId);
}

export function packageDependencyMatchesFoundation(
  route: PackageDependencyRoute,
): boolean {
  return (
    IMPLEMENTATION_PACKAGE_IDS.includes(route.packageId) &&
    IMPLEMENTATION_PACKAGE_CATALOGUE.some(
      (p) => p.packageId === route.packageId,
    ) &&
    route.upstreamPackageIds.every((id) =>
      IMPLEMENTATION_PACKAGE_IDS.includes(id),
    ) &&
    route.downstreamPackageIds.every((id) =>
      IMPLEMENTATION_PACKAGE_IDS.includes(id),
    )
  );
}
