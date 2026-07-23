/**
 * Commercialization P7 — Risk assessment
 */

import { RISK_LEVELS } from "../governance/governance.constants";
import { getGovernance } from "../governance/governance.registry";
import type {
  AssessRiskInput,
  RiskAssessment,
  RiskLevel,
} from "./risk.types";

const assessments = new Map<string, RiskAssessment>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function scoreToRiskLevel(score: number): RiskLevel {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 35) return "MEDIUM";
  return "LOW";
}

function cloneAssessment(assessment: RiskAssessment): RiskAssessment {
  return { ...assessment, metadata: { ...assessment.metadata } };
}

export function assessRisk(input: AssessRiskInput): RiskAssessment {
  const title = input.title.trim();
  const governanceId = input.governanceId.trim();
  if (!title) throw new Error("risk.title is required");
  if (!governanceId) throw new Error("risk.governanceId is required");
  if (!getGovernance(governanceId)) {
    throw new Error(`governance not found: ${governanceId}`);
  }
  if (!Number.isFinite(input.impact) || input.impact < 0 || input.impact > 100) {
    throw new Error("risk.impact must be between 0 and 100");
  }
  if (
    !Number.isFinite(input.likelihood) ||
    input.likelihood < 0 ||
    input.likelihood > 100
  ) {
    throw new Error("risk.likelihood must be between 0 and 100");
  }

  const id = input.id?.trim() || createId("rsk");
  if (assessments.has(id)) {
    throw new Error(`risk assessment already exists: ${id}`);
  }

  const impact = clampScore(input.impact);
  const likelihood = clampScore(input.likelihood);
  const score = clampScore((impact * likelihood) / 100);
  const level = scoreToRiskLevel(score);

  const assessment: RiskAssessment = {
    id,
    governanceId,
    title,
    impact,
    likelihood,
    score,
    level,
    detail: `score=${score} level=${level}`,
    metadata: { ...(input.metadata ?? {}) },
    assessedAt: nowIso(),
  };
  assessments.set(id, assessment);
  return cloneAssessment(assessment);
}

export function getRiskAssessment(
  id: string,
): RiskAssessment | undefined {
  const assessment = assessments.get(id.trim());
  return assessment ? cloneAssessment(assessment) : undefined;
}

export function listRiskAssessments(filter?: {
  governanceId?: string;
  level?: RiskLevel;
}): RiskAssessment[] {
  let result = [...assessments.values()];
  if (filter?.governanceId) {
    const gid = filter.governanceId.trim();
    result = result.filter((a) => a.governanceId === gid);
  }
  if (filter?.level) result = result.filter((a) => a.level === filter.level);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAssessment);
}

export function clearRiskAssessments(): void {
  assessments.clear();
}

export { RISK_LEVELS };
