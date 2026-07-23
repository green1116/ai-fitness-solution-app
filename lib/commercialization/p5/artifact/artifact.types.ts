/**
 * Commercialization P5 — Artifact types
 */

import type {
  ARTIFACT_KINDS,
  ARTIFACT_STATUSES,
} from "../delivery/delivery.constants";

export type ArtifactKind = (typeof ARTIFACT_KINDS)[number];
export type ArtifactStatus = (typeof ARTIFACT_STATUSES)[number];
export type ArtifactMetadata = Record<string, unknown>;

export type DeliveryArtifact = {
  id: string;
  projectId: string;
  deliveryId: string;
  name: string;
  kind: ArtifactKind;
  version: string;
  status: ArtifactStatus;
  uri: string;
  detail: string;
  metadata: ArtifactMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterArtifactInput = {
  id?: string;
  projectId: string;
  deliveryId: string;
  name: string;
  kind: ArtifactKind;
  version?: string;
  uri?: string;
  metadata?: ArtifactMetadata;
};

export type ArtifactTrackingRecord = {
  id: string;
  artifactId: string;
  event: string;
  fromStatus?: ArtifactStatus;
  toStatus: ArtifactStatus;
  note: string;
  trackedAt: string;
};

export type TrackArtifactInput = {
  id?: string;
  artifactId: string;
  toStatus: ArtifactStatus;
  event?: string;
  note?: string;
};
