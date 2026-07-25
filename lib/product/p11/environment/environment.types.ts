/**
 * Product P11 — Environment types
 */

import type { ENVIRONMENT_KINDS } from "../release/release.constants";

export type EnvironmentKind = (typeof ENVIRONMENT_KINDS)[number];
export type EnvironmentMetadata = Record<string, unknown>;

export type ReleaseEnvironment = {
  id: string;
  releaseId: string;
  kind: EnvironmentKind;
  name: string;
  region: string;
  detail: string;
  metadata: EnvironmentMetadata;
  createdAt: string;
};

export type CreateEnvironmentInput = {
  id?: string;
  releaseId: string;
  kind: EnvironmentKind;
  name: string;
  region?: string;
  metadata?: EnvironmentMetadata;
};
