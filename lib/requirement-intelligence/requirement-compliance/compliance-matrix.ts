import { buildRequirementRegistryRecords } from "../requirement-registry";
import type {
  RequirementComplianceMatrix,
  RequirementComplianceMatrixCell,
  RequirementComplianceRecord,
} from "../shared/types";
import { REQUIREMENT_COMPLIANCE_MIN_MATRIX_RECORDS } from "../shared/types";
import { buildRequirementComplianceRecords } from "./compliance-registry";

let cachedMatrixCells: RequirementComplianceMatrixCell[] | undefined;

function buildRequirementEvidenceCells(
  record: RequirementComplianceRecord,
): RequirementComplianceMatrixCell[] {
  return record.linkedEvidenceIds.map((evidenceId) => ({
    cellId: `req-matrix-evidence-${record.requirementId}-${evidenceId}`,
    requirementId: record.requirementId,
    axisType: "evidence" as const,
    targetId: evidenceId,
    linked: true,
    complianceScore: record.complianceScore,
    complianceStatus: record.complianceStatus,
    traceRef: evidenceId,
    mode: "requirement-intelligence" as const,
  }));
}

function buildRequirementBrandCells(
  record: RequirementComplianceRecord,
): RequirementComplianceMatrixCell[] {
  if (!record.brandId) return [];

  return [
    {
      cellId: `req-matrix-brand-${record.requirementId}-${record.brandId}`,
      requirementId: record.requirementId,
      axisType: "brand" as const,
      targetId: record.brandId,
      linked: record.gap.missingBrandLinks.length === 0,
      complianceScore: record.factors.brandAlignment,
      complianceStatus: record.complianceStatus,
      traceRef: record.brandId,
      mode: "requirement-intelligence",
    },
  ];
}

function buildRequirementTenderCells(
  record: RequirementComplianceRecord,
): RequirementComplianceMatrixCell[] {
  return [
    {
      cellId: `req-matrix-tender-${record.requirementId}-${record.tenderId}`,
      requirementId: record.requirementId,
      axisType: "tender" as const,
      targetId: record.tenderId,
      linked: true,
      complianceScore: record.complianceScore,
      complianceStatus: record.complianceStatus,
      traceRef: record.tenderId,
      mode: "requirement-intelligence",
    },
  ];
}

export function buildRequirementComplianceMatrixCells(): RequirementComplianceMatrixCell[] {
  if (cachedMatrixCells) return cachedMatrixCells;

  const cells: RequirementComplianceMatrixCell[] = [];

  for (const record of buildRequirementComplianceRecords()) {
    cells.push(
      ...buildRequirementEvidenceCells(record),
      ...buildRequirementBrandCells(record),
      ...buildRequirementTenderCells(record),
    );
  }

  cachedMatrixCells = cells;
  return cells;
}

export function buildRequirementComplianceMatrix(): RequirementComplianceMatrix {
  const cells = buildRequirementComplianceMatrixCells();
  const requirementEvidenceCells = cells.filter((cell) => cell.axisType === "evidence").length;
  const requirementBrandCells = cells.filter((cell) => cell.axisType === "brand").length;
  const requirementTenderCells = cells.filter((cell) => cell.axisType === "tender").length;

  return {
    matrixId: "requirement-compliance-matrix-v40-p3",
    cells,
    cellCount: cells.length,
    requirementEvidenceCells,
    requirementBrandCells,
    requirementTenderCells,
    matrixReady: cells.length >= REQUIREMENT_COMPLIANCE_MIN_MATRIX_RECORDS,
    mode: "requirement-intelligence",
  };
}

export function findMatrixCellsByRequirementId(
  requirementId: string,
): RequirementComplianceMatrixCell[] {
  return buildRequirementComplianceMatrixCells().filter(
    (cell) => cell.requirementId === requirementId,
  );
}

export function findMatrixCellsByTenderId(tenderId: string): RequirementComplianceMatrixCell[] {
  const requirementIds = new Set(
    buildRequirementRegistryRecords()
      .filter((record) => record.tenderId === tenderId)
      .map((record) => record.requirementId),
  );

  return buildRequirementComplianceMatrixCells().filter((cell) =>
    requirementIds.has(cell.requirementId),
  );
}
