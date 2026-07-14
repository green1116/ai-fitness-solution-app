/**
 * E04-P8 — Collect per-phase readiness via P1–P7 business agent chain (read-only)
 */

import { buildBusinessAgentFoundation } from "../core/business-agent.lifecycle";
import { buildWorkflowRegistryManifest } from "../workflow/workflow.registry";
import { buildProcessRegistryManifest } from "../process/process.registry";
import { buildDecisionRegistryManifest } from "../decision/decision.registry";
import { buildMemoryRuntimeManifest } from "../memory/memory.store";
import { buildKnowledgeRegistryManifest } from "../knowledge/knowledge.registry";
import {
  buildCollaborationRegistryManifest,
  getCollaborationById,
} from "../collaboration/collaboration.registry";
import { executeCollaborationOrThrow } from "../collaboration/collaboration.executor";

import type {
  CollaborationBaselineSnapshot,
  ReadinessReport,
} from "./signoff.types";

function runCollaborationBaseline(deploymentId: string) {
  const collaboration = getCollaborationById("e04.collab.tender-roundtable");
  if (!collaboration) {
    throw new Error("missing collaboration e04.collab.tender-roundtable");
  }

  return executeCollaborationOrThrow(collaboration, {
    taskId: `${deploymentId}-collab`,
    input: {
      goal: "E04 P8 governance freeze baseline",
      projectHint: "星河科技园企业健身中心",
    },
    metadata: { source: "e04-p8-signoff", deploymentId },
  });
}

export function collectCollaborationBaseline(
  deploymentId: string,
): CollaborationBaselineSnapshot {
  const run = runCollaborationBaseline(`${deploymentId}-baseline`);

  return {
    ready: run.result.success && run.session.phase === "closed",
    collaborationId: run.result.collaborationId,
    sessionId: run.result.sessionId,
    phase: run.result.phase,
    turnCount: run.result.turns.length,
    messageCount: run.result.messages.length,
    readinessScore: run.result.success ? 100 : 0,
  };
}

export function collectBusinessAgentPhaseReadiness(
  deploymentId: string,
): ReadinessReport {
  try {
    const foundation = buildBusinessAgentFoundation();
    const workflow = buildWorkflowRegistryManifest();
    const process = buildProcessRegistryManifest();
    const decision = buildDecisionRegistryManifest();
    const memory = buildMemoryRuntimeManifest();
    const knowledge = buildKnowledgeRegistryManifest();
    const collaboration = buildCollaborationRegistryManifest();
    const baseline = collectCollaborationBaseline(deploymentId);

    const p1 = foundation.ready === true;
    const p2 = workflow.catalogComplete === true;
    const p3 = process.catalogComplete === true;
    const p4 = decision.catalogComplete === true;
    const p5 = memory.ready === true;
    const p6 = knowledge.catalogComplete === true;
    const p7 = collaboration.catalogComplete === true && baseline.ready;

    const ready = p1 && p2 && p3 && p4 && p5 && p6 && p7;
    const blocked = !ready;

    return {
      p1,
      p2,
      p3,
      p4,
      p5,
      p6,
      p7,
      ready,
      blocked,
      summary: [
        `readiness ready=${ready}`,
        `phases=${[p1, p2, p3, p4, p5, p6, p7].filter(Boolean).length}/7`,
        `blocked=${blocked}`,
      ].join(" "),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "readiness failed";
    return {
      p1: false,
      p2: false,
      p3: false,
      p4: false,
      p5: false,
      p6: false,
      p7: false,
      ready: false,
      blocked: true,
      summary: `readiness ready=false blocked=true error=${message}`,
    };
  }
}
