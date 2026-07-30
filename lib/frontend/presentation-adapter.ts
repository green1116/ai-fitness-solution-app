/**
 * FE-4.2 — UI Adapter (PD-4.1 / PD-4.5).
 * Maps Screen Actions ↔ existing bindings and wire shapes for presentation.
 * Does not fetch, own Domain, or invent APIs / state taxonomy.
 */
import {
  ADAPTER_BINDINGS,
  SCREEN_READ_TARGETS,
  bindingRequiresHttp,
  getAdapterBinding,
  type AdapterBinding,
  type BindingKind,
} from "@/lib/frontend/adapter-bindings";
import {
  classifyAuthSignal,
  authClassUserMessage,
} from "@/lib/frontend/presentation-security";
import type { DataFlowKind } from "@/lib/frontend/interaction-wiring";
import type { PresentationRoutePath } from "@/lib/frontend/presentation-routes";
import {
  createIdleMetaState,
  setMetaEmpty,
  setMetaError,
  setMetaLoading,
  type PresentationDocumentItem,
  type PresentationMetaState,
  type PresentationProjectRow,
} from "@/lib/frontend/presentation-state";
import {
  CACHE_INVALIDATION_POLICY,
  DOC_CATEGORY_LABELS,
  type DocCategoryLabel,
  type ServerStateKey,
} from "@/lib/frontend/state-taxonomy";

/** PD-4.5 canonical pipeline stages (ownership labels). */
export const DATA_FLOW_PIPELINE = [
  "INT",
  "ACT",
  "COMMAND",
  "ADAPTER",
  "EXISTING_API",
  "RESPONSE",
  "OBJ_ST_SERVER",
  "SCREEN",
] as const;

export type DataFlowPipelineStage = (typeof DATA_FLOW_PIPELINE)[number];

export const PIPELINE_STAGE_OWNERS = {
  INT: "Component",
  ACT: "Screen",
  COMMAND: "PD-2.3",
  ADAPTER: "Frontend delivery",
  EXISTING_API: "Backend contract",
  RESPONSE: "UI Adapter mapping",
  OBJ_ST_SERVER: "UI Adapter → presentation",
  SCREEN: "Screen",
} as const;

export type TransportDescriptor =
  | Readonly<{ mode: "none"; reason: "NAV" | "PREF" | "shell-nav" }>
  | Readonly<{
      mode: "existing-api";
      routeRef: string;
      kind: BindingKind;
      /** Ephemeral request view — not Domain storage. */
      requestView: Readonly<Record<string, string>>;
    }>;

export type AdapterFlowPlan = Readonly<{
  flow: "read" | "command" | "nav" | "pref";
  actionId: string | null;
  command: string | null;
  binding: AdapterBinding | null;
  requiresHttp: boolean;
  transport: TransportDescriptor;
  navigateTo: PresentationRoutePath | null;
  serverKey: ServerStateKey | null;
  invalidationTargets: readonly string[];
  pipeline: typeof DATA_FLOW_PIPELINE;
}>;

export type AdapterSettleResult = Readonly<{
  meta: PresentationMetaState;
  serverSlice: ServerStateKey | null;
  navigateTo: PresentationRoutePath | null;
  wroteServer: boolean;
}>;

/**
 * FE-3 DataFlowKind → whether Adapter expects a PD-2.4 binding row.
 */
export function flowKindNeedsBinding(flowKind: DataFlowKind): boolean {
  return flowKind !== "NAV" && flowKind !== "PREF";
}

export function resolveInvalidationTargets(
  invalidationClass: AdapterBinding["invalidationClass"],
): readonly string[] {
  const row = CACHE_INVALIDATION_POLICY.find(
    (p) => p.commandClass === invalidationClass,
  );
  return row?.invalidate ?? [];
}

/**
 * Plan Command / NAV / PREF after Screen Action (P-01: never skip ACT).
 */
export function planCommandFlow(input: {
  actionId: string;
  localDraft?: Readonly<Record<string, string | undefined>>;
}): AdapterFlowPlan {
  const binding = getAdapterBinding(input.actionId);
  if (!binding) {
    throw new Error(`Unknown action for adapter: ${input.actionId}`);
  }

  if (binding.kind === "NAV") {
    return {
      flow: "nav",
      actionId: binding.actionId,
      command: binding.command,
      binding,
      requiresHttp: false,
      transport: { mode: "none", reason: "NAV" },
      navigateTo: binding.navigateTo,
      serverKey: null,
      invalidationTargets: resolveInvalidationTargets(binding.invalidationClass),
      pipeline: DATA_FLOW_PIPELINE,
    };
  }

  if (binding.kind === "PREF") {
    return {
      flow: "pref",
      actionId: binding.actionId,
      command: binding.command,
      binding,
      requiresHttp: false,
      transport: { mode: "none", reason: "PREF" },
      navigateTo: null,
      serverKey: null,
      invalidationTargets: resolveInvalidationTargets(binding.invalidationClass),
      pipeline: DATA_FLOW_PIPELINE,
    };
  }

  const requestView = buildRequestView(binding.actionId, input.localDraft);
  return {
    flow: "command",
    actionId: binding.actionId,
    command: binding.command,
    binding,
    requiresHttp: true,
    transport: {
      mode: "existing-api",
      routeRef: binding.existingApi!,
      kind: binding.kind,
      requestView,
    },
    navigateTo: binding.kind === "API+NAV" ? binding.navigateTo : null,
    serverKey: binding.serverKey,
    invalidationTargets: resolveInvalidationTargets(binding.invalidationClass),
    pipeline: DATA_FLOW_PIPELINE,
  };
}

