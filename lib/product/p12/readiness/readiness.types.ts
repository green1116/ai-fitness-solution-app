/**
 * Product P12 — Readiness gate types
 */

import type { READINESS_GATES } from "../launch/launch.constants";

export type ReadinessGate = (typeof READINESS_GATES)[number];
export type ReadinessMetadata = Record<string, unknown>;

export type LaunchReadinessCheck = {
  id: string;
  launchId: string;
  name: string;
  gate: ReadinessGate;
  evidence: string;
  detail: string;
  metadata: ReadinessMetadata;
  evaluatedAt: string;
};

export type RecordReadinessInput = {
  id?: string;
  launchId: string;
  name: string;
  gate: ReadinessGate;
  evidence?: string;
  metadata?: ReadinessMetadata;
};
