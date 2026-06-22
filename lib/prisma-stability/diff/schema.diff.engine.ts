/**
 * Prisma Stability V2 — schema diff engine
 */

import { parsePrismaSchema } from "../core/schema.parser";
import { analyzeModelDiff, type ModelFieldChange } from "./model.diff.analyzer";
import { analyzeRelationDiff, type RelationChange } from "./relation.diff.analyzer";
import { resolveSchemaDiffPair } from "./baseline.resolver";

export type RiskLevel = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type SchemaDiffReport = {
  beforeLabel: string;
  afterLabel: string;
  hasChanges: boolean;
  modelDiff: ReturnType<typeof analyzeModelDiff>;
  relationChanges: RelationChange[];
  breakingChanges: string[];
  warnings: string[];
  riskLevel: RiskLevel;
  summary: string;
};

function computeRiskLevel(
  breakingCount: number,
  warningCount: number,
  removedModels: number,
): RiskLevel {
  if (removedModels > 0 || breakingCount >= 5) return "CRITICAL";
  if (breakingCount >= 2) return "HIGH";
  if (breakingCount === 1) return "MEDIUM";
  if (warningCount > 0) return "LOW";
  return "NONE";
}

function formatBreakingItem(c: ModelFieldChange | RelationChange): string {
  return `- ${c.model} → ${c.message}`;
}

export function runSchemaDiffEngine(beforeSource: string, afterSource: string, labels?: {
  beforeLabel?: string;
  afterLabel?: string;
}): SchemaDiffReport {
  const before = parsePrismaSchema(beforeSource, "before");
  const after = parsePrismaSchema(afterSource, "after");

  const modelDiff = analyzeModelDiff(before, after, beforeSource, afterSource);
  const relationChanges = analyzeRelationDiff(before, after);

  const breakingFromModels = modelDiff.changes.filter((c) => c.breaking);
  const breakingFromRelations = relationChanges.filter((c) => c.breaking);

  const warnings: string[] = [];
  const breakingChanges: string[] = [
    ...breakingFromModels.map(formatBreakingItem),
    ...breakingFromRelations.map(formatBreakingItem),
  ];

  for (const c of modelDiff.changes.filter((x) => !x.breaking && x.kind !== "model_added")) {
    if (c.kind === "index_added" || c.kind === "field_added") {
      warnings.push(`- ${c.model} → ${c.message}`);
    }
  }

  for (const r of relationChanges.filter((x) => !x.breaking)) {
    warnings.push(`- ${r.model} → ${r.message}`);
  }

  const hasChanges =
    modelDiff.changes.length > 0 ||
    relationChanges.length > 0 ||
    beforeSource.trim() !== afterSource.trim();

  const riskLevel = hasChanges
    ? computeRiskLevel(breakingChanges.length, warnings.length, modelDiff.removedModels.length)
    : "NONE";

  const summary = hasChanges
    ? `${breakingChanges.length} breaking, ${warnings.length} warnings — Risk: ${riskLevel}`
    : "No schema changes detected";

  return {
    beforeLabel: labels?.beforeLabel ?? "before",
    afterLabel: labels?.afterLabel ?? "after",
    hasChanges,
    modelDiff,
    relationChanges,
    breakingChanges,
    warnings,
    riskLevel,
    summary,
  };
}

export function runSchemaDiffAgainstBaseline(): SchemaDiffReport {
  const pair = resolveSchemaDiffPair();
  return runSchemaDiffEngine(pair.before, pair.after, {
    beforeLabel: pair.beforeLabel,
    afterLabel: pair.afterLabel,
  });
}

export function formatSchemaDiffReport(report: SchemaDiffReport): string {
  const lines: string[] = [
    "Schema Diff Audit",
    `Baseline: ${report.beforeLabel}`,
    `Current:  ${report.afterLabel}`,
    "",
  ];

  if (!report.hasChanges) {
    lines.push("✓ No schema changes detected");
    return lines.join("\n");
  }

  if (report.breakingChanges.length > 0) {
    lines.push("⚠ Breaking Changes Detected:", "");
    lines.push(...report.breakingChanges, "");
  }

  if (report.warnings.length > 0) {
    lines.push("ℹ Non-breaking changes:", "");
    lines.push(...report.warnings, "");
  }

  if (report.modelDiff.addedModels.length > 0) {
    lines.push(`Added models: ${report.modelDiff.addedModels.join(", ")}`);
  }
  if (report.modelDiff.removedModels.length > 0) {
    lines.push(`Removed models: ${report.modelDiff.removedModels.join(", ")}`);
  }
  if (report.modelDiff.modifiedModels.length > 0) {
    lines.push(`Modified models: ${report.modelDiff.modifiedModels.join(", ")}`);
  }

  lines.push("", `Risk Level: ${report.riskLevel}`, `Summary: ${report.summary}`);
  return lines.join("\n");
}
