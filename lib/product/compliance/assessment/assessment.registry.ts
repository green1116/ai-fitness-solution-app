/**
 * Product Compliance — Assessment registry
 */

import { getComplianceControl } from "../control/control.registry";
import { getComplianceEvidence } from "../evidence/evidence.registry";
import { getComplianceFramework } from "../framework/framework.registry";
import type {
  ComplianceAssessment,
  ComplianceAssessmentResult,
  RunComplianceAssessmentInput,
} from "./assessment.types";

const assessments = new Map<string, ComplianceAssessment>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function resolveResult(
  controlIds: string[],
  evidenceIds: string[],
): ComplianceAssessmentResult {
  if (evidenceIds.length === 0) return "FAIL";
  if (evidenceIds.length < controlIds.length) return "GAP";
  return "PASS";
}

function cloneAssessment(
  assessment: ComplianceAssessment,
): ComplianceAssessment {
  return {
    ...assessment,
    controlIds: [...assessment.controlIds],
    evidenceIds: [...assessment.evidenceIds],
    metadata: { ...assessment.metadata },
  };
}

export function runComplianceAssessment(
  input: RunComplianceAssessmentInput,
): ComplianceAssessment {
  const frameworkId = input.frameworkId.trim();
  if (!frameworkId) throw new Error("assessment.frameworkId is required");
  if (!input.controlIds.length) {
    throw new Error("assessment.controlIds is required");
  }

  const framework = getComplianceFramework(frameworkId);
  if (!framework) throw new Error(`framework not found: ${frameworkId}`);
  if (framework.status !== "ACTIVE") {
    throw new Error(`framework not active: ${frameworkId}`);
  }

  const controlIds = input.controlIds.map((id) => id.trim()).filter(Boolean);
  for (const controlId of controlIds) {
    const control = getComplianceControl(controlId);
    if (!control) throw new Error(`control not found: ${controlId}`);
    if (control.frameworkId !== frameworkId) {
      throw new Error(`control framework mismatch: ${controlId}`);
    }
  }

  const evidenceIds = input.evidenceIds.map((id) => id.trim()).filter(Boolean);
  for (const evidenceId of evidenceIds) {
    const evidence = getComplianceEvidence(evidenceId);
    if (!evidence) throw new Error(`evidence not found: ${evidenceId}`);
    if (!controlIds.includes(evidence.controlId)) {
      throw new Error(`evidence control mismatch: ${evidenceId}`);
    }
  }

  const id = input.id?.trim() || createId("cmpasm");
  if (assessments.has(id)) throw new Error(`assessment already exists: ${id}`);

  const result = resolveResult(controlIds, evidenceIds);
  const assessment: ComplianceAssessment = {
    id,
    frameworkId,
    controlIds,
    evidenceIds,
    result,
    detail: `result=${result} controls=${controlIds.length}`,
    metadata: { ...(input.metadata ?? {}) },
    assessedAt: nowIso(),
  };
  assessments.set(id, assessment);
  return cloneAssessment(assessment);
}

export function getComplianceAssessment(
  id: string,
): ComplianceAssessment | undefined {
  const assessment = assessments.get(id.trim());
  return assessment ? cloneAssessment(assessment) : undefined;
}

export function listComplianceAssessments(filter?: {
  frameworkId?: string;
  result?: ComplianceAssessmentResult;
}): ComplianceAssessment[] {
  let result = [...assessments.values()];
  if (filter?.frameworkId) {
    const frameworkId = filter.frameworkId.trim();
    result = result.filter((a) => a.frameworkId === frameworkId);
  }
  if (filter?.result) {
    result = result.filter((a) => a.result === filter.result);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAssessment);
}

export function clearComplianceAssessments(): void {
  assessments.clear();
}
