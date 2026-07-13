/**
 * E01-P2 — Tender Document Understanding entry
 */

export {
  assertUnderstandingKernelPass,
  buildDocumentStructure,
  buildRequirementIndex,
  buildUnderstandingKernel,
  buildUnderstandingLifecycle,
} from "./understanding.builder";

export {
  assertValidWorkspace,
  DOCUMENT_SECTION_KINDS,
  REQUIREMENT_CATEGORIES,
  REQUIREMENT_PRIORITIES,
  UNDERSTANDING_LIFECYCLE_STAGES,
  UNDERSTANDING_STATUSES,
  validateDocumentSection,
  validateDocumentStructure,
  validateRequirementIndex,
  validateRequirementIndexEntry,
  validateTenderWorkspaceInput,
} from "./understanding.schema";

export type { SchemaIssue, SchemaResult } from "./understanding.schema";

export {
  V101_TENDER_UNDERSTANDING_FREEZE_VERSION,
  V101_TENDER_UNDERSTANDING_VERSION,
} from "./understanding.types";

export type {
  DocumentSection,
  DocumentSectionKind,
  DocumentStructure,
  RequirementCategory,
  RequirementIndex,
  RequirementIndexEntry,
  RequirementPriority,
  UnderstandingKernelInput,
  UnderstandingKernelResult,
  UnderstandingLifecycle,
  UnderstandingLifecycleStage,
  UnderstandingLifecycleTransition,
  UnderstandingStatus,
} from "./understanding.types";

import {
  assertUnderstandingKernelPass,
  buildUnderstandingKernel,
} from "./understanding.builder";
import type {
  UnderstandingKernelInput,
  UnderstandingKernelResult,
} from "./understanding.types";

export function runUnderstandingKernel(
  input: UnderstandingKernelInput,
): UnderstandingKernelResult {
  return buildUnderstandingKernel(input);
}

export function runUnderstandingKernelOrThrow(
  input: UnderstandingKernelInput,
): UnderstandingKernelResult & {
  ready: true;
  structure: NonNullable<UnderstandingKernelResult["structure"]>;
  requirementIndex: NonNullable<UnderstandingKernelResult["requirementIndex"]>;
} {
  const result = buildUnderstandingKernel(input);
  assertUnderstandingKernelPass(result);
  return result;
}

export function formatUnderstandingKernelSummary(
  result: UnderstandingKernelResult,
): string {
  const lines = [
    "V101 Tender Document Understanding",
    `  ready: ${result.ready}`,
    `  score: ${result.readinessScore}/100`,
    `  version: ${result.version}`,
    `  freeze: ${result.freezeVersion}`,
    `  workspace: ${result.workspace.title} (${result.workspace.id})`,
    `  structure: ${result.structure ? `${result.structure.sectionCount} sections` : "none"}`,
    `  requirements: ${
      result.requirementIndex
        ? `${result.requirementIndex.entryCount} (must=${result.requirementIndex.mustCount})`
        : "none"
    }`,
    `  lifecycle: ${result.lifecycle.current} complete=${result.lifecycle.complete}`,
    `  transitions: ${result.lifecycle.transitions.length}`,
  ];
  return lines.join("\n");
}