/**
 * Plan Screen read (PD-4.5 §4) — descriptor only; no transport execution.
 */
export function planReadFlow(input: {
  screenId: string;
  projectCue?: string;
}): AdapterFlowPlan {
  const target = SCREEN_READ_TARGETS.find((t) => t.screenId === input.screenId);
  if (!target) {
    throw new Error(`Unknown screen read target: ${input.screenId}`);
  }

  const primaryKey = target.readKeys[0] ?? null;
  const readBinding = ADAPTER_BINDINGS.find(
    (b) =>
      b.serverKey === primaryKey &&
      bindingRequiresHttp(b.kind) &&
      (b.kind === "API" || b.kind === "API+NAV" || b.kind === "NEAREST"),
  );

  const routeRef = readBinding?.existingApi ?? null;
  const requestView: Record<string, string> = {};
  if (input.projectCue?.trim()) {
    requestView.projectId = input.projectCue.trim();
  }

  return {
    flow: "read",
    actionId: readBinding?.actionId ?? null,
    command: readBinding?.command ?? null,
    binding: readBinding ?? null,
    requiresHttp: Boolean(routeRef),
    transport: routeRef
      ? {
          mode: "existing-api",
          routeRef,
          kind: readBinding?.kind ?? "API",
          requestView,
        }
      : { mode: "none", reason: "shell-nav" },
    navigateTo: null,
    serverKey: primaryKey,
    invalidationTargets: [],
    pipeline: DATA_FLOW_PIPELINE,
  };
}

/**
 * INT → ACT handoff into Adapter planning (components never call this alone).
 */
export function handoffScreenActionToAdapter(input: {
  actionId: string | null;
  flowKind: DataFlowKind;
  localDraft?: Readonly<Record<string, string | undefined>>;
}): AdapterFlowPlan | null {
  if (!input.actionId) {
    if (input.flowKind === "NAV" || input.flowKind === "PREF") {
      return {
        flow: input.flowKind === "PREF" ? "pref" : "nav",
        actionId: null,
        command: null,
        binding: null,
        requiresHttp: false,
        transport: {
          mode: "none",
          reason: input.flowKind === "PREF" ? "PREF" : "shell-nav",
        },
        navigateTo: null,
        serverKey: null,
        invalidationTargets: [],
        pipeline: DATA_FLOW_PIPELINE,
      };
    }
    return null;
  }
  return planCommandFlow({
    actionId: input.actionId,
    localDraft: input.localDraft,
  });
}

/** L-01 / command start — ST-META only. */
export function beginAdapterMeta(
  meta: PresentationMetaState = createIdleMetaState(),
): PresentationMetaState {
  return setMetaLoading(meta, "loading");
}

/** Successful map path — optionally empty. */
export function settleAdapterSuccess(input: {
  meta?: PresentationMetaState;
  empty?: boolean;
  emptyGuidanceRoute?: PresentationMetaState["emptyGuidanceRoute"];
  serverKey?: ServerStateKey | null;
  navigateTo?: PresentationRoutePath | null;
}): AdapterSettleResult {
  let meta = setMetaLoading(input.meta ?? createIdleMetaState(), "success");
  meta = { ...meta, error: null };
  meta = input.empty
    ? setMetaEmpty(meta, true, input.emptyGuidanceRoute)
    : setMetaEmpty(meta, false);
  return {
    meta,
    serverSlice: input.serverKey ?? null,
    navigateTo: input.navigateTo ?? null,
    wroteServer: !input.empty && Boolean(input.serverKey),
  };
}

/** E-01…E-04 / PD-4.6 — failure updates META only; no fake Objects (P-04). */
export function settleAdapterFailure(input: {
  meta?: PresentationMetaState;
  message?: string;
  code?: string;
  status?: number;
}): AdapterSettleResult {
  const authClass = classifyAuthSignal({
    code: input.code,
    status: input.status,
  });
  const message =
    input.message?.trim() ||
    mapErrorCodeToMessage(input.code) ||
    authClassUserMessage(authClass) ||
    "Unavailable";
  return {
    meta: setMetaError(input.meta ?? createIdleMetaState(), message),
    serverSlice: null,
    navigateTo: null,
    wroteServer: false,
  };
}

/**
 * T-03 — send only presentation draft fields needed by binding.
 * No business payloads invented.
 */
