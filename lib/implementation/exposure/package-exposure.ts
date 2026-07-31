/**
 * PI-7.4 — Package → implementation exposure modes.
 * Reuses PI-7.3 packages / layers — no new families.
 */
import type { ImplementationLayerId } from "../foundation/layer-refs";
import type { ImplementationPackageId } from "../foundation/package-refs";
import type { ImplementationRuntimeMode } from "../runtime/package-runtime-bindings";
import type { ImplementationExposureSignalId } from "./evidence-exposure-bindings";

/**
 * How implementation package outcomes are exposed.
 */
export type ImplementationExposureMode =
  | "freeze-cite"
  | "evidence-surface"
  | "layer-status"
  | "chain-summary"
  | "baseline-cite";

export type PackageExposure = Readonly<{
  packageId: ImplementationPackageId;
  modes: readonly ImplementationExposureMode[];
  primaryLayerId: ImplementationLayerId;
  signalIds: readonly ImplementationExposureSignalId[];
  runtimeMode: ImplementationRuntimeMode;
  notes: string;
}>;

export const PACKAGE_EXPOSURE = [
  {
    packageId: "PI-2",
    modes: ["freeze-cite", "evidence-surface", "layer-status"],
    primaryLayerId: "FRONTEND",
    signalIds: ["SIG-PI-2", "SIG-BASELINE"],
    runtimeMode: "present",
    notes: "Frontend freeze / evidence exposure",
  },
  {
    packageId: "PI-3",
    modes: ["freeze-cite", "evidence-surface", "layer-status"],
    primaryLayerId: "BACKEND",
    signalIds: ["SIG-PI-3", "SIG-BASELINE"],
    runtimeMode: "orchestrate",
    notes: "Backend freeze / evidence exposure",
  },
  {
    packageId: "PI-4",
    modes: ["freeze-cite", "evidence-surface", "layer-status"],
    primaryLayerId: "DATA",
    signalIds: ["SIG-PI-4", "SIG-BASELINE"],
    runtimeMode: "persist",
    notes: "Data freeze / evidence exposure",
  },
  {
    packageId: "PI-5",
    modes: ["freeze-cite", "evidence-surface", "chain-summary", "baseline-cite"],
    primaryLayerId: "INTEGRATION",
    signalIds: ["SIG-PI-5", "SIG-CHAIN", "SIG-BASELINE"],
    runtimeMode: "integrate",
    notes: "Integration freeze / chain exposure",
  },
  {
    packageId: "PI-6",
    modes: [
      "freeze-cite",
      "evidence-surface",
      "chain-summary",
      "baseline-cite",
      "layer-status",
    ],
    primaryLayerId: "DELIVERY",
    signalIds: ["SIG-PI-6", "SIG-CHAIN", "SIG-BASELINE"],
    runtimeMode: "ready",
    notes: "Delivery readiness freeze / full-chain exposure",
  },
] as const satisfies readonly PackageExposure[];

export function getPackageExposure(
  packageId: ImplementationPackageId,
): PackageExposure | undefined {
  return PACKAGE_EXPOSURE.find((row) => row.packageId === packageId);
}
