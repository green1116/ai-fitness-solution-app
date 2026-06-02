import { getEvidenceByRequirement } from "@/lib/tender/evidence/registry";
import type { EvidenceRegistry, EvidenceType } from "@/lib/tender/evidence/types";
import type { RequirementCoverageResult } from "@/lib/tender/evidence/types";
import { lifecycleToCoverageStatus } from "../lifecycle/resolveLifecycleState";
import { resolveLifecycleState } from "../lifecycle/resolveLifecycleState";
import type {
  SemanticEvidenceCoverageSummary,
  SemanticEvidenceNeed,
  SemanticEvidenceNode,
} from "../types";

function satisfiedTypes(
  registry: EvidenceRegistry | undefined,
  requirementId: string,
  expected: EvidenceType[],
): { satisfied: number; missing: EvidenceType[] } {
  if (!registry || !expected.length) {
    return { satisfied: 0, missing: expected };
  }
  const docs = getEvidenceByRequirement(registry, requirementId);
  const present = new Set(docs.map((d) => d.type));
  const missing = expected.filter((t) => !present.has(t));
  const satisfied = expected.length - missing.length;
  return { satisfied, missing };
}

/**
 * V3.1 语义覆盖评估 — 对齐 registry coverage 与语义需求
 */
export function evaluateSemanticEvidenceCoverage(
  requirementNodes: SemanticEvidenceNode[],
  needs: SemanticEvidenceNeed[],
  registry?: EvidenceRegistry,
  registryCoverage?: RequirementCoverageResult[],
): SemanticEvidenceCoverageSummary {
  const needsByReq = new Map<string, SemanticEvidenceNeed[]>();
  for (const n of needs) {
    const list = needsByReq.get(n.requirementId) || [];
    list.push(n);
    needsByReq.set(n.requirementId, list);
  }

  const covById = new Map(
    (registryCoverage || []).map((c) => [c.requirementId, c]),
  );

  const rows = requirementNodes
    .filter((n) => n.nodeKind === "requirement")
    .map((node) => {
      const reqNeeds = needsByReq.get(node.refId) || [];
      const allExpected = [
        ...new Set(reqNeeds.flatMap((n) => n.expectedTypes)),
      ] as EvidenceType[];
      const { satisfied, missing } = satisfiedTypes(
        registry,
        node.refId,
        allExpected,
      );
      const semanticStatus = lifecycleToCoverageStatus(node.lifecycle);
      const regCov = covById.get(node.refId);
      const registryStatus = regCov?.status;
      const aligned =
        !registryStatus ||
        registryStatus === semanticStatus ||
        (registryStatus === "partially_evidenced" &&
          semanticStatus === "fully_evidenced");

      const notes: string[] = [];
      if (missing.length) {
        notes.push(`缺少证据类型：${missing.join(", ")}`);
      }
      if (!aligned && registryStatus) {
        notes.push(`registry(${registryStatus}) vs semantic(${semanticStatus})`);
      }

      return {
        requirementId: node.refId,
        requirementText: node.label,
        semanticStatus,
        registryStatus,
        aligned,
        satisfiedNeeds: satisfied,
        totalNeeds: allExpected.length || reqNeeds.length,
        missingTypes: missing,
        notes,
      };
    });

  const fullyEvidenced = rows.filter((r) => r.semanticStatus === "fully_evidenced").length;
  const partiallyEvidenced = rows.filter(
    (r) => r.semanticStatus === "partially_evidenced",
  ).length;
  const unsupported = rows.filter((r) => r.semanticStatus === "unsupported").length;
  const risky = rows.filter((r) => r.semanticStatus === "risky").length;
  const alignedCount = rows.filter((r) => r.aligned).length;
  const alignmentRatio = rows.length > 0 ? alignedCount / rows.length : 1;

  return {
    rows,
    fullyEvidenced,
    partiallyEvidenced,
    unsupported,
    risky,
    alignmentRatio,
  };
}
