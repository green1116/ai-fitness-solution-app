import type { AUTOPILOT_VERSION } from "../shared/types";

export const DELIVERY_RUNTIME_VERSION = "v13.5-delivery-runtime-1" as const;

export const DELIVERY_ARTIFACT_TYPES = [
  "proposal-pdf",
  "plan-pdf",
  "budget-pdf",
  "enterprise-zip",
] as const;

export type DeliveryArtifactType = (typeof DELIVERY_ARTIFACT_TYPES)[number];

export interface DeliveryArtifact {
  artifactId: string;
  type: DeliveryArtifactType;
  label: string;
  filename: string;
  ready: boolean;
  moduleRef: string;
  sizeEstimateKb: number;
}

export interface DeliveryPackage {
  packageId: string;
  jobId: string;
  artifacts: DeliveryArtifact[];
  allReady: boolean;
  generatedAt: string;
}

export interface DeliveryRuntimePayload {
  version: typeof DELIVERY_RUNTIME_VERSION;
  autopilotVersion: typeof AUTOPILOT_VERSION;
  delivery: DeliveryPackage;
  summary: string;
}
