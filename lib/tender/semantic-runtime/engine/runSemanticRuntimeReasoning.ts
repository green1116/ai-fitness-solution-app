import { createEvidenceRegistry } from "@/lib/tender/evidence/registry";
import { runSemanticEvidenceReasoning } from "@/lib/tender/semantic-evidence";

import { buildSemanticRuntimeDecision } from "../decision/buildSemanticRuntimeDecision";
import { extractRequirementIntents } from "../intent/extractRequirementIntents";
import { runSemanticEvidenceMatching } from "../matching/runSemanticEvidenceMatching";
import { buildEvidenceSemanticProfiles } from "../profile/buildEvidenceSemanticProfiles";
import type {
  SemanticRuntimePhaseId,
  SemanticRuntimePhaseResult,
  SemanticRuntimeReasoningInput,
  SemanticRuntimeReasoningResult,
} from "../types";
import { buildSemanticVocabulary } from "../vocabulary/buildSemanticVocabulary";

function phaseResult(
  phaseId: SemanticRuntimePhaseId,
  status: SemanticRuntimePhaseResult["status"],
  started: number,
  message: string,
  metrics?: SemanticRuntimePhaseResult["metrics"],
): SemanticRuntimePhaseResult {
  const finished = Date.now();
  return {
    phaseId,
    status,
    startedAt: new Date(started).toISOString(),
    finishedAt: new Date(finished).toISOString(),
    durationMs: finished - started,
    message,
    metrics,
  };
}

/**
 * V3.2 Semantic Runtime Reasoning Engine
 *
 * vocabulary → intent → profile → match → coverage (V3.1) → decide
 */
export function runSemanticRuntimeReasoning(
  input: SemanticRuntimeReasoningInput,
): SemanticRuntimeReasoningResult {
  const ranAt = new Date().toISOString();
  const phases: SemanticRuntimePhaseResult[] = [];

  let intelligence = input.intelligence;
  if (!intelligence) {
    if (!input.graph) {
      throw new Error("需要提供 intelligence 或 graph");
    }
    intelligence = runSemanticEvidenceReasoning({
      graph: input.graph,
      registry: input.registry,
      sourceName: input.sourceName,
    });
  }

  const graph = intelligence.context.graph;
  const registry = intelligence.context.registry ?? createEvidenceRegistry();

  // vocabulary
  let t0 = Date.now();
  const vocabulary = buildSemanticVocabulary(graph);
  phases.push(
    phaseResult("vocabulary", "completed", t0, `词汇表 ${vocabulary.termCount} 项`, {
      keywords: vocabulary.keywords.length,
    }),
  );

  // intent
  t0 = Date.now();
  const intents = extractRequirementIntents(graph, intelligence.evidenceNeeds);
  phases.push(
    phaseResult("intent", "completed", t0, `抽取 ${intents.length} 条需求意图`, {
      mandatory: intents.filter((i) => i.priority === "mandatory").length,
    }),
  );

  // profile
  t0 = Date.now();
  const profiles = buildEvidenceSemanticProfiles(registry, intents);
  phases.push(
    phaseResult("profile", "completed", t0, `构建 ${profiles.length} 份证据语义画像`, {
      avgStrength:
        profiles.length > 0
          ? Math.round(
              (profiles.reduce((s, p) => s + p.strengthScore, 0) / profiles.length) *
                100,
            ) / 100
          : 0,
    }),
  );

  // match
  t0 = Date.now();
  const matches = runSemanticEvidenceMatching(intents, profiles, registry);
  phases.push(
    phaseResult("match", "completed", t0, `语义匹配 ${matches.length} 对`, {
      avgScore:
        matches.length > 0
          ? Math.round(
              (matches.reduce((s, m) => s + m.matchScore, 0) / matches.length) * 100,
            ) / 100
          : 0,
    }),
  );

  // coverage (from V3.1)
  t0 = Date.now();
  const coverage = intelligence.coverage;
  phases.push(
    phaseResult("coverage", "completed", t0, "沿用 V3.1 语义覆盖评估", {
      alignmentRatio: coverage.alignmentRatio,
      unsupported: coverage.unsupported,
    }),
  );

  // decide
  t0 = Date.now();
  const decision = buildSemanticRuntimeDecision({
    intents,
    matches,
    coverage,
    policy: input.policy,
    forceAllow: input.forceAllow,
  });
  decision.meta.profileCount = profiles.length;
  phases.push(
    phaseResult("decide", "completed", t0, `语义决策 ${decision.action}`, {
      passed: decision.passed,
      gapCount: decision.meta.gapCount,
    }),
  );

  return {
    version: "3.2",
    ranAt,
    phases,
    vocabulary,
    intents,
    profiles,
    matches,
    intelligence,
    decision,
  };
}
