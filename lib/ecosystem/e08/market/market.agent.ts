/**
 * E08-P6 — Autonomous Market Agent Reasoner
 * Derives market decisions from ecosystem intelligence results
 */

import type { IntelligenceRunResult } from "../intelligence/intelligence.types";
import type {
  MarketAgentDefinition,
  MarketDecision,
  MarketDirective,
  MarketPosture,
} from "./market.types";

function resolvePosture(
  agent: MarketAgentDefinition,
  intelligence: IntelligenceRunResult,
): MarketPosture {
  if (
    intelligence.analysis.score < agent.correctiveBelow ||
    intelligence.analysis.needsInsight ||
    !intelligence.success
  ) {
    return "corrective";
  }
  if (intelligence.insight.confidence < 70) {
    return "cautious";
  }
  return agent.preferredPosture;
}

function confidenceFromIntelligence(
  intelligence: IntelligenceRunResult,
): number {
  const base = intelligence.analysis.score / 100;
  const insightBoost = intelligence.insight.confidence / 200;
  const penalty = intelligence.analysis.needsInsight ? 0.25 : 0;
  return Math.max(0.3, Math.min(0.95, base + insightBoost - penalty));
}

export function reasonMarketAgent(
  agent: MarketAgentDefinition,
  intelligence: IntelligenceRunResult,
): MarketDecision {
  if (agent.intelligenceId !== intelligence.intelligenceId) {
    throw new Error(
      `agent/intelligence mismatch: agent.intelligenceId=${agent.intelligenceId} intelligence.intelligenceId=${intelligence.intelligenceId}`,
    );
  }

  const posture = resolvePosture(agent, intelligence);
  const confidence = confidenceFromIntelligence(intelligence);

  const directives: MarketDirective[] = [
    {
      id: `${agent.id}.sense`,
      kind: "sense",
      title: "Sense ecosystem intelligence",
      detail: intelligence.insight.summary,
      order: 1,
      readOnly: true,
    },
    {
      id: `${agent.id}.decide`,
      kind: "decide",
      title: "Adopt market posture",
      detail: `Adopt ${posture} posture from ${intelligence.insight.headline}`,
      order: 2,
      readOnly: true,
    },
    {
      id: `${agent.id}.act`,
      kind: "act",
      title:
        posture === "corrective"
          ? "Trigger corrective market action"
          : "Sustain market trajectory",
      detail:
        posture === "corrective"
          ? `Reinforce ${intelligence.intelligenceId} until score >= ${agent.correctiveBelow}`
          : `Keep ${intelligence.workflowId} exchanges under ${posture} posture`,
      order: 3,
      readOnly: true,
    },
    {
      id: `${agent.id}.monitor`,
      kind: "monitor",
      title: "Monitor market intelligence",
      detail: `Watch ${intelligence.intelligenceId} score=${intelligence.analysis.score} confidence=${intelligence.insight.confidence}`,
      order: 4,
      readOnly: true,
    },
  ];

  const rationale = [
    `${agent.name} (mission=${agent.mission})`,
    `reads intelligence ${intelligence.intelligenceId} score=${intelligence.analysis.score}`,
    `confidence=${intelligence.insight.confidence}`,
    `→ posture=${posture}`,
    `(decisionConfidence=${confidence.toFixed(2)})`,
  ].join(" ");

  return {
    agentId: agent.id,
    intelligenceId: agent.intelligenceId,
    mission: agent.mission,
    posture,
    directives: Object.freeze([...directives]) as MarketDirective[],
    rationale,
    confidence,
    readOnly: true,
  };
}
