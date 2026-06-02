import { getEvidenceByRequirement } from "@/lib/tender/evidence/registry";
import type { RequirementCoverageResult } from "@/lib/tender/evidence/types";

import { createSemanticEvidenceContext } from "../context/createSemanticEvidenceContext";
import { buildSemanticEvidenceExecutionGraph } from "../graph/buildSemanticEvidenceGraph";
import {
  inferSemanticEvidenceNeeds,
  resetEvidenceNeedSequence,
} from "../inference/inferEvidenceNeeds";
import { evaluateSemanticEvidenceCoverage } from "./evaluateSemanticCoverage";
import type {
  SemanticEvidenceIntelligenceInput,
  SemanticEvidenceIntelligenceResult,
  SemanticInference,
  SemanticReasoningStep,
} from "../types";

let inferenceSeq = 0;

function traceStep(
  stepId: SemanticReasoningStep["stepId"],
  message: string,
  metrics?: SemanticReasoningStep["metrics"],
): SemanticReasoningStep {
  return {
    stepId,
    message,
    at: new Date().toISOString(),
    metrics,
  };
}

function buildInferences(
  executionGraph: ReturnType<typeof buildSemanticEvidenceExecutionGraph>,
  needs: ReturnType<typeof inferSemanticEvidenceNeeds>,
  registry?: import("@/lib/tender/evidence/types").EvidenceRegistry,
): SemanticInference[] {
  inferenceSeq = 0;
  const out: SemanticInference[] = [];

  const push = (
    ruleId: SemanticInference["ruleId"],
    subjectNodeId: string,
    conclusion: string,
    confidence: number,
    relatedEvidenceIds?: string[],
  ) => {
    inferenceSeq += 1;
    out.push({
      id: `inf-${inferenceSeq}`,
      ruleId,
      subjectNodeId,
      conclusion,
      confidence,
      relatedEvidenceIds,
    });
  };

  const rationaleToRule: Record<string, SemanticInference["ruleId"]> = {
    "requirement.evidence_required": "requirement.evidence_required",
    "requirement.measurable_technical": "requirement.measurable_technical",
    "requirement.qualification": "requirement.qualification",
    "scoring.evidence_needed": "scoring.evidence_needed",
    "risk.high_severity": "risk.high_severity",
    "compliance.missing": "compliance.missing",
  };

  for (const need of needs) {
    const subject = `requirement:${need.requirementId}`;
    push(
      rationaleToRule[need.rationale] || "requirement.evidence_required",
      subject,
      `需要 ${need.expectedTypes.join("/")} 类证据（${need.priority}）`,
      need.priority === "mandatory" ? 0.92 : 0.75,
    );
  }

  if (registry) {
    for (const node of executionGraph.nodes) {
      if (node.nodeKind !== "requirement") continue;
      const docs = getEvidenceByRequirement(registry, node.refId);
      if (docs.length > 0) {
        push(
          "registry.link_satisfaction",
          node.id,
          `registry 已关联 ${docs.length} 份证据`,
          0.88,
          docs.map((d) => d.id),
        );
      }
    }
  }

  return out.slice(0, 100);
}

export type RunSemanticEvidenceReasoningOptions = {
  registryCoverage?: RequirementCoverageResult[];
};

/**
 * V3.1 语义证据推理主入口（确定性规则链，无 LLM）
 */
export function runSemanticEvidenceReasoning(
  input: SemanticEvidenceIntelligenceInput,
  options: RunSemanticEvidenceReasoningOptions = {},
): SemanticEvidenceIntelligenceResult {
  resetEvidenceNeedSequence();
  const ranAt = new Date().toISOString();
  const reasoningTrace: SemanticReasoningStep[] = [];
  const context = createSemanticEvidenceContext(input);

  reasoningTrace.push(
    traceStep("build_graph", "初始化语义证据上下文", {
      contextId: context.contextId,
      requirements: context.graph.requirements.length,
    }),
  );

  const evidenceNeeds = inferSemanticEvidenceNeeds(context.graph);
  reasoningTrace.push(
    traceStep("infer_needs", `推断 ${evidenceNeeds.length} 条 evidence 需求`, {
      mandatory: evidenceNeeds.filter((n) => n.priority === "mandatory").length,
    }),
  );

  const executionGraph = buildSemanticEvidenceExecutionGraph(
    context.graph,
    evidenceNeeds,
    context.registry,
  );
  reasoningTrace.push(
    traceStep("bind_registry", "构建语义执行图并绑定 registry", {
      nodes: executionGraph.summary.nodeCount,
      edges: executionGraph.summary.edgeCount,
      gaps: executionGraph.summary.gapNodes,
    }),
  );

  const requirementNodes = executionGraph.nodes.filter(
    (n) => n.nodeKind === "requirement",
  );
  const coverage = evaluateSemanticEvidenceCoverage(
    requirementNodes,
    evidenceNeeds,
    context.registry,
    options.registryCoverage,
  );
  reasoningTrace.push(
    traceStep("evaluate_coverage", "完成语义覆盖评估", {
      alignmentRatio: coverage.alignmentRatio,
      unsupported: coverage.unsupported,
    }),
  );

  const inferences = buildInferences(
    executionGraph,
    evidenceNeeds,
    context.registry,
  );
  reasoningTrace.push(
    traceStep("emit_gaps", `生成 ${inferences.length} 条语义推断`, {
      inferences: inferences.length,
    }),
  );

  return {
    version: "3.1",
    context,
    executionGraph,
    evidenceNeeds,
    inferences,
    coverage,
    reasoningTrace,
    ranAt,
  };
}
