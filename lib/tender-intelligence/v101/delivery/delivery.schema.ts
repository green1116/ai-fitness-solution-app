/**
 * E01-P7 — Enterprise Delivery schema (pure TS validation)
 */

import type { AgentOrchestrationResult } from "../agent/agent.types";
import type {
  DeliveryArtifactKind,
  DeliveryChecklistStatus,
  DeliveryKernelInput,
  DeliveryLifecycleStage,
  DeliveryPackageStatus,
  EnterpriseDeliveryPackage,
} from "./delivery.types";

export const DELIVERY_LIFECYCLE_STAGES: readonly DeliveryLifecycleStage[] = [
  "orchestration",
  "package",
  "seal",
] as const;

export const DELIVERY_PACKAGE_STATUSES: readonly DeliveryPackageStatus[] = [
  "pending",
  "assembled",
  "sealed",
  "failed",
] as const;

export const DELIVERY_ARTIFACT_KINDS: readonly DeliveryArtifactKind[] = [
  "intake_report",
  "understanding_report",
  "intelligence_report",
  "strategy_report",
  "proposal_report",
  "workspace",
  "requirement_index",
  "opportunity",
  "strategy",
  "blueprint",
  "orchestration_report",
] as const;

export const DELIVERY_CHECKLIST_STATUSES: readonly DeliveryChecklistStatus[] = [
  "pass",
  "fail",
  "pending",
] as const;

export type SchemaIssue = {
  path: string;
  message: string;
};

export type SchemaResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: SchemaIssue[] };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function issue(path: string, message: string): SchemaIssue {
  return { path, message };
}

export function validateOrchestrationInput(
  orchestration: unknown,
): SchemaResult<AgentOrchestrationResult> {
  const issues: SchemaIssue[] = [];
  if (!orchestration || typeof orchestration !== "object") {
    return { ok: false, issues: [issue("orchestration", "orchestration is required")] };
  }

  const o = orchestration as Partial<AgentOrchestrationResult>;
  if (!isNonEmptyString(o.reportId)) {
    issues.push(issue("orchestration.reportId", "reportId is required"));
  }
  if (!isNonEmptyString(o.deploymentId)) {
    issues.push(issue("orchestration.deploymentId", "deploymentId is required"));
  }
  if (o.ready !== true) {
    issues.push(issue("orchestration.ready", "orchestration must be ready"));
  }
  if (!o.artifacts || typeof o.artifacts !== "object") {
    issues.push(issue("orchestration.artifacts", "artifacts are required"));
  } else {
    const a = o.artifacts;
    const requiredRefs: Array<keyof typeof a> = [
      "intakeReportId",
      "understandingReportId",
      "intelligenceReportId",
      "strategyReportId",
      "proposalReportId",
      "workspaceId",
      "requirementIndexId",
      "opportunityId",
      "strategyId",
      "blueprintId",
    ];
    for (const key of requiredRefs) {
      if (!isNonEmptyString(a[key])) {
        issues.push(issue(`orchestration.artifacts.${String(key)}`, `${String(key)} is required`));
      }
    }
  }
  if (!o.lifecycle || o.lifecycle.complete !== true) {
    issues.push(issue("orchestration.lifecycle", "lifecycle must be complete"));
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: orchestration as AgentOrchestrationResult };
}

export function validateDeliveryPackage(
  pkg: unknown,
): SchemaResult<EnterpriseDeliveryPackage> {
  const issues: SchemaIssue[] = [];
  if (!pkg || typeof pkg !== "object") {
    return { ok: false, issues: [issue("package", "package is required")] };
  }

  const p = pkg as Partial<EnterpriseDeliveryPackage>;
  if (!isNonEmptyString(p.id)) issues.push(issue("package.id", "id is required"));
  if (!isNonEmptyString(p.orchestrationReportId)) {
    issues.push(issue("package.orchestrationReportId", "orchestrationReportId is required"));
  }
  if (!isNonEmptyString(p.title)) issues.push(issue("package.title", "title is required"));
  if (!Array.isArray(p.items) || p.items.length < 1) {
    issues.push(issue("package.items", "items must be non-empty"));
  }
  if (!Array.isArray(p.checklist) || p.checklist.length < 1) {
    issues.push(issue("package.checklist", "checklist must be non-empty"));
  }
  if (typeof p.itemCount === "number" && Array.isArray(p.items) && p.itemCount !== p.items.length) {
    issues.push(issue("package.itemCount", "itemCount must match items.length"));
  }
  if (
    typeof p.checklistCount === "number" &&
    Array.isArray(p.checklist) &&
    p.checklistCount !== p.checklist.length
  ) {
    issues.push(issue("package.checklistCount", "checklistCount must match checklist.length"));
  }
  if (
    typeof p.status !== "string" ||
    !(DELIVERY_PACKAGE_STATUSES as readonly string[]).includes(p.status)
  ) {
    issues.push(
      issue("package.status", `status must be one of: ${DELIVERY_PACKAGE_STATUSES.join(", ")}`),
    );
  }
  if (p.readOnly !== true) issues.push(issue("package.readOnly", "readOnly must be true"));

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: pkg as EnterpriseDeliveryPackage };
}

export function validateDeliveryKernelInput(
  input: unknown,
): SchemaResult<DeliveryKernelInput> {
  const issues: SchemaIssue[] = [];
  if (!input || typeof input !== "object") {
    return { ok: false, issues: [issue("input", "input is required")] };
  }

  const i = input as Partial<DeliveryKernelInput>;
  const orch = validateOrchestrationInput(i.orchestration);
  if (!orch.ok) {
    issues.push(...orch.issues);
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, value: input as DeliveryKernelInput };
}

export function assertValidOrchestration(orchestration: AgentOrchestrationResult): void {
  const result = validateOrchestrationInput(orchestration);
  if (!result.ok) {
    throw new Error(
      `Invalid orchestration for delivery: ${result.issues
        .map((i) => `${i.path}: ${i.message}`)
        .join("; ")}`,
    );
  }
}
