/**
 * FE-4.1 presentation state helpers (PD-4.3).
 * Pure cues / meta / derived — no Domain, API, or persistence ownership.
 */
import {
  DOC_CATEGORY_LABELS,
  type DocCategoryLabel,
  type GoalCueId,
  type MetaLoadingValue,
} from "@/lib/frontend/state-taxonomy";
import type { DocumentCategoryId } from "@/lib/frontend/navigation";
import type { SessionObservation } from "@/lib/frontend/presentation-guards";

export type SharedPresentationState = Readonly<{
  projectCue: string;
  goalCue: GoalCueId | "";
  returnTo: string;
  libraryCategory: DocCategoryLabel | "";
  breakpointClass: string;
}>;

export type NavigationContextState = Readonly<{
  route: string;
  projectId: string;
  documentId: string;
  docCategory: DocCategoryLabel | "";
  adminArea: string;
}>;

export type PresentationMetaState = Readonly<{
  loading: MetaLoadingValue;
  error: string | null;
  empty: boolean;
  emptyGuidanceRoute?: "/" | "/projects" | "/workspace";
}>;

export type SessionPresentationState = Readonly<{
  signedIn: boolean;
  displayName: string | null;
  opsCapable: boolean;
}>;

export function createEmptySharedState(): SharedPresentationState {
  return {
    projectCue: "",
    goalCue: "",
    returnTo: "",
    libraryCategory: "",
    breakpointClass: "",
  };
}

export function createIdleMetaState(): PresentationMetaState {
  return {
    loading: "idle",
    error: null,
    empty: false,
  };
}

/**
 * CX-01 — route params win on Screen entry; then sync SHR-*.
 */
export function applyRouteContextToShared(
  shared: SharedPresentationState,
  context: Pick<
    NavigationContextState,
    "projectId" | "docCategory"
  >,
): SharedPresentationState {
  const projectId = context.projectId.trim();
  const category = normalizeDocCategory(context.docCategory);
  return {
    ...shared,
    projectCue: projectId || shared.projectCue,
    libraryCategory: category || shared.libraryCategory,
  };
}

export function readNavigationContext(input: {
  pathname: string;
  projectId?: string | null;
  documentId?: string | null;
  category?: string | null;
  area?: string | null;
}): NavigationContextState {
  return {
    route: input.pathname || "/",
    projectId: input.projectId?.trim() ?? "",
    documentId: input.documentId?.trim() ?? "",
    docCategory: normalizeDocCategory(input.category),
    adminArea: input.area?.trim().toLowerCase() ?? "",
  };
}

export function mapSessionObservation(
  observation: SessionObservation,
  displayName: string | null = null,
): SessionPresentationState {
  return {
    signedIn: observation.presentedSession,
    displayName,
    opsCapable: observation.presentedOpsCapability,
  };
}

export function setMetaLoading(
  meta: PresentationMetaState,
  loading: MetaLoadingValue,
): PresentationMetaState {
  return {
    ...meta,
    loading,
    error: loading === "loading" ? null : meta.error,
  };
}

export function setMetaError(
  meta: PresentationMetaState,
  message: string,
): PresentationMetaState {
  return {
    ...meta,
    loading: "idle",
    error: message,
  };
}

export function setMetaEmpty(
  meta: PresentationMetaState,
  empty: boolean,
  emptyGuidanceRoute?: PresentationMetaState["emptyGuidanceRoute"],
): PresentationMetaState {
  return {
    ...meta,
    empty,
    emptyGuidanceRoute: empty ? emptyGuidanceRoute : undefined,
  };
}

/** Opaque cache key builder — C-02 ids only. */
export function buildServerCacheKey(
  slice: string,
  projectId?: string | null,
): string {
  const cue = projectId?.trim();
  return cue ? `${slice}:project:${cue}` : `${slice}:global`;
}

export type PresentationProjectRow = Readonly<{
  id: string;
  name: string;
  status: string;
  createdDate: string;
}>;

export type PresentationDocumentItem = Readonly<{
  id: string;
  label: string;
  category: DocCategoryLabel;
}>;

/**
 * DER-PROJECT-LIST-VIEW — sort by created date display only (Y-01…Y-03).
 */
export function deriveProjectListView(
  rows: readonly PresentationProjectRow[],
): PresentationProjectRow[] {
  return [...rows].sort((a, b) =>
    a.createdDate < b.createdDate ? 1 : a.createdDate > b.createdDate ? -1 : 0,
  );
}

/**
 * DER-DOC-BY-CATEGORY — filter to one of four MVP categories.
 */
export function deriveDocumentsByCategory(
  items: readonly PresentationDocumentItem[],
  category: DocCategoryLabel | DocumentCategoryId | "",
): PresentationDocumentItem[] {
  const normalized = normalizeDocCategory(category);
  if (!normalized) return [...items];
  return items.filter((item) => item.category === normalized);
}

/**
 * DER-SHELL-CONTEXT-LABEL — opaque cue label only.
 */
export function deriveShellContextLabel(input: {
  projectCue?: string | null;
  projectName?: string | null;
}): string {
  const name = input.projectName?.trim();
  if (name) return name;
  const cue = input.projectCue?.trim();
  return cue || "Project context";
}

/**
 * DER-FORWARD-ENABLED — UI readiness flag only (not Domain validation).
 */
export function deriveForwardEnabled(input: {
  meta: PresentationMetaState;
  hasRequiredLocalDraft?: boolean;
  hasServerSlice?: boolean;
}): boolean {
  if (input.meta.loading === "loading") return false;
  if (input.meta.error) return false;
  if (input.hasRequiredLocalDraft === false) return false;
  if (input.hasServerSlice === false) return false;
  return true;
}

/**
 * DER-GP-STEP — orientation from route only.
 */
export function deriveGoldenPathStep(pathname: string): string {
  const path =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname || "/";
  switch (path) {
    case "/":
      return "GP-ENTRY";
    case "/builder":
    case "/tender":
      return "GP-INTAKE";
    case "/workspace":
      return "GP-WORKSPACE";
    case "/solution":
    case "/budget":
      return "GP-RESULT";
    case "/projects":
    case "/documents":
      return "GP-LIBRARY";
    case "/admin":
      return "GP-OPS";
    default:
      return "GP-OTHER";
  }
}

export function normalizeDocCategory(
  value?: string | null,
): DocCategoryLabel | "" {
  const raw = value?.trim().toLowerCase() ?? "";
  if ((DOC_CATEGORY_LABELS as readonly string[]).includes(raw)) {
    return raw as DocCategoryLabel;
  }
  return "";
}

export function resolveProjectCue(input: {
  routeProjectId?: string | null;
  sharedProjectCue?: string | null;
}): string {
  const route = input.routeProjectId?.trim() ?? "";
  if (route) return route;
  return input.sharedProjectCue?.trim() ?? "";
}
