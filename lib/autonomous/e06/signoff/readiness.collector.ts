/**
 * E06-P8 — Collect per-phase readiness via P1–P7 autonomous chain (read-only)
 */

import { buildOperationFoundation } from "../core/operation.lifecycle";
import { buildActionRegistryManifest } from "../action/action.registry";
import { buildWorkflowRegistryManifest } from "../workflow/workflow.registry";
import { buildControlRegistryManifest } from "../control/control.registry";
import { buildOptimizationRegistryManifest } from "../optimization/optimization.registry";
import { buildTwinRegistryManifest } from "../digital-twin/twin.registry";
import {
  buildEnterpriseAgentRegistryManifest,
  getEnterpriseAgentById,
} from "../agent/agent.registry";
import { executeEnterpriseAgentOrThrow } from "../agent/agent.executor";

import type {
  AgentBaselineSnapshot,
  ReadinessReport,
} from "./signoff.types";

function runAgentBaseline(deploymentId: string) {
  const agent = getEnterpriseAgentById("e06.agent.growth");
  if (!agent) {
    throw new Error("missing agent e06.agent.growth");
  }

  return executeEnterpriseAgentOrThrow(agent, {
    taskId: `${deploymentId}-agent`,
    input: {
      goal: "E06 P8 autonomous enterprise governance freeze baseline",
      ready: true,
      riskScore: 10,
      projectHint: "星河科技园企业健身中心",
    },
    metadata: { source: "e06-p8-signoff", deploymentId },
  });
}

export function collectAgentBaseline(
  deploymentId: string,
): AgentBaselineSnapshot {
  const run = runAgentBaseline(`${deploymentId}-baseline`);

  return {
    ready: run.result.success && run.result.decision.directives.length === 4,
    agentId: run.result.agentId,
    twinId: run.result.twinId,
    mission: run.result.mission,
    posture: run.result.decision.posture,
    directiveCount: run.result.decision.directives.length,
    readinessScore: run.result.success ? 100 : 0,
  };
}

export function collectAutonomousPhaseReadiness(
  deploymentId: string,
): ReadinessReport {
  try {
    const foundation = buildOperationFoundation();
    const actions = buildActionRegistryManifest();
    const workflows = buildWorkflowRegistryManifest();
    const controls = buildControlRegistryManifest();
    const optimizations = buildOptimizationRegistryManifest();
    const twins = buildTwinRegistryManifest();
    const agents = buildEnterpriseAgentRegistryManifest();
    const baseline = collectAgentBaseline(deploymentId);

    const p1 = foundation.ready === true;
    const p2 = actions.catalogComplete === true;
    const p3 = workflows.catalogComplete === true;
    const p4 = controls.catalogComplete === true;
    const p5 = optimizations.catalogComplete === true;
    const p6 = twins.catalogComplete === true;
    const p7 = agents.catalogComplete === true && baseline.ready;

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
