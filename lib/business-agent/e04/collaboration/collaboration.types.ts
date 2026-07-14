/**
 * E04-P7 — Enterprise Agent Collaboration Runtime types
 * Multi business-agent collaboration layer
 */

import {
  E04_COLLABORATION_BASE,
  E04_COLLABORATION_FREEZE_VERSION,
  E04_COLLABORATION_RUNTIME_ID,
  E04_COLLABORATION_VERSION,
  COLLABORATION_MESSAGE_KINDS,
  COLLABORATION_PARTICIPANT_ROLES,
  COLLABORATION_PROTOCOL_PHASES,
  COLLABORATION_TRACE_EVENT_KINDS,
} from "./collaboration.constants";

export type CollaborationParticipantRole =
  (typeof COLLABORATION_PARTICIPANT_ROLES)[number];
export type CollaborationMessageKind =
  (typeof COLLABORATION_MESSAGE_KINDS)[number];
export type CollaborationProtocolPhase =
  (typeof COLLABORATION_PROTOCOL_PHASES)[number];
export type CollaborationTraceEventKind =
  (typeof COLLABORATION_TRACE_EVENT_KINDS)[number];

export type CollaborationParticipant = {
  businessAgentId: string;
  role: CollaborationParticipantRole;
  capabilityId?: string;
  optional: boolean;
  readOnly: true;
};

export type CollaborationDefinition = {
  id: string;
  name: string;
  description: string;
  participants: CollaborationParticipant[];
  optional: boolean;
  readOnly: true;
};

export type CollaborationMessage = {
  id: string;
  kind: CollaborationMessageKind;
  fromAgentId: string;
  toAgentId?: string;
  phase: CollaborationProtocolPhase;
  body: string;
  payload: Readonly<Record<string, unknown>>;
  at: string;
  readOnly: true;
};

export type CollaborationSession = {
  sessionId: string;
  collaborationId: string;
  taskId: string;
  phase: CollaborationProtocolPhase;
  messages: CollaborationMessage[];
  input: Readonly<Record<string, unknown>>;
  metadata: Readonly<Record<string, string>>;
  createdAt: string;
  readOnly: true;
};

export type CollaborationTurnResult = {
  businessAgentId: string;
  role: CollaborationParticipantRole;
  capabilityId?: string;
  success: boolean;
  output: Readonly<Record<string, unknown>>;
  messageId: string;
  readOnly: true;
};

export type CollaborationExecutionResult = {
  success: boolean;
  collaborationId: string;
  sessionId: string;
  taskId: string;
  traceId: string;
  phase: CollaborationProtocolPhase;
  turns: CollaborationTurnResult[];
  messages: CollaborationMessage[];
  output: Readonly<Record<string, unknown>>;
  duration: number;
  status: "result" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type CollaborationRegistryManifest = {
  runtimeId: typeof E04_COLLABORATION_RUNTIME_ID;
  version: typeof E04_COLLABORATION_VERSION;
  freezeVersion: typeof E04_COLLABORATION_FREEZE_VERSION;
  base: typeof E04_COLLABORATION_BASE;
  collaborationCount: number;
  collaborations: CollaborationDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};
