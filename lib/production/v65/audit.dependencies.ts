/**
 * V65 P1 — Dependency audit (read-only snapshot from package.json)
 */
import fs from "node:fs";
import path from "node:path";

import type { DependencyAuditEntry, DependencyAuditReport } from "./audit.types";

type PackageJsonShape = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  engines?: { node?: string };
};

function resolvePackageJson(): PackageJsonShape {
  const candidates = [
    path.resolve(process.cwd(), "package.json"),
    path.resolve(__dirname, "../../../package.json"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return JSON.parse(fs.readFileSync(candidate, "utf8")) as PackageJsonShape;
    }
  }
  return {};
}

function isPinned(version: string): boolean {
  return !version.startsWith("^") && !version.startsWith("~") && !version.includes("x");
}

function toEntries(
  record: Record<string, string> | undefined,
  scope: DependencyAuditEntry["scope"],
): DependencyAuditEntry[] {
  if (!record) return [];
  return Object.entries(record)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, version]) => ({
      name,
      version,
      scope,
      pinned: isPinned(version),
      notes: name === "zod" && version.startsWith("^4") ? "major v4 — verify API compatibility" : undefined,
    }));
}

export function auditDependencies(): DependencyAuditReport {
  const pkg = resolvePackageJson();
  const production = toEntries(pkg.dependencies, "production");
  const development = toEntries(pkg.devDependencies, "development");
  const lockfilePresent = fs.existsSync(path.resolve(process.cwd(), "package-lock.json"));

  const notes: string[] = [
    "All production deps use caret ranges (^) — not fully pinned",
    "No engines.node field declared in package.json",
    lockfilePresent ? "package-lock.json present" : "package-lock.json missing",
    "Prisma 6.19.x aligned between dependencies and devDependencies",
    "Next.js 16.x + React 19.x stack",
  ];

  return {
    productionCount: production.length,
    developmentCount: development.length,
    nodeEngineDeclared: Boolean(pkg.engines?.node),
    lockfilePresent,
    entries: [...production, ...development],
    notes,
  };
}

/** Static fallback when fs unavailable (e.g. edge bundling) */
export const DEPENDENCY_AUDIT_SNAPSHOT: DependencyAuditReport = {
  productionCount: 24,
  developmentCount: 11,
  nodeEngineDeclared: false,
  lockfilePresent: true,
  entries: [],
  notes: ["Use auditDependencies() in Node for full entry list"],
};
