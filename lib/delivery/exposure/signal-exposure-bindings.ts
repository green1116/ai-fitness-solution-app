/**
 * PI-6.3 — Closed readiness signal exposure bindings (PD-7).
 * Signals surface existing readiness formulas — invent no new architecture.
 */
import type { DeliveryLayerId } from "../foundation/layer-refs";
import type { DeliveryReadinessConcernId } from "../foundation/readiness-concerns";

export const DELIVERY_EXPOSURE_SIGNAL_IDS = [
  "SIG-RELEASE",
  "SIG-DEPLOY",
  "SIG-OPS",
  "SIG-CUSTOMER",
  "SIG-DOCS",
  "SIG-PILOT",
  "SIG-SIGNOFF",
  "SIG-BASELINE",
] as const;

export type DeliveryExposureSignalId =
  (typeof DELIVERY_EXPOSURE_SIGNAL_IDS)[number];

export type SignalExposureBinding = Readonly<{
  signalId: DeliveryExposureSignalId;
  name: string;
  concernId: DeliveryReadinessConcernId | "CROSS";
  /** Existing layers that surface this signal. */
  layerIds: readonly DeliveryLayerId[];
  formula: string;
  notes: string;
}>;

export const SIGNAL_EXPOSURE_BINDINGS = [
  {
    signalId: "SIG-RELEASE",
    name: "Release Ready Signal",
    concernId: "RELEASE",
    layerIds: ["FRONTEND", "BACKEND", "DATA", "INTEGRATION", "DOMAIN"],
    formula: "RELEASE_READY ∧ GNG-*",
    notes: "PD-7.1 Go / No-Go surface",
  },
  {
    signalId: "SIG-DEPLOY",
    name: "Deployment Ready Signal",
    concernId: "DEPLOYMENT",
    layerIds: ["BACKEND", "DATA", "INTEGRATION"],
    formula: "DEPLOY_READY_STAGING / DEPLOY_READY_PROD",
    notes: "PD-7.2 ENV-* promote surface",
  },
  {
    signalId: "SIG-OPS",
    name: "Operational Ready Signal",
    concernId: "OPERATIONAL",
    layerIds: ["BACKEND", "DATA", "INTEGRATION"],
    formula: "OPERATIONALLY_READY",
    notes: "PD-7.3 health / integrity surface",
  },
  {
    signalId: "SIG-CUSTOMER",
    name: "Customer Ready Signal",
    concernId: "CUSTOMER",
    layerIds: ["FRONTEND", "DOMAIN"],
    formula: "CUSTOMER_READY",
    notes: "PD-7.4 enablement surface",
  },
  {
    signalId: "SIG-DOCS",
    name: "Documentation Ready Signal",
    concernId: "DOCUMENTATION",
    layerIds: ["FRONTEND", "INTEGRATION"],
    formula: "DOCUMENTATION_READY",
    notes: "PD-7.5 docs readiness surface",
  },
  {
    signalId: "SIG-PILOT",
    name: "Pilot Accept Signal",
    concernId: "PILOT",
    layerIds: ["FRONTEND", "BACKEND", "DATA", "INTEGRATION", "DOMAIN"],
    formula: "PILOT_ACCEPT → PASS|FAIL|EXTEND",
    notes: "PD-7.6 GP-* pilot surface",
  },
  {
    signalId: "SIG-SIGNOFF",
    name: "Delivery Sign-off Signal",
    concernId: "SIGN_OFF",
    layerIds: ["FRONTEND", "BACKEND", "DATA", "INTEGRATION", "DOMAIN"],
    formula: "Technical|Product|Security|Operations|Customer",
    notes: "PD-7.7 multi-party sign-off surface",
  },
  {
    signalId: "SIG-BASELINE",
    name: "Baseline Cite Signal",
    concernId: "CROSS",
    layerIds: ["FRONTEND", "BACKEND", "DATA", "INTEGRATION"],
    formula: "UI/FE/BE/INT baselines intact",
    notes: "Cross-concern baseline citation",
  },
] as const satisfies readonly SignalExposureBinding[];

export function getSignalExposureBinding(
  signalId: DeliveryExposureSignalId,
): SignalExposureBinding | undefined {
  return SIGNAL_EXPOSURE_BINDINGS.find((s) => s.signalId === signalId);
}
