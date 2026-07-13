/**
 * E01-P1 — Tender Intake Kernel builder
 * Builds TenderSource → TenderIntakeRecord → TenderWorkspace lifecycle
 */

import { createHash, randomUUID } from "node:crypto";

import {
  assertValidSource,
  canAdvanceIntakeStatus,
  TENDER_INTAKE_LIFECYCLE_STAGES,
  validateTenderSourceInput,
} from "./intake.schema";
import type {
  TenderIntakeKernelInput,
  TenderIntakeKernelResult,
  TenderIntakeLifecycle,
  TenderIntakeLifecycleStage,
  TenderIntakeLifecycleTransition,
  TenderIntakeRecord,
  TenderIntakeStatus,
  TenderSource,
  TenderWorkspace,
} from "./intake.types";
import {
  V101_TENDER_INTAKE_FREEZE_VERSION,
  V101_TENDER_INTAKE_VERSION,
} from "./intake.types";

function nowIso(): string {
  return new Date().toISOString();
}

function stableId(prefix: string, seed: string): string {
  const hash = createHash("sha1").update(seed).digest("hex").slice(0, 12);
  return `${prefix}_${hash}`;
}

function contentHash(input: {
  rawText?: string;
  uri?: string;
  fileName?: string;
}): string | undefined {
  const payload = input.rawText ?? input.uri ?? input.fileName;
  if (!payload) return undefined;
  return createHash("sha256").update(payload).digest("hex").slice(0, 24);
}

function deriveTitle(source: TenderSource, projectHint?: string): string {
  if (projectHint?.trim()) return projectHint.trim();
  if (source.fileName?.trim()) {
    return source.fileName.replace(/\.[^.]+$/, "").trim() || source.fileName.trim();
  }
  if (source.rawText?.trim()) {
    const firstLine = source.rawText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .find((l) => l.length > 0);
    if (firstLine) return firstLine.slice(0, 80);
  }
  if (source.uri?.trim()) return source.uri.trim().slice(0, 80);
  return `tender-${source.id.slice(0, 8)}`;
}

export function buildTenderSource(
  input: TenderIntakeKernelInput["source"],
): TenderSource {
  const validated = validateTenderSourceInput(input);
  if (!validated.ok) {
    throw new Error(
      `Invalid TenderSource input: ${validated.issues.map((i) => `${i.path}: ${i.message}`).join("; ")}`,
    );
  }

  const receivedAt = input.receivedAt ?? nowIso();
  const id =
    input.id?.trim() ||
    stableId(
      "src",
      [
        validated.value.kind,
        validated.value.fileName ?? "",
        validated.value.uri ?? "",
        validated.value.rawText?.slice(0, 64) ?? "",
        receivedAt,
      ].join("|"),
    );

  const source: TenderSource = {
    id,
    kind: validated.value.kind,
    fileName: validated.value.fileName,
    mimeType: validated.value.mimeType,
    rawText: validated.value.rawText,
    uri: validated.value.uri,
    byteLength: validated.value.byteLength,
    contentHash: contentHash(validated.value),
    receivedAt,
    metadata: input.metadata,
    readOnly: true,
  };

  assertValidSource(source);
  return source;
}

export function buildTenderIntakeRecord(input: {
  source: TenderSource;
  projectHint?: string;
  organizationHint?: string;
  status?: TenderIntakeStatus;
  errors?: string[];
}): TenderIntakeRecord {
  assertValidSource(input.source);
  const createdAt = nowIso();
  const status = input.status ?? "received";

  return {
    id: stableId("intake", `${input.source.id}|${createdAt}`),
    sourceId: input.source.id,
    status,
    projectHint: input.projectHint?.trim() || undefined,
    organizationHint: input.organizationHint?.trim() || undefined,
    normalizedTitle:
      status === "normalized" || status === "workspace_ready"
        ? deriveTitle(input.source, input.projectHint)
        : undefined,
    errors: [...(input.errors ?? [])],
    createdAt,
    updatedAt: createdAt,
    readOnly: true,
  };
}

