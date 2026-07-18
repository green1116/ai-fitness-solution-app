/**
 * E07-P5 — Human-AI Collaboration types
 * Human + AI workforce collaboration above orchestration
 */

import type { OrchestrationExecutionResult } from "../orchestration/orchestration.types";
import {
  COLLABORATION_MODES,
  COLLABORATION_SESSION_PHASES,
  E07_COLLABORATION_BASE,
  E07_COLLABORATION_FREEZE_VERSION,
  E07_COLLABORATION_ID,
  E07_COLLABORATION_VERSION,
  HUMAN_DECISIONS,
  HUMAN_REQUEST_STATUSES,
} from "./collaboration.constants";

export type CollaborationMode = (typeof COLLABORATION_MODES)[number];
export type HumanDecision = (typeof HUMAN_DECISIONS)[number];
export type HumanRequestStatus = (typeof HUMAN_REQUEST_STATUSES)[number];
export type CollaborationSessionPhase =
  (typeof COLLABORATION_SESSION_PHASES)[number];

export type CollaborationDefinition = {
  id: string;
  name: string;
  mode: CollaborationMode;
  description: string;
  /** Bound E07 orchestration id */
  orchestrationId: string;
  /** Human role label for the collaboration gate */
  humanRole: string;
  /** Whether AI may proceed only after human approval */
  requiresApproval: boolean;
  optional: boolean;
  readOnly: true;
};

export type HumanCollaborationRequest = {
  requestId: string;
  collaborationId: string;
  orchestrationId: string;
  humanRole: string;
  mode: CollaborationMode;
  prompt: string;
  status: HumanRequestStatus;
  decision?: HumanDecision;
  decidedAt?: string;
  note?: string;
  readOnly: true;
};

export type CollaborationExecutionResult = {
  success: boolean;
  collaborationId: string;
  mode: CollaborationMode;
  orchestrationId: string;
  instanceId: string;
  taskId: string;
  traceId: string;
  request: HumanCollaborationRequest;
  orchestration?: OrchestrationExecutionResult;
  output: Readonly<Record<string, unknown>>;
  duration: number;
  status: "result" | "blocked" | "deferred" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type CollaborationRegistryManifest = {
  collaborationId: typeof E07_COLLABORATION_ID;
  version: typeof E07_COLLABORATION_VERSION;
  freezeVersion: typeof E07_COLLABORATION_FREEZE_VERSION;
  base: typeof E07_COLLABORATION_BASE;
  collaborationCount: number;
  modes: CollaborationMode[];
  collaborations: CollaborationDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};
