/**
 * PI-8.2 — Package dependency / chain routing (PI-2→…→PI-7).
 * Closed chain — no new packages or architecture.
 */
import {
  CLOSURE_PACKAGE_CATALOGUE,
  CLOSURE_PACKAGE_IDS,
  type ClosurePackageId,
} from "../foundation/package-refs";

export type ClosurePackageDependencyRoute = Readonly<{
  packageId: ClosurePackageId;
  upstreamPackageIds: readonly ClosurePackageId[];
  downstreamPackageIds: readonly ClosurePackageId[];
  notes: string;
}>;

export const CLOSURE_PACKAGE_DEPENDENCY_ROUTES = [
  {
    packageId: "PI-2",
    upstreamPackageIds: [],
    downstreamPackageIds: ["PI-3", "PI-4", "PI-5", "PI-6", "PI-7"],
    notes: "Frontend freeze is first package",
  },
  {
    packageId: "PI-3",
    upstreamPackageIds: ["PI-2"],
    downstreamPackageIds: ["PI-4", "PI-5", "PI-6", "PI-7"],
    notes: "Backend after Frontend",
  },
  {
    packageId: "PI-4",
    upstreamPackageIds: ["PI-2", "PI-3"],
    downstreamPackageIds: ["PI-5", "PI-6", "PI-7"],
    notes: "Data after Backend",
  },
  {
    packageId: "PI-5",
    upstreamPackageIds: ["PI-2", "PI-3", "PI-4"],
    downstreamPackageIds: ["PI-6", "PI-7"],
    notes: "Integration after FE/BE/Data",
  },
  {
    packageId: "PI-6",
    upstreamPackageIds: ["PI-2", "PI-3", "PI-4", "PI-5"],
    downstreamPackageIds: ["PI-7"],
    notes: "Delivery readiness after Integration",
  },
  {
    packageId: "PI-7",
    upstreamPackageIds: ["PI-2", "PI-3", "PI-4", "PI-5", "PI-6"],
    downstreamPackageIds: [],
    notes: "Product implementation after Delivery readiness",
  },
] as const satisfies readonly ClosurePackageDependencyRoute[];

/** Canonical closed closure chain. */
export const CLOSURE_PACKAGE_CHAIN = [
  "PI-2",
  "PI-3",
  "PI-4",
  "PI-5",
  "PI-6",
  "PI-7",
] as const satisfies readonly ClosurePackageId[];

export function getClosurePackageDependencyRoute(
  packageId: ClosurePackageId,
): ClosurePackageDependencyRoute | undefined {
  return CLOSURE_PACKAGE_DEPENDENCY_ROUTES.find(
    (r) => r.packageId === packageId,
  );
}

export function closurePackageDependencyMatchesFoundation(
  route: ClosurePackageDependencyRoute,
): boolean {
  return (
    CLOSURE_PACKAGE_IDS.includes(route.packageId) &&
    CLOSURE_PACKAGE_CATALOGUE.some((p) => p.packageId === route.packageId) &&
    route.upstreamPackageIds.every((id) => CLOSURE_PACKAGE_IDS.includes(id)) &&
    route.downstreamPackageIds.every((id) => CLOSURE_PACKAGE_IDS.includes(id))
  );
}
