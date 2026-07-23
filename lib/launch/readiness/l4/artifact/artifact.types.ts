/**
 * Launch L4 — Artifact types
 */

import type { ARTIFACT_VERIFY_RESULTS } from "../scenario/scenario.constants";

export type ArtifactVerifyResult =
  (typeof ARTIFACT_VERIFY_RESULTS)[number];
export type ArtifactMetadata = Record<string, unknown>;

export type DeliveryArtifact = {
  id: string;
  scenarioId: string;
  name: string;
  uri: string;
  detail: string;
  metadata: ArtifactMetadata;
  createdAt: string;
};

export type RegisterDeliveryArtifactInput = {
  id?: string;
  scenarioId: string;
  name: string;
  uri?: string;
  metadata?: ArtifactMetadata;
};

export type ArtifactVerification = {
  id: string;
  artifactId: string;
  result: ArtifactVerifyResult;
  notes: string;
  detail: string;
  verifiedAt: string;
};

export type VerifyArtifactInput = {
  id?: string;
  artifactId: string;
  result: ArtifactVerifyResult;
  notes?: string;
};

export type ArtifactReport = {
  id: string;
  scenarioId: string;
  artifactCount: number;
  validCount: number;
  invalidCount: number;
  missingCount: number;
  detail: string;
  generatedAt: string;
};

export type GenerateArtifactReportInput = {
  id?: string;
  scenarioId: string;
};