export function advanceTenderIntakeRecord(
  record: TenderIntakeRecord,
  to: TenderIntakeStatus,
  source: TenderSource,
  extra?: { errors?: string[] },
): TenderIntakeRecord {
  if (!canAdvanceIntakeStatus(record.status, to)) {
    throw new Error(`Cannot advance intake status from ${record.status} to ${to}`);
  }

  const updatedAt = nowIso();
  const errors = extra?.errors ?? (to === "failed" ? ["intake failed"] : []);

  return {
    ...record,
    status: to,
    normalizedTitle:
      to === "normalized" || to === "workspace_ready"
        ? deriveTitle(source, record.projectHint)
        : record.normalizedTitle,
    errors: [...errors],
    updatedAt,
    readOnly: true,
  };
}

export function buildTenderWorkspace(input: {
  intake: TenderIntakeRecord;
  source: TenderSource;
}): TenderWorkspace {
  if (input.intake.status !== "workspace_ready") {
    throw new Error("Workspace requires intake status workspace_ready");
  }
  if (input.intake.sourceId !== input.source.id) {
    throw new Error("Workspace sourceId must match intake.sourceId");
  }

  const createdAt = nowIso();
  const title = input.intake.normalizedTitle ?? deriveTitle(input.source, input.intake.projectHint);

  return {
    id: stableId("ws", `${input.intake.id}|${input.source.id}`),
    intakeId: input.intake.id,
    sourceId: input.source.id,
    status: "draft",
    title,
    createdAt,
    updatedAt: createdAt,
    readOnly: true,
  };
}

function pushTransition(
  transitions: TenderIntakeLifecycleTransition[],
  from: TenderIntakeLifecycleStage,
  to: TenderIntakeLifecycleStage,
  note?: string,
): void {
  transitions.push({
    from,
    to,
    at: nowIso(),
    note,
    readOnly: true,
  });
}

export function buildTenderIntakeLifecycle(input: {
  intake: TenderIntakeRecord;
  workspace: TenderWorkspace | null;
}): TenderIntakeLifecycle {
  const transitions: TenderIntakeLifecycleTransition[] = [];
  let current: TenderIntakeLifecycleStage = "source";

  if (input.intake.status !== "received") {
    pushTransition(transitions, "source", "intake", `intake=${input.intake.status}`);
    current = "intake";
  }

  if (input.workspace) {
    pushTransition(transitions, "intake", "workspace", `workspace=${input.workspace.id}`);
    current = "workspace";
  }

  const complete =
    input.intake.status === "workspace_ready" && input.workspace !== null && current === "workspace";

  return {
    current,
    stages: [...TENDER_INTAKE_LIFECYCLE_STAGES],
    transitions,
    complete,
    readOnly: true,
  };
}

export function buildTenderIntakeKernel(
  input: TenderIntakeKernelInput,
): TenderIntakeKernelResult {
  const deploymentId = input.deploymentId?.trim() || "v101-p1-tender-intake-default";
  const generatedAt = nowIso();

  const source = buildTenderSource(input.source);

  let intake = buildTenderIntakeRecord({
    source,
    projectHint: input.projectHint,
    organizationHint: input.organizationHint,
    status: "received",
  });

  intake = advanceTenderIntakeRecord(intake, "validated", source);
  intake = advanceTenderIntakeRecord(intake, "normalized", source);
  intake = advanceTenderIntakeRecord(intake, "workspace_ready", source);

  const workspace = buildTenderWorkspace({ intake, source });
  const lifecycle = buildTenderIntakeLifecycle({ intake, workspace });

  const ready = lifecycle.complete && intake.status === "workspace_ready" && workspace !== null;

  return {
    version: V101_TENDER_INTAKE_VERSION,
    freezeVersion: V101_TENDER_INTAKE_FREEZE_VERSION,
    reportId: `tender-intake-${deploymentId}-${randomUUID().slice(0, 8)}`,
    deploymentId,
    generatedAt,
    source,
    intake,
    workspace,
    lifecycle,
    ready,
    readinessScore: ready ? 100 : 0,
    summary: [
      `tender-intake ready=${ready}`,
      `source=${source.kind}`,
      `intake=${intake.status}`,
      `workspace=${workspace?.status ?? "none"}`,
      `lifecycle=${lifecycle.current}`,
      `freeze=${V101_TENDER_INTAKE_FREEZE_VERSION}`,
    ].join(" "),
  };
}

export function assertTenderIntakeKernelPass(
  result: TenderIntakeKernelResult,
): asserts result is TenderIntakeKernelResult & {
  ready: true;
  workspace: TenderWorkspace;
} {
  if (!result.ready || !result.workspace) {
    throw new Error(`V101 tender intake kernel not ready: ${result.summary}`);
  }
}
