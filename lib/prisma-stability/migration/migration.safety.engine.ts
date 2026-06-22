/**
 * Prisma Stability V2 — migration safety engine
 *
 * Rules: DROP / RENAME / TYPE CHANGE → warning + block in production
 */

import type { SchemaDiffReport } from "../diff/schema.diff.engine";
import type { ModelFieldChange } from "../diff/model.diff.analyzer";

export type MigrationSafetyIssue = {
  severity: "error" | "warning";
  code: "DROP_COLUMN" | "DROP_MODEL" | "RENAME" | "TYPE_CHANGE" | "RELATION_CHANGE" | "MAP_CHANGE" | "INDEX_DROP" | "LARGE_EXPANSION";
  message: string;
  suggestion?: string;
};

export type MigrationSafetyResult = {
  ok: boolean;
  blocked: boolean;
  issues: MigrationSafetyIssue[];
  errors: string[];
  warnings: string[];
};

function issueFromFieldChange(c: ModelFieldChange): MigrationSafetyIssue | null {
  switch (c.kind) {
    case "model_removed":
      return {
        severity: "error",
        code: "DROP_MODEL",
        message: c.message,
        suggestion: "Use staged deprecation: new model + @@map, never hard-drop in production",
      };
    case "field_removed":
      return {
        severity: "error",
        code: "DROP_COLUMN",
        message: c.message,
        suggestion: "Add nullable column first, migrate data, then drop in a later release",
      };
    case "type_changed":
      return {
        severity: "error",
        code: "TYPE_CHANGE",
        message: c.message,
        suggestion: "Add new column, backfill, switch reads, then remove old column",
      };
    case "map_changed":
      return {
        severity: "error",
        code: "RENAME",
        message: c.message,
        suggestion: "Use @@map to preserve table name or run explicit RENAME migration",
      };
    case "index_removed":
      return {
        severity: "warning",
        code: "INDEX_DROP",
        message: c.message,
        suggestion: "Verify query performance before dropping index in production",
      };
    case "optional_changed":
      if (c.breaking) {
        return {
          severity: "error",
          code: "TYPE_CHANGE",
          message: c.message,
          suggestion: "Backfill NULL values before making field required",
        };
      }
      return null;
    case "list_changed":
      return {
        severity: "error",
        code: "TYPE_CHANGE",
        message: c.message,
        suggestion: "Cardinality changes require data migration",
      };
    default:
      return null;
  }
}

export function assessMigrationSafety(report: SchemaDiffReport): MigrationSafetyResult {
  const issues: MigrationSafetyIssue[] = [];

  if (!report.hasChanges) {
    return { ok: true, blocked: false, issues: [], errors: [], warnings: [] };
  }

  for (const c of report.modelDiff.changes) {
    const issue = issueFromFieldChange(c);
    if (issue) issues.push(issue);
  }

  for (const r of report.relationChanges) {
    if (r.breaking) {
      issues.push({
        severity: "error",
        code: "RELATION_CHANGE",
        message: r.message,
        suggestion: "Update both sides of relation and verify onDelete/onUpdate behavior",
      });
    } else if (r.kind === "relation_added") {
      issues.push({
        severity: "warning",
        code: "RELATION_CHANGE",
        message: r.message,
        suggestion: "Ensure foreign key constraints are created in migration SQL",
      });
    }
  }

  if (report.modelDiff.addedModels.length > 5) {
    issues.push({
      severity: "warning",
      code: "LARGE_EXPANSION",
      message: `Large schema expansion: ${report.modelDiff.addedModels.length} new models`,
      suggestion: "Split into smaller deployable migrations",
    });
  }

  const errors = issues.filter((i) => i.severity === "error").map((i) => i.message);
  const warnings = issues.filter((i) => i.severity === "warning").map((i) => i.message);

  const strict = process.env.PRISMA_MIGRATION_STRICT !== "0";
  const blocked = strict && errors.length > 0;

  return {
    ok: errors.length === 0,
    blocked,
    issues,
    errors,
    warnings,
  };
}

export function blockUnsafeMigration(safety: MigrationSafetyResult): void {
  if (safety.blocked) {
    throw new Error(
      `Unsafe migration blocked:\n${safety.errors.map((e) => `  - ${e}`).join("\n")}`,
    );
  }
}
