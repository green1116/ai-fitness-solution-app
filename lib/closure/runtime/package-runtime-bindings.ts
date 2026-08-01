/**
 * PI-8.3 — Package → closure runtime bindings.
 * Reuses PI-8.2 package routes — invents no packages/architecture.
 */
import {
  CLOSURE_PACKAGE_CATALOGUE,
  type ClosurePackageId,
} from "../foundation/package-refs";
import { getClosurePackageLayerRoute } from "../routing/package-layer-routing";

export type ClosureRuntimeMode =
  | "present"
  | "orchestrate"
  | "persist"
  | "integrate"
  | "ready"
  | "close";

export type ClosurePackageRuntimeBinding = Readonly<{
  packageId: ClosurePackageId;
  mode: ClosureRuntimeMode;
  evidenceScript: string;
  freezeId: string;
  notes: string;
}>;

/**
 * Closed package runtime bindings — one per PI-8.1 / PI-8.2 package.
 */
export const CLOSURE_PACKAGE_RUNTIME_BINDINGS = [
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
  {
    packageId: "PI-7",
    mode: "close",
    evidenceScript: "scripts/verify-pi-7.ts",
    freezeId: "pi-7-product-implementation-v1",
    notes: "Product implementation close runtime",
  },
] as const satisfies readonly ClosurePackageRuntimeBinding[];

export function getClosurePackageRuntimeBinding(
  packageId: ClosurePackageId,
): ClosurePackageRuntimeBinding | undefined {
  return CLOSURE_PACKAGE_RUNTIME_BINDINGS.find(
    (b) => b.packageId === packageId,
  );
}

export function closurePackageRuntimeMatchesFoundation(
  binding: ClosurePackageRuntimeBinding,
): boolean {
  const pkg = CLOSURE_PACKAGE_CATALOGUE.find(
    (p) => p.packageId === binding.packageId,
  );
  const route = getClosurePackageLayerRoute(binding.packageId);
  return Boolean(
    pkg &&
      route &&
      pkg.evidenceScript === binding.evidenceScript &&
      pkg.freezeId === binding.freezeId,
  );
}
