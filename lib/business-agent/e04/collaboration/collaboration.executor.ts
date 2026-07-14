/**
 * E04-P7 — Collaboration Executor
 * Runs multi-agent collaboration by reusing E04 business agent executor
 */

import { getBusinessAgentById } from "../core/business-agent.registry";
import { createBusinessAgentExecutionContext } from "../runtime/business-agent.context";
import { executeBusinessAgent } from "../runtime/business-agent.executor";
import {
  advanceCollaborationPhase,
  createCollaborationSession,
  messageKindForRole,
  postCollaborationMessage,
} from "./collaboration.protocol";
import { assertCollaborationDefinition } from "./collaboration.registry";
import {
  appendCollaborationTraceEvent,
  createCollaborationRuntimeTrace,
  type CollaborationRuntimeTrace,
} from "./collaboration.trace";
import type {
  CollaborationDefinition,
  CollaborationExecutionResult,
  CollaborationSession,
  CollaborationTurnResult,
} from "./collaboration.types";

export type CollaborationExecuteBundle = {
  result: CollaborationExecutionResult;
  session: CollaborationSession;
  trace: CollaborationRuntimeTrace;
};

function participantOrder(
  collaboration: CollaborationDefinition,
): CollaborationDefinition["participants"] {
  const rank = { lead: 0, contributor: 1, reviewer: 2 } as const;
  return [...collaboration.participants].sort(
    (a, b) => rank[a.role] - rank[b.role],
  );
}

export function executeCollaboration(
  collaboration: CollaborationDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    sessionId?: string;
  },
): CollaborationExecuteBundle {
  assertCollaborationDefinition(collaboration);

  const startedAt = Date.now();
  let session = createCollaborationSession({
    collaboration,
    taskId: options?.taskId,
    input: options?.input,
    metadata: options?.metadata,
    sessionId: options?.sessionId,
  });

  let trace = createCollaborationRuntimeTrace({
    sessionId: session.sessionId,
    collaborationId: collaboration.id,
    taskId: session.taskId,
  });

  trace = appendCollaborationTraceEvent(
    trace,
    "register",
    `session ${session.sessionId} opened`,
    { participants: String(collaboration.participants.length) },
  );

  const turns: CollaborationTurnResult[] = [];

  try {
    const ordered = participantOrder(collaboration);
    const phases = ["open", "exchange", "consolidate"] as const;

    for (const phase of phases) {
      if (session.phase !== phase) {
        session = advanceCollaborationPhase(session, phase);
      }

      const turnParticipants =
        phase === "open"
          ? ordered.filter((p) => p.role === "lead")
          : phase === "consolidate"
            ? [
                ...ordered.filter((p) => p.role === "reviewer"),
                ...ordered.filter((p) => p.role === "lead"),
              ]
            : ordered;

      for (const participant of turnParticipants) {

        const agent = getBusinessAgentById(participant.businessAgentId);
        if (!agent) {
          throw new Error(
            `business agent missing: ${participant.businessAgentId}`,
          );
        }

        trace = appendCollaborationTraceEvent(
          trace,
          "turn",
          `phase=${phase} agent=${agent.id}`,
          { role: participant.role },
        );

        const context = createBusinessAgentExecutionContext({
          businessAgentId: agent.id,
          runtimeAgentId: agent.runtimeAgentId,
          capabilityId: participant.capabilityId,
          taskId: `${session.taskId}:${phase}:${agent.id}`,
          input: {
            ...session.input,
            collaborationId: collaboration.id,
            sessionId: session.sessionId,
            phase,
            role: participant.role,
            goal:
              typeof session.input.goal === "string"
                ? session.input.goal
                : `collaborate:${collaboration.id}:${phase}`,
          },
          metadata: {
            ...session.metadata,
            layer: "e04-collaboration",
            collaborationId: collaboration.id,
            phase,
          },
        });

        const bundle = executeBusinessAgent(agent, context);
        if (!bundle.result.success) {
          throw new Error(
            `turn failed for ${agent.id}: ${bundle.result.errorMessage ?? "unknown"}`,
          );
        }

        trace = appendCollaborationTraceEvent(
          trace,
          "execute",
          `executed ${agent.id}`,
          { success: "true" },
        );

        const kind = messageKindForRole(participant.role, phase);
        const posted = postCollaborationMessage(session, {
          kind,
          fromAgentId: agent.id,
          body: `${participant.role} ${kind} at ${phase}`,
          payload: {
            output: bundle.result.output,
            role: participant.role,
          },
        });
        session = posted.session;

        trace = appendCollaborationTraceEvent(
          trace,
          "message",
          `message ${posted.message.id}`,
          { kind, from: agent.id },
        );

        turns.push({
          businessAgentId: agent.id,
          role: participant.role,
          capabilityId: participant.capabilityId,
          success: true,
          output: bundle.result.output,
          messageId: posted.message.id,
          readOnly: true,
        });
      }
    }

    session = advanceCollaborationPhase(session, "closed");
    const duration = Date.now() - startedAt;

    const result: CollaborationExecutionResult = {
      success: true,
      collaborationId: collaboration.id,
      sessionId: session.sessionId,
      taskId: session.taskId,
      traceId: trace.traceId,
      phase: session.phase,
      turns: Object.freeze([...turns]) as CollaborationTurnResult[],
      messages: Object.freeze([...session.messages]) as typeof session.messages,
      output: Object.freeze({
        collaborationId: collaboration.id,
        turnCount: turns.length,
        messageCount: session.messages.length,
        participants: collaboration.participants.map((p) => p.businessAgentId),
      }),
      duration,
      status: "result",
      readOnly: true,
    };

    trace = appendCollaborationTraceEvent(
      trace,
      "result",
      `result ready durationMs=${duration}`,
      { success: "true", turns: String(turns.length) },
    );

    return { result, session, trace };
  } catch (error) {
    const message = error instanceof Error ? error.message : "collaboration failed";
    const duration = Date.now() - startedAt;
    trace = appendCollaborationTraceEvent(trace, "error", message);

    const result: CollaborationExecutionResult = {
      success: false,
      collaborationId: collaboration.id,
      sessionId: session.sessionId,
      taskId: session.taskId,
      traceId: trace.traceId,
      phase: session.phase,
      turns: Object.freeze([...turns]) as CollaborationTurnResult[],
      messages: Object.freeze([...session.messages]) as typeof session.messages,
      output: {},
      duration,
      status: "failed",
      errorMessage: message,
      readOnly: true,
    };

    return { result, session, trace };
  }
}

export function executeCollaborationOrThrow(
  collaboration: CollaborationDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    sessionId?: string;
  },
): CollaborationExecuteBundle & {
  result: CollaborationExecutionResult & { success: true; status: "result" };
} {
  const bundle = executeCollaboration(collaboration, options);
  if (!bundle.result.success || bundle.result.status !== "result") {
    throw new Error(
      `E04 collaboration failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as CollaborationExecuteBundle & {
    result: CollaborationExecutionResult & { success: true; status: "result" };
  };
}
