/**
 * E06-P7 — Autonomous Enterprise Agent Reasoner
 * Derives decisions and directives from twin simulation results
 */

import type { TwinSimulationResult } from "../digital-twin/twin.types";
import type {
  AgentDecision,
  AgentDirective,
  AgentPosture,
  EnterpriseAgentDefinition,
} from "./agent.types";

function resolvePosture(
  agent: EnterpriseAgentDefinition,
  twin: TwinSimulationResult,
): AgentPosture {
  if (
    twin.projection.projectedScore < agent.correctiveBelow ||
    twin.projection.projectedHealth === "critical" ||
    !twin.projection.converged
  ) {
    return "corrective";
  }
  if (twin.projection.projectedHealth === "strained") {
    return "conservative";
  }
  return agent.preferredPosture;
}

function confidenceFromTwin(twin: TwinSimulationResult): number {
  const base = twin.projection.projectedScore / 100;
  const penalty = twin.projection.converged ? 0 : 0.3;
  return Math.max(0.3, Math.min(0.95, base - penalty));
}

export function reasonEnterpriseAgent(
  agent: EnterpriseAgentDefinition,
  twin: TwinSimulationResult,
): AgentDecision {
  if (agent.twinId !== twin.twinId) {
    throw new Error(
      `agent/twin mismatch: agent.twinId=${agent.twinId} twin.twinId=${twin.twinId}`,
    );
  }

  const posture = resolvePosture(agent, twin);
  const confidence = confidenceFromTwin(twin);

  const directives: AgentDirective[] = [
    {
      id: `${agent.id}.observe`,
      kind: "observe",
      title: "Observe twin state",
      detail: twin.model.narrative,
      order: 1,
      readOnly: true,
    },
    {
      id: `${agent.id}.decide`,
      kind: "decide",
      title: "Adopt posture from projection",
      detail: `Adopt ${posture} posture from ${twin.projection.verdict}`,
      order: 2,
      readOnly: true,
    },
    {
      id: `${agent.id}.act`,
      kind: "act",
      title:
        posture === "corrective"
          ? "Trigger corrective optimization"
          : "Sustain optimized trajectory",
      detail:
        posture === "corrective"
          ? `Re-run ${twin.optimizationId} until score >= ${agent.correctiveBelow}`
          : `Keep ${twin.optimizationId} knobs applied under ${posture} posture`,
      order: 3,
      readOnly: true,
    },
    {
      id: `${agent.id}.monitor`,
      kind: "monitor",
      title: "Monitor twin convergence",
      detail: `Watch ${twin.twinId} projected=${twin.projection.projectedScore} health=${twin.projection.projectedHealth}`,
      order: 4,
      readOnly: true,
    },
  ];

  const rationale = [
    `${agent.name} (mission=${agent.mission})`,
    `reads twin ${twin.twinId} score=${twin.projection.projectedScore}`,
    `health=${twin.projection.projectedHealth}`,
    `→ posture=${posture}`,
    `(confidence=${confidence.toFixed(2)})`,
  ].join(" ");

  return {
    agentId: agent.id,
    twinId: agent.twinId,
    mission: agent.mission,
    posture,
    directives: Object.freeze([...directives]) as AgentDirective[],
    rationale,
    confidence,
    readOnly: true,
  };
}
