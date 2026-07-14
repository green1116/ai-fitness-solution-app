/**
 * E04-P7 — Collaboration Protocol
 * Messaging and phase transitions for multi-agent sessions
 */

import {
  COLLABORATION_MESSAGE_KINDS,
  COLLABORATION_PROTOCOL_PHASES,
} from "./collaboration.constants";
import type {
  CollaborationDefinition,
  CollaborationMessage,
  CollaborationMessageKind,
  CollaborationProtocolPhase,
  CollaborationSession,
} from "./collaboration.types";

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

const PHASE_TRANSITIONS: ReadonlyArray<
  readonly [CollaborationProtocolPhase, CollaborationProtocolPhase]
> = [
  ["open", "exchange"],
  ["exchange", "consolidate"],
  ["consolidate", "closed"],
];

export function canAdvanceCollaborationPhase(
  from: CollaborationProtocolPhase,
  to: CollaborationProtocolPhase,
): boolean {
  return PHASE_TRANSITIONS.some(([f, t]) => f === from && t === to);
}

export function createCollaborationSession(input: {
  collaboration: CollaborationDefinition;
  taskId?: string;
  input?: Readonly<Record<string, unknown>>;
  metadata?: Readonly<Record<string, string>>;
  sessionId?: string;
}): CollaborationSession {
  return {
    sessionId: input.sessionId?.trim() || createId("collab-sess"),
    collaborationId: input.collaboration.id,
    taskId: input.taskId?.trim() || createId("collab-task"),
    phase: "open",
    messages: [],
    input: Object.freeze({ ...(input.input ?? {}) }),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
    createdAt: nowIso(),
    readOnly: true,
  };
}

export function advanceCollaborationPhase(
  session: CollaborationSession,
  to: CollaborationProtocolPhase,
): CollaborationSession {
  if (!canAdvanceCollaborationPhase(session.phase, to)) {
    throw new Error(
      `Invalid collaboration phase transition: ${session.phase} → ${to}`,
    );
  }
  return {
    ...session,
    phase: to,
    readOnly: true,
  };
}

export function postCollaborationMessage(
  session: CollaborationSession,
  input: {
    kind: CollaborationMessageKind;
    fromAgentId: string;
    toAgentId?: string;
    body: string;
    payload?: Readonly<Record<string, unknown>>;
  },
): { session: CollaborationSession; message: CollaborationMessage } {
  if (!(COLLABORATION_MESSAGE_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid message kind: ${input.kind}`);
  }
  if (!input.fromAgentId.trim()) throw new Error("fromAgentId is required");
  if (!input.body.trim()) throw new Error("message body is required");

  const message: CollaborationMessage = {
    id: createId("collab-msg"),
    kind: input.kind,
    fromAgentId: input.fromAgentId.trim(),
    toAgentId: input.toAgentId?.trim() || undefined,
    phase: session.phase,
    body: input.body.trim(),
    payload: Object.freeze({ ...(input.payload ?? {}) }),
    at: nowIso(),
    readOnly: true,
  };

  const next: CollaborationSession = {
    ...session,
    messages: [...session.messages, message],
    readOnly: true,
  };

  return { session: next, message };
}

export function listMessagesByPhase(
  session: CollaborationSession,
  phase: CollaborationProtocolPhase,
): CollaborationMessage[] {
  if (!(COLLABORATION_PROTOCOL_PHASES as readonly string[]).includes(phase)) {
    throw new Error(`invalid phase: ${phase}`);
  }
  return session.messages.filter((m) => m.phase === phase);
}

export function messageKindForRole(
  role: "lead" | "contributor" | "reviewer",
  phase: CollaborationProtocolPhase,
): CollaborationMessageKind {
  if (phase === "open") return "announce";
  if (phase === "exchange") {
    if (role === "lead") return "ask";
    if (role === "contributor") return "propose";
    return "reply";
  }
  if (phase === "consolidate") {
    if (role === "reviewer") return "vote";
    return "commit";
  }
  return "commit";
}
