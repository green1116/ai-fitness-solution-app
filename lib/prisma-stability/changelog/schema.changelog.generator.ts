/**
 * Prisma Stability V3 — schema changelog generator
 */

import type { SchemaDiffReport } from "../diff/schema.diff.engine";
import { runSchemaDiffAgainstBaseline } from "../diff/schema.diff.engine";

export type SchemaChangelog = {
  generatedAt: string;
  riskLevel: string;
  breakingSummary: string[];
  modelChanges: string[];
  relationChanges: string[];
  productionImpact: string[];
};

export function generateSchemaChangelog(report?: SchemaDiffReport): SchemaChangelog {
  const diff = report ?? runSchemaDiffAgainstBaseline();

  const modelChanges: string[] = [];
  if (diff.modelDiff.addedModels.length > 0) {
    modelChanges.push(`Added models: ${diff.modelDiff.addedModels.join(", ")}`);
  }
  if (diff.modelDiff.removedModels.length > 0) {
    modelChanges.push(`Removed models: ${diff.modelDiff.removedModels.join(", ")}`);
  }
  if (diff.modelDiff.modifiedModels.length > 0) {
    modelChanges.push(`Modified models: ${diff.modelDiff.modifiedModels.join(", ")}`);
  }

  const relationChanges = diff.relationChanges.map((r) => r.message);

  const productionImpact: string[] = [];
  if (diff.breakingChanges.length > 0) {
    productionImpact.push(`${diff.breakingChanges.length} breaking change(s) require migration coordination`);
  }
  if (diff.riskLevel === "CRITICAL" || diff.riskLevel === "HIGH") {
    productionImpact.push("Deploy during maintenance window recommended");
  }
  if (diff.modelDiff.removedModels.length > 0) {
    productionImpact.push("Data loss risk — backup database before deploy");
  }
  if (productionImpact.length === 0) {
    productionImpact.push("No production impact expected — additive or non-breaking changes");
  }

  return {
    generatedAt: new Date().toISOString(),
    riskLevel: diff.riskLevel,
    breakingSummary: [...diff.breakingChanges],
    modelChanges,
    relationChanges,
    productionImpact,
  };
}

export function formatSchemaChangelog(changelog: SchemaChangelog): string {
  const lines = [
    `# Schema Changelog`,
    `Generated: ${changelog.generatedAt}`,
    `Risk Level: ${changelog.riskLevel}`,
    "",
  ];

  if (changelog.breakingSummary.length > 0) {
    lines.push("## Breaking Changes", ...changelog.breakingSummary.map((b) => `- ${b}`), "");
  }

  if (changelog.modelChanges.length > 0) {
    lines.push("## Model Changes", ...changelog.modelChanges.map((m) => `- ${m}`), "");
  }

  if (changelog.relationChanges.length > 0) {
    lines.push("## Relation Changes", ...changelog.relationChanges.map((r) => `- ${r}`), "");
  }

  lines.push("## Production Impact", ...changelog.productionImpact.map((p) => `- ${p}`));
  return lines.join("\n");
}
