/**
 * PI-6.3 — Concern → delivery readiness exposure modes (PD-7).
 * Reuses PI-6.2 concerns / layers — no new families.
 */
import type { DeliveryLayerId } from "../foundation/layer-refs";
import type { DeliveryReadinessConcernId } from "../foundation/readiness-concerns";
import type { DeliveryRuntimeMode } from "../runtime/concern-runtime-bindings";
import type { DeliveryExposureSignalId } from "./signal-exposure-bindings";

/**
 * How readiness outcomes are exposed at the delivery surface.
 */
export type DeliveryExposureMode =
  | "verdict-surface"
  | "env-status"
  | "artifact-cite"
  | "gate-summary"
  | "pilot-result"
  | "signoff-record"
  | "baseline-cite";

export type ConcernExposure = Readonly<{
  concernId: DeliveryReadinessConcernId;
  modes: readonly DeliveryExposureMode[];
  /** Primary exposure layer (existing DRT / PI-6.1 layer). */
  primaryLayerId: DeliveryLayerId;
  /** Signals surfaced for this concern. */
  signalIds: readonly DeliveryExposureSignalId[];
  runtimeMode: DeliveryRuntimeMode;
  notes: string;
}>;

export const CONCERN_EXPOSURE = [
  {
    concernId: "RELEASE",
    modes: ["verdict-surface", "gate-summary", "baseline-cite"],
    primaryLayerId: "INTEGRATION",
    signalIds: ["SIG-RELEASE", "SIG-BASELINE"],
    runtimeMode: "evaluate",
    notes: "Release Go / No-Go exposure",
  },
  {
    concernId: "DEPLOYMENT",
    modes: ["env-status", "artifact-cite", "gate-summary"],
    primaryLayerId: "BACKEND",
    signalIds: ["SIG-DEPLOY", "SIG-BASELINE"],
    runtimeMode: "promote",
    notes: "ENV-* / ART-META exposure",
  },
  {
    concernId: "OPERATIONAL",
    modes: ["env-status", "gate-summary"],
    primaryLayerId: "BACKEND",
    signalIds: ["SIG-OPS"],
    runtimeMode: "observe",
    notes: "Ops health exposure",
  },
  {
    concernId: "CUSTOMER",
    modes: ["verdict-surface", "baseline-cite"],
    primaryLayerId: "FRONTEND",
    signalIds: ["SIG-CUSTOMER"],
    runtimeMode: "enable",
    notes: "Customer enablement exposure",
  },
  {
    concernId: "DOCUMENTATION",
    modes: ["baseline-cite", "gate-summary"],
    primaryLayerId: "FRONTEND",
    signalIds: ["SIG-DOCS", "SIG-BASELINE"],
    runtimeMode: "document",
    notes: "Documentation readiness exposure",
  },
  {
    concernId: "PILOT",
    modes: ["pilot-result", "verdict-surface", "baseline-cite"],
    primaryLayerId: "FRONTEND",
    signalIds: ["SIG-PILOT", "SIG-BASELINE"],
    runtimeMode: "accept",
    notes: "Pilot acceptance / GP-* exposure",
  },
  {
    concernId: "SIGN_OFF",
    modes: ["signoff-record", "verdict-surface", "gate-summary"],
    primaryLayerId: "INTEGRATION",
    signalIds: ["SIG-SIGNOFF", "SIG-RELEASE", "SIG-BASELINE"],
    runtimeMode: "signoff",
    notes: "Multi-party sign-off exposure",
  },
] as const satisfies readonly ConcernExposure[];

export function getConcernExposure(
  concernId: DeliveryReadinessConcernId,
): ConcernExposure | undefined {
  return CONCERN_EXPOSURE.find((row) => row.concernId === concernId);
}
