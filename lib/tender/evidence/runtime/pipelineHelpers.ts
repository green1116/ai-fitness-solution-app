import type { TechnicalCompliancePackage } from "@/lib/tender/compliance/types";

import {
  adaptComplianceEvidence,
  adaptQualificationEvidence,
  adaptResponseEvidence,
  adaptRiskEvidence,
  adaptScoringEvidence,
  adaptSkuEvidence,
  adaptTechnicalEvidence,
} from "../adapters";
import { resolveSemanticRequirementId } from "../adapters/dedupe";
import type { NormalizedEvidencePayload } from "../adapters/types";
import type {
  EvidenceMatrixRequirementInput,
  RequirementCoverageInput,
} from "../types";
import type { EvidencePipelineSnapshot } from "../bridge/pipelineTypes";

export function collectEvidencePayloads(
  snapshot: EvidencePipelineSnapshot,
): NormalizedEvidencePayload[] {
  const out: NormalizedEvidencePayload[] = [];

  if (snapshot.compliance) {
    out.push(...adaptComplianceEvidence(snapshot.compliance, snapshot.graph));
    out.push(...adaptTechnicalEvidence(snapshot.compliance, snapshot.graph));
  }

  if (snapshot.graph) {
    out.push(...adaptRiskEvidence(snapshot.graph));
    out.push(...adaptScoringEvidence(snapshot.graph));
    out.push(...adaptQualificationEvidence(snapshot.graph));
  }

  if (snapshot.responses) {
    out.push(...adaptResponseEvidence(snapshot.responses));
  }

  if (snapshot.skuResult) {
    out.push(...adaptSkuEvidence(snapshot.skuResult));
  }

  return out;
}

export function buildMatrixInputs(
  snapshot: EvidencePipelineSnapshot,
): EvidenceMatrixRequirementInput[] {
  const rows: EvidenceMatrixRequirementInput[] = [];

  if (snapshot.compliance) {
    for (const req of snapshot.compliance.requirements) {
      const semanticId = resolveSemanticRequirementId(req.id);
      const result = snapshot.compliance.complianceResults.find(
        (r) => r.requirementId === req.id,
      );
      const matrixRow = snapshot.compliance.matrix.find(
        (m) => m.requirementText === req.requirementText,
      );
      rows.push({
        requirementId: semanticId,
        requirement: req.requirementText,
        sku: matrixRow?.skuName,
        claimedValue:
          matrixRow?.actualValue ||
          result?.matchedParameters[0]?.actual,
      });
    }
  }

  if (snapshot.graph) {
    for (const req of snapshot.graph.requirements) {
      if (rows.some((r) => r.requirementId === req.id)) continue;
      if (
        !req.measurable &&
        req.category !== "technical" &&
        !req.evidenceRequired
      ) {
        continue;
      }
      rows.push({
        requirementId: req.id,
        requirement: req.requirement,
      });
    }
  }

  return rows;
}

export function buildCoverageInputs(
  snapshot: EvidencePipelineSnapshot,
): RequirementCoverageInput[] {
  const inputs: RequirementCoverageInput[] = [];
  const seen = new Set<string>();

  if (snapshot.graph) {
    for (const req of snapshot.graph.requirements) {
      if (seen.has(req.id)) continue;
      seen.add(req.id);
      inputs.push({
        requirementId: req.id,
        requirementText: req.requirement,
        mandatory: req.importance === "mandatory",
      });
    }
  }

  if (snapshot.compliance) {
    for (const req of snapshot.compliance.requirements) {
      const semanticId = resolveSemanticRequirementId(req.id);
      if (seen.has(semanticId)) continue;
      seen.add(semanticId);
      inputs.push({
        requirementId: semanticId,
        requirementText: req.requirementText,
        mandatory: req.mandatory,
      });
    }
  }

  return inputs;
}

/** 便捷：仅 compliance 路径 */
export function snapshotFromCompliance(
  compliance: TechnicalCompliancePackage,
  graph?: EvidencePipelineSnapshot["graph"],
  skuResult?: EvidencePipelineSnapshot["skuResult"],
): EvidencePipelineSnapshot {
  return { compliance, graph, skuResult };
}
