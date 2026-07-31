/**
 * PI-7.4 — Closed implementation evidence signal exposure (PI-2…PI-6).
 * Signals surface existing freeze / evidence scripts — invent no architecture.
 */
import type { ImplementationLayerId } from "../foundation/layer-refs";
import type { ImplementationPackageId } from "../foundation/package-refs";

export const IMPLEMENTATION_EXPOSURE_SIGNAL_IDS = [
  "SIG-PI-2",
  "SIG-PI-3",
  "SIG-PI-4",
  "SIG-PI-5",
  "SIG-PI-6",
  "SIG-CHAIN",
  "SIG-BASELINE",
] as const;

export type ImplementationExposureSignalId =
  (typeof IMPLEMENTATION_EXPOSURE_SIGNAL_IDS)[number];

export type EvidenceExposureBinding = Readonly<{
  signalId: ImplementationExposureSignalId;
  name: string;
  packageId: ImplementationPackageId | "CROSS";
  layerIds: readonly ImplementationLayerId[];
  evidenceScript: string | null;
  freezeId: string | null;
  notes: string;
}>;

export const EVIDENCE_EXPOSURE_BINDINGS = [
  {
    signalId: "SIG-PI-2",
    name: "Frontend Freeze Evidence",
    packageId: "PI-2",
    layerIds: ["FRONTEND", "DOMAIN"],
    evidenceScript: "scripts/verify-pi-2.ts",
    freezeId: "pi-2-frontend-implementation-v1",
    notes: "PI-2 frontend implementation evidence",
  },
  {
    signalId: "SIG-PI-3",
    name: "Backend Freeze Evidence",
    packageId: "PI-3",
    layerIds: ["BACKEND", "DOMAIN", "DATA"],
    evidenceScript: "scripts/verify-pi-3.ts",
    freezeId: "pi-3-backend-implementation-v1",
    notes: "PI-3 backend implementation evidence",
  },
  {
    signalId: "SIG-PI-4",
    name: "Data Freeze Evidence",
    packageId: "PI-4",
    layerIds: ["DATA", "DOMAIN"],
    evidenceScript: "scripts/verify-pi-4.ts",
    freezeId: "pi-4-data-implementation-v1",
    notes: "PI-4 data implementation evidence",
  },
  {
    signalId: "SIG-PI-5",
    name: "Integration Freeze Evidence",
    packageId: "PI-5",
    layerIds: ["INTEGRATION", "FRONTEND", "BACKEND", "DATA", "DOMAIN"],
    evidenceScript: "scripts/verify-pi-5.ts",
    freezeId: "pi-5-integration-implementation-v1",
    notes: "PI-5 integration implementation evidence",
  },
  {
    signalId: "SIG-PI-6",
    name: "Delivery Readiness Freeze Evidence",
    packageId: "PI-6",
    layerIds: [
      "DELIVERY",
      "FRONTEND",
      "BACKEND",
      "DATA",
      "INTEGRATION",
      "DOMAIN",
    ],
    evidenceScript: "scripts/verify-pi-6.ts",
    freezeId: "pi-6-delivery-readiness-v1",
    notes: "PI-6 delivery readiness evidence",
  },
  {
    signalId: "SIG-CHAIN",
    name: "Implementation Chain Cite",
    packageId: "CROSS",
    layerIds: ["FRONTEND", "BACKEND", "DATA", "INTEGRATION", "DELIVERY"],
    evidenceScript: null,
    freezeId: null,
    notes: "PI-2→PI-3→PI-4→PI-5→PI-6 chain citation",
  },
  {
    signalId: "SIG-BASELINE",
    name: "Implementation Baseline Cite",
    packageId: "CROSS",
    layerIds: ["FRONTEND", "BACKEND", "DATA", "INTEGRATION", "DELIVERY"],
    evidenceScript: null,
    freezeId: null,
    notes: "product-implementation-baseline-v1 citation",
  },
] as const satisfies readonly EvidenceExposureBinding[];

export function getEvidenceExposureBinding(
  signalId: ImplementationExposureSignalId,
): EvidenceExposureBinding | undefined {
  return EVIDENCE_EXPOSURE_BINDINGS.find((s) => s.signalId === signalId);
}
