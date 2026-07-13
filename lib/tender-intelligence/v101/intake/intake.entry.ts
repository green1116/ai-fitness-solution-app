/**
 * E01-P1 — Tender Intake Kernel entry
 */

export {
  assertTenderIntakeKernelPass,
  advanceTenderIntakeRecord,
  buildTenderIntakeKernel,
  buildTenderIntakeLifecycle,
  buildTenderIntakeRecord,
  buildTenderSource,
  buildTenderWorkspace,
} from "./intake.builder";

export {
  canAdvanceIntakeStatus,
  isTerminalIntakeStatus,
  parseTenderSourceKind,
  TENDER_INTAKE_LIFECYCLE_STAGES,
  TENDER_INTAKE_STATUSES,
  TENDER_SOURCE_KINDS,
  TENDER_WORKSPACE_STATUSES,
  validateTenderSourceInput,
  assertValidSource,
} from "./intake.schema";

export type { SchemaIssue, SchemaResult } from "./intake.schema";

export {
  V101_TENDER_INTAKE_FREEZE_VERSION,
  V101_TENDER_INTAKE_VERSION,
} from "./intake.types";

export type {
  TenderIntakeKernelInput,
  TenderIntakeKernelResult,
  TenderIntakeLifecycle,
  TenderIntakeLifecycleStage,
  TenderIntakeLifecycleTransition,
  TenderIntakeRecord,
  TenderIntakeStatus,
  TenderSource,
  TenderSourceKind,
  TenderWorkspace,
  TenderWorkspaceStatus,
} from "./intake.types";

import { assertTenderIntakeKernelPass, buildTenderIntakeKernel } from "./intake.builder";
import type { TenderIntakeKernelInput, TenderIntakeKernelResult } from "./intake.types";

export function runTenderIntakeKernel(
  input: TenderIntakeKernelInput,
): TenderIntakeKernelResult {
  return buildTenderIntakeKernel(input);
}

export function runTenderIntakeKernelOrThrow(
  input: TenderIntakeKernelInput,
): TenderIntakeKernelResult & { ready: true; workspace: NonNullable<TenderIntakeKernelResult["workspace"]> } {
  const result = buildTenderIntakeKernel(input);
  assertTenderIntakeKernelPass(result);
  return result;
}

export function formatTenderIntakeKernelSummary(result: TenderIntakeKernelResult): string {
  const lines = [
    "V101 Tender Intake Kernel",
    `  ready: ${result.ready}`,
    `  score: ${result.readinessScore}/100`,
    `  version: ${result.version}`,
    `  freeze: ${result.freezeVersion}`,
    `  source: ${result.source.kind} (${result.source.id})`,
    `  intake: ${result.intake.status} (${result.intake.id})`,
    `  workspace: ${result.workspace ? `${result.workspace.status} · ${result.workspace.title}` : "none"}`,
    `  lifecycle: ${result.lifecycle.current} complete=${result.lifecycle.complete}`,
    `  transitions: ${result.lifecycle.transitions.length}`,
  ];
  return lines.join("\n");
}
