import type { PresentationRoutePath } from "./presentation-routes";

export type ShellNavId =
  | "NAV-HOME"
  | "NAV-PROJECTS"
  | "NAV-DOCUMENTS"
  | "NAV-WORKSPACE"
  | "NAV-ADMIN";

export type GoalEntryId =
  | "GOAL-BUILDER"
  | "GOAL-TENDER"
  | "GOAL-SALES"
  | "GOAL-PROJECTS";

export type ContinuityEntryId =
  | "CONT-PROJECT-CONTINUE"
  | "CONT-PROJECT-DOCUMENTS";

export type OutcomeEntryId =
  | "OUT-SOLUTION"
  | "OUT-BUDGET"
  | "OUT-DOCUMENTS";

/**
 * PD-4.2 §10.1 — shell entry points.
 * INT-NAV-SHELL customer destinations exclude Admin.
 */
export const SHELL_NAV_ENTRIES = [
  { id: "NAV-HOME", label: "Home", href: "/", group: "customer" },
  { id: "NAV-PROJECTS", label: "My Projects", href: "/projects", group: "customer" },
  { id: "NAV-DOCUMENTS", label: "My Documents", href: "/documents", group: "customer" },
  { id: "NAV-WORKSPACE", label: "AI Workspace", href: "/workspace", group: "customer" },
  { id: "NAV-ADMIN", label: "Admin", href: "/admin", group: "ops" },
] as const satisfies readonly Readonly<{
  id: ShellNavId;
  label: string;
  href: PresentationRoutePath;
  group: "customer" | "ops";
}>[];

export const CUSTOMER_SHELL_NAV = SHELL_NAV_ENTRIES.filter(
  (entry) => entry.group === "customer",
);

export const OPS_SHELL_NAV = SHELL_NAV_ENTRIES.filter(
  (entry) => entry.group === "ops",
);

/**
 * PD-4.2 §10.2 — homepage goal entry points.
 */
export const GOAL_ENTRY_POINTS = [
  {
    id: "GOAL-BUILDER",
    label: "Enterprise Builder",
    actionId: "ACT-01-03",
    href: "/builder",
  },
  {
    id: "GOAL-TENDER",
    label: "Tender Intelligence",
    actionId: "ACT-01-04",
    href: "/tender",
  },
  {
    id: "GOAL-SALES",
    label: "Sales Center",
    actionId: "ACT-01-05",
    href: "/workspace",
  },
  {
    id: "GOAL-PROJECTS",
    label: "My Projects",
    actionId: "ACT-01-06",
    href: "/projects",
  },
] as const satisfies readonly Readonly<{
  id: GoalEntryId;
  label: string;
  actionId: "ACT-01-03" | "ACT-01-04" | "ACT-01-05" | "ACT-01-06";
  href: PresentationRoutePath;
}>[];

/**
 * PD-4.2 §10.3 — continuity entry points (presentation params only).
 */
export const CONTINUITY_ENTRY_POINTS = [
  {
    id: "CONT-PROJECT-CONTINUE",
    label: "Continue",
    actionId: "ACT-07-02",
    path: "/workspace",
    projectParam: true,
  },
  {
    id: "CONT-PROJECT-DOCUMENTS",
    label: "Documents",
    actionId: "ACT-07-03",
    path: "/documents",
    projectParam: true,
  },
] as const satisfies readonly Readonly<{
  id: ContinuityEntryId;
  label: string;
  actionId: "ACT-07-02" | "ACT-07-03";
  path: "/workspace" | "/documents";
  projectParam: true;
}>[];

/**
 * PD-4.2 §10.3 — workspace outcome entry points.
 */
export const OUTCOME_ENTRY_POINTS = [
  {
    id: "OUT-SOLUTION",
    label: "Solution Result",
    actionId: "ACT-04-06",
    href: "/solution",
  },
  {
    id: "OUT-BUDGET",
    label: "Budget Result",
    actionId: "ACT-04-07",
    href: "/budget",
  },
  {
    id: "OUT-DOCUMENTS",
    label: "My Documents",
    actionId: "ACT-04-08",
    href: "/documents",
  },
] as const satisfies readonly Readonly<{
  id: OutcomeEntryId;
  label: string;
  actionId: "ACT-04-06" | "ACT-04-07" | "ACT-04-08";
  href: PresentationRoutePath;
}>[];

/** /home is an alias of canonical `/` (PD-4.2 GRD-ALIAS). */
export function canonicalizeNavPath(pathname: string): string {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  return normalized === "/home" ? "/" : normalized;
}

export function isNavActive(
  pathname: string,
  href: PresentationRoutePath,
): boolean {
  return canonicalizeNavPath(pathname) === canonicalizeNavPath(href);
}

export function buildContinuityHref(
  path: "/workspace" | "/documents",
  projectId?: string,
): string {
  return buildProjectScopedHref(path, projectId);
}

/**
 * Attach opaque `projectId` presentation cue when present (PD-4.2 §3.2).
 */
export function buildProjectScopedHref(
  path: PresentationRoutePath,
  projectId?: string | null,
): string {
  const trimmed = projectId?.trim();
  if (!trimmed) {
    return path;
  }
  return `${path}?projectId=${encodeURIComponent(trimmed)}`;
}

export const DOCUMENT_CATEGORY_IDS = [
  "solution",
  "budget",
  "tender",
  "delivery",
] as const;

export type DocumentCategoryId = (typeof DOCUMENT_CATEGORY_IDS)[number];

/**
 * Documents library href with optional opaque project + category cues.
 */
export function buildDocumentsHref(input?: {
  projectId?: string | null;
  category?: DocumentCategoryId | string | null;
}): string {
  const params = new URLSearchParams();
  const projectId = input?.projectId?.trim();
  const category = input?.category?.trim().toLowerCase();
  if (projectId) {
    params.set("projectId", projectId);
  }
  if (
    category &&
    (DOCUMENT_CATEGORY_IDS as readonly string[]).includes(category)
  ) {
    params.set("category", category);
  }
  const query = params.toString();
  return query ? `/documents?${query}` : "/documents";
}

export const OPS_AREA_IDS = [
  "organizations",
  "users",
  "usage",
  "security",
  "governance",
] as const;

export type OpsAreaId = (typeof OPS_AREA_IDS)[number];

/**
 * Admin dashboard href with optional area focus (still SCR-09).
 */
export function buildAdminHref(area?: OpsAreaId | string | null): string {
  const normalized = area?.trim().toLowerCase();
  if (
    normalized &&
    (OPS_AREA_IDS as readonly string[]).includes(normalized)
  ) {
    return `/admin?area=${encodeURIComponent(normalized)}`;
  }
  return "/admin";
}
