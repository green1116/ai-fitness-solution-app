/**
 * PI-8.4 — Package → closure exposure modes.
 * Reuses PI-8.3 packages / layers — no new families.
 */
import type { ClosureLayerId } from "../foundation/layer-refs";
import type { ClosurePackageId } from "../foundation/package-refs";
import type { ClosureRuntimeMode } from "../runtime/package-runtime-bindings";
import type { ClosureExposureSignalId } from "./evidence-exposure-bindings";

/**
 * How closure package outcomes are exposed.
 */
export type ClosureExposureMode =
  | "freeze-cite"
  | "evidence-surface"
  | "layer-status"
  | "chain-summary"
  | "baseline-cite";

export type ClosurePackageExposure = Readonly<{
  packageId: ClosurePackageId;
  modes: readonly ClosureExposureMode[];
  primaryLayerId: ClosureLayerId;
  signalIds: readonly ClosureExposureSignalId[];
  runtimeMode: ClosureRuntimeMode;
  notes: string;
}>;

export const CLOSURE_PACKAGE_EXPOSURE = [
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
    notes: "Delivery readiness freeze / chain exposure",
  },
  {
    packageId: "PI-7",
    modes: [
      "freeze-cite",
      "evidence-surface",
      "chain-summary",
      "baseline-cite",
      "layer-status",
    ],
    primaryLayerId: "IMPLEMENTATION",
    signalIds: ["SIG-PI-7", "SIG-CHAIN", "SIG-BASELINE"],
    runtimeMode: "close",
    notes: "Product implementation close freeze / full-chain exposure",
  },
] as const satisfies readonly ClosurePackageExposure[];

export function getClosurePackageExposure(
  packageId: ClosurePackageId,
): ClosurePackageExposure | undefined {
  return CLOSURE_PACKAGE_EXPOSURE.find((row) => row.packageId === packageId);
}
