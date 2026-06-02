import { evaluateRequirementCoverage } from "./coverage";
import type { RequirementCoverageInput } from "./types";
import {
  getEvidenceByRequirement,
  getLinksForRequirement,
} from "./registry";
import type {
  EvidenceMatrixRequirementInput,
  EvidenceRegistry,
  TenderEvidenceMatrixRow,
} from "./types";

/**
 * 构建投标证据矩阵（基础版）
 */
export function buildTenderEvidenceMatrix(
  registry: EvidenceRegistry,
  requirements: EvidenceMatrixRequirementInput[],
): TenderEvidenceMatrixRow[] {
  return requirements.map((row) => {
    const linked = getEvidenceByRequirement(registry, row.requirementId);
    const links = getLinksForRequirement(registry, row.requirementId);

    const coverageInput: RequirementCoverageInput = {
      requirementId: row.requirementId,
      requirementText: row.requirement,
    };

    const coverage = evaluateRequirementCoverage(
      coverageInput,
      linked,
      links,
    );

    const primary =
      linked.find((d) =>
        links.some(
          (l) =>
            l.evidenceId === d.id &&
            (l.confidence ?? 0) ===
              Math.max(...links.map((x) => x.confidence ?? 0), 0),
        ),
      ) || linked[0];

    return {
      requirementId: row.requirementId,
      requirement: row.requirement,
      sku: row.sku,
      claimedValue: row.claimedValue,
      evidenceTitle: primary?.title,
      evidenceStatus: coverage.status,
    };
  });
}

export function summarizeEvidenceMatrix(
  rows: TenderEvidenceMatrixRow[],
): {
  fully: number;
  partial: number;
  unsupported: number;
  risky: number;
  total: number;
} {
  return {
    fully: rows.filter((r) => r.evidenceStatus === "fully_evidenced").length,
    partial: rows.filter((r) => r.evidenceStatus === "partially_evidenced")
      .length,
    unsupported: rows.filter((r) => r.evidenceStatus === "unsupported").length,
    risky: rows.filter((r) => r.evidenceStatus === "risky").length,
    total: rows.length,
  };
}