export function buildRequestView(
  actionId: string,
  localDraft?: Readonly<Record<string, string | undefined>>,
): Readonly<Record<string, string>> {
  const draft = localDraft ?? {};
  const out: Record<string, string> = {};
  const allow = allowedDraftKeys(actionId);
  for (const key of allow) {
    const value = draft[key]?.trim();
    if (value) out[key] = value;
  }
  return out;
}

function allowedDraftKeys(actionId: string): readonly string[] {
  switch (actionId) {
    case "ACT-02-02":
      return ["goalCue", "scopeText", "returnTo"];
    case "ACT-03-01":
      return ["fileName", "projectId"];
    case "ACT-04-05":
      return ["opportunityNote", "projectId"];
    case "ACT-07-02":
    case "ACT-07-03":
    case "ACT-04-02":
    case "ACT-04-08":
      return ["projectId"];
    case "ACT-08-02":
    case "ACT-08-03":
    case "ACT-08-04":
    case "ACT-05-03":
    case "ACT-05-04":
      return ["artifactId", "projectId"];
    case "ACT-01-02":
      return ["language"];
    default:
      return ["projectId"];
  }
}

/** Known presentation error copy — no stack traces (E-01). */
export function mapErrorCodeToMessage(code?: string | null): string {
  switch ((code ?? "").trim().toUpperCase()) {
    case "UNAUTHORIZED":
    case "401":
      return "Sign in required";
    case "FORBIDDEN":
    case "403":
      return "Access unavailable";
    case "NOT_FOUND":
    case "404":
      return "Nothing to show";
    case "NETWORK":
      return "Connection unavailable";
    default:
      return code?.trim() ? "Unavailable" : "";
  }
}

/**
 * Response → presentation Objects (field pick / rename only).
 */
export function mapProjectListResponse(
  wire: unknown,
): PresentationProjectRow[] {
  if (!Array.isArray(wire)) return [];
  const rows: PresentationProjectRow[] = [];
  for (const item of wire) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const id = asString(rec.id ?? rec.projectId);
    if (!id) continue;
    rows.push({
      id,
      name: asString(rec.name ?? rec.label) || id,
      status: asString(rec.status) || "Unknown",
      createdDate: asString(rec.createdDate ?? rec.createdAt) || "",
    });
  }
  return rows;
}

export function mapDocumentListResponse(
  wire: unknown,
): PresentationDocumentItem[] {
  if (!Array.isArray(wire)) return [];
  const items: PresentationDocumentItem[] = [];
  for (const item of wire) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const id = asString(rec.id ?? rec.documentId ?? rec.artifactId);
    if (!id) continue;
    const category = normalizeCategory(rec.category);
    if (!category) continue;
    items.push({
      id,
      label: asString(rec.label ?? rec.name) || id,
      category,
    });
  }
  return items;
}

export function mapStatusProcessResponse(wire: unknown): Readonly<{
  statusLabel: string;
  detail: string;
}> {
  if (!wire || typeof wire !== "object") {
    return { statusLabel: "Unknown", detail: "" };
  }
  const rec = wire as Record<string, unknown>;
  return {
    statusLabel: asString(rec.status ?? rec.state) || "Unknown",
    detail: asString(rec.message ?? rec.detail),
  };
}

export function mapArtifactAffordanceResponse(wire: unknown): Readonly<{
  artifactId: string;
  canDownload: boolean;
  canShare: boolean;
  hrefCue: string;
}> {
  if (!wire || typeof wire !== "object") {
    return {
      artifactId: "",
      canDownload: false,
      canShare: false,
      hrefCue: "",
    };
  }
  const rec = wire as Record<string, unknown>;
  const artifactId = asString(rec.artifactId ?? rec.id);
  const hrefCue = asString(rec.href ?? rec.url ?? rec.downloadUrl);
  return {
    artifactId,
    canDownload: Boolean(artifactId || hrefCue),
    canShare: Boolean(asString(rec.shareToken) || hrefCue),
    hrefCue,
  };
}

export function mapOpsAreaResponse(wire: unknown): Readonly<{
  areaId: string;
  title: string;
  summary: string;
}> {
  if (!wire || typeof wire !== "object") {
    return { areaId: "", title: "", summary: "" };
  }
  const rec = wire as Record<string, unknown>;
  return {
    areaId: asString(rec.area ?? rec.id),
    title: asString(rec.title ?? rec.name),
    summary: asString(rec.summary ?? rec.message),
  };
}

/**
 * After Adapter mapping, Screen may run ST-DERIVED (T-02) — Adapter does not.
 * This helper only signals that derived is a separate presentation step.
 */
export function adapterLeavesDerivedToPresentation(): true {
  return true;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeCategory(value: unknown): DocCategoryLabel | "" {
  const raw = asString(value).toLowerCase();
  if ((DOC_CATEGORY_LABELS as readonly string[]).includes(raw)) {
    return raw as DocCategoryLabel;
  }
  return "";
}
