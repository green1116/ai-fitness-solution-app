/**
 * PI-7.3 — Package → implementation runtime bindings.
 * Reuses PI-7.2 package routes — invents no packages/architecture.
 */
import type { ImplementationPackageId } from "../foundation/package-refs";
import { IMPLEMENTATION_PACKAGE_CATALOGUE } from "../foundation/package-refs";
import { getPackageLayerRoute } from "../routing/package-layer-routing";

export type ImplementationRuntimeMode =
  | "present"
  | "orchestrate"
  | "persist"
  | "integrate"
  | "ready";

export type PackageRuntimeBinding = Readonly<{
  packageId: ImplementationPackageId;
  mode: ImplementationRuntimeMode;
  evidenceScript: string;
  freezeId: string;
  notes: string;
}>;

/**
 * Closed package runtime bindings — one per PI-7.1 / PI-7.2 package.
 */
export const PACKAGE_RUNTIME_BINDINGS = [
  {
    packageId: "PI-2",
    mode: "present",
    evidenceScript: "scripts/verify-pi-2.ts",
    freezeId: "pi-2-frontend-implementation-v1",
    notes: "Frontend presentation runtime",
  },
  {
    packageId: "PI-3",
    mode: "orchestrate",
    evidenceScript: "scripts/verify-pi-3.ts",
    freezeId: "pi-3-backend-implementation-v1",
    notes: "Backend orchestration runtime",
  },
  {
    packageId: "PI-4",
    mode: "persist",
    evidenceScript: "scripts/verify-pi-4.ts",
    freezeId: "pi-4-data-implementation-v1",
    notes: "Data persistence runtime",
  },
  {
    packageId: "PI-5",
    mode: "integrate",
    evidenceScript: "scripts/verify-pi-5.ts",
    freezeId: "pi-5-integration-implementation-v1",
    notes: "Integration seam runtime",
  },
  {
    packageId: "PI-6",
    mode: "ready",
    evidenceScript: "scripts/verify-pi-6.ts",
    freezeId: "pi-6-delivery-readiness-v1",
    notes: "Delivery readiness runtime",
  },
] as const satisfies readonly PackageRuntimeBinding[];

export function getPackageRuntimeBinding(
  packageId: ImplementationPackageId,
): PackageRuntimeBinding | undefined {
  return PACKAGE_RUNTIME_BINDINGS.find((b) => b.packageId === packageId);
}

export function packageRuntimeMatchesFoundation(
  binding: PackageRuntimeBinding,
): boolean {
  const pkg = IMPLEMENTATION_PACKAGE_CATALOGUE.find(
    (p) => p.packageId === binding.packageId,
  );
  const route = getPackageLayerRoute(binding.packageId);
  return Boolean(
    pkg &&
      route &&
      pkg.evidenceScript === binding.evidenceScript &&
      pkg.freezeId === binding.freezeId,
  );
}
