import type { RuntimeCorrelationResult } from "../types";

export function formatRuntimeCorrelationDebug(
  result: RuntimeCorrelationResult,
): {
  summary: string;
  dependencyGraph: string;
  criticalPaths: string;
} {
  const summary = [
    "[RuntimeCorrelationIntelligence]",
    `Edges: ${result.edges.length}`,
    `Affected Runtimes: ${result.affectedRuntimeCount}`,
    `Critical Paths: ${result.criticalPaths.length}`,
    `Warnings: ${result.correlationWarnings.length}`,
  ].join("\n");

  const dependencyGraph = [
    "Dependency Graph (deterministic):",
    ...result.edges.map(
      (e) => `  ${e.source} → ${e.target} [${e.impact}] ${e.reason}`,
    ),
  ].join("\n");

  const criticalPaths = [
    "Critical Paths:",
    ...(result.criticalPaths.length
      ? result.criticalPaths.map((p) => `  ${p}`)
      : ["  (none)"]),
  ].join("\n");

  return { summary, dependencyGraph, criticalPaths };
}
