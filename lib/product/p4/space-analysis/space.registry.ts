/**
 * Product P4 — Space analysis registry
 */

import { SPACE_ANALYSIS_STATUSES } from "../questionnaire/questionnaire.constants";
import type {
  AnalyzeSpaceInput,
  SpaceAnalysis,
  SpaceAnalysisStatus,
} from "./space.types";

const analyses = new Map<string, SpaceAnalysis>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clampRatio(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function cloneAnalysis(analysis: SpaceAnalysis): SpaceAnalysis {
  return { ...analysis, metadata: { ...analysis.metadata } };
}

export function analyzeSpace(input: AnalyzeSpaceInput): SpaceAnalysis {
  const projectRef = input.projectRef.trim();
  const siteLabel = input.siteLabel.trim();
  if (!projectRef) throw new Error("space.projectRef is required");
  if (!siteLabel) throw new Error("space.siteLabel is required");
  if (!Number.isFinite(input.areaSqm) || input.areaSqm <= 0) {
    throw new Error("space.areaSqm must be a positive number");
  }
  if (!Number.isFinite(input.usableRatio)) {
    throw new Error("space.usableRatio must be a number");
  }

  const id = input.id?.trim() || createId("p4spc");
  if (analyses.has(id)) {
    throw new Error(`space analysis already exists: ${id}`);
  }

  const areaSqm = Math.round(input.areaSqm);
  const usableRatio = clampRatio(input.usableRatio);
  const status = SPACE_ANALYSIS_STATUSES[1];
  const analysis: SpaceAnalysis = {
    id,
    projectRef,
    siteLabel,
    areaSqm,
    usableRatio,
    status,
    detail: `area=${areaSqm} usable=${usableRatio} status=${status}`,
    metadata: { ...(input.metadata ?? {}) },
    analyzedAt: nowIso(),
  };
  analyses.set(id, analysis);
  return cloneAnalysis(analysis);
}

export function getSpaceAnalysis(id: string): SpaceAnalysis | undefined {
  const analysis = analyses.get(id.trim());
  return analysis ? cloneAnalysis(analysis) : undefined;
}

export function listSpaceAnalyses(filter?: {
  projectRef?: string;
  status?: SpaceAnalysisStatus;
}): SpaceAnalysis[] {
  let result = [...analyses.values()];
  if (filter?.projectRef) {
    const pref = filter.projectRef.trim();
    result = result.filter((a) => a.projectRef === pref);
  }
  if (filter?.status) result = result.filter((a) => a.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAnalysis);
}

export function clearSpaceAnalyses(): void {
  analyses.clear();
}
