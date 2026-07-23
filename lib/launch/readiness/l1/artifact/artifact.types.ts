/**
 * Launch L1 — Artifact types
 */

import type { ARTIFACT_KINDS } from "../demo/demo.constants";

export type ArtifactKind = (typeof ARTIFACT_KINDS)[number];
export type ArtifactMetadata = Record<string, unknown>;

export type DemoArtifact = {
  id: string;
  projectId: string;
  name: string;
  kind: ArtifactKind;
  uri: string;
  detail: string;
  metadata: ArtifactMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterArtifactInput = {
  id?: string;
  projectId: string;
  name: string;
  kind: ArtifactKind;
  uri?: string;
  metadata?: ArtifactMetadata;
};
