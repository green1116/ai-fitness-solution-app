/**
 * PD-4.3 Frontend State Taxonomy — presentation ownership only.
 * Domain remains source of truth for business data (TX-01…TX-04).
 */

export const STATE_CLASS_IDS = [
  "ST-LOCAL",
  "ST-SHARED",
  "ST-SERVER",
  "ST-DERIVED",
  "ST-META",
  "ST-SESSION",
  "ST-CONTEXT",
] as const;

export type StateClassId = (typeof STATE_CLASS_IDS)[number];

export const LOCAL_STATE_KEYS = [
  "LCL-FOCUS",
  "LCL-PANEL",
  "LCL-DRAFT-PLAN",
  "LCL-DRAFT-OPP",
  "LCL-UPLOAD-PICK",
  "LCL-ROW-HOVER",
  "LCL-DOC-SELECT",
  "LCL-OPS-FOCUS",
  "LCL-LANG-UI",
] as const;

export type LocalStateKey = (typeof LOCAL_STATE_KEYS)[number];

export const SHARED_STATE_KEYS = [
  "SHR-PROJECT-CUE",
  "SHR-GOAL-CUE",
  "SHR-RETURN-TO",
  "SHR-LIBRARY-CATEGORY",
  "SHR-BP-CLASS",
] as const;

export type SharedStateKey = (typeof SHARED_STATE_KEYS)[number];

export const SERVER_STATE_KEYS = [
  "SRV-SESSION-USER",
  "SRV-PROJECT",
  "SRV-INPUTS",
  "SRV-TENDER",
  "SRV-REQUIREMENTS",
  "SRV-OPPORTUNITY",
  "SRV-TASK-PROGRESS",
  "SRV-SOLUTION",
  "SRV-BUDGET",
  "SRV-DOCUMENTS",
  "SRV-OPS",
] as const;

export type ServerStateKey = (typeof SERVER_STATE_KEYS)[number];

export const DERIVED_STATE_KEYS = [
  "DER-PROJECT-LIST-VIEW",
  "DER-DOC-BY-CATEGORY",
  "DER-SHELL-CONTEXT-LABEL",
  "DER-FORWARD-ENABLED",
  "DER-GP-STEP",
] as const;

export type DerivedStateKey = (typeof DERIVED_STATE_KEYS)[number];

export const META_STATE_KEYS = [
  "META-LOADING",
  "META-ERROR",
  "META-EMPTY",
] as const;

export type MetaStateKey = (typeof META_STATE_KEYS)[number];

export const SESSION_STATE_KEYS = [
  "SES-SIGNED-IN",
  "SES-DISPLAY-NAME",
  "SES-OPS-CAPABLE",
] as const;

export type SessionStateKey = (typeof SESSION_STATE_KEYS)[number];

export const CONTEXT_STATE_KEYS = [
  "CTX-ROUTE",
  "CTX-PROJECT-ID",
  "CTX-DOCUMENT-ID",
  "CTX-DOC-CATEGORY",
  "CTX-ADMIN-AREA",
] as const;

export type ContextStateKey = (typeof CONTEXT_STATE_KEYS)[number];

export const GOAL_CUE_IDS = ["Builder", "Tender", "Sales"] as const;
export type GoalCueId = (typeof GOAL_CUE_IDS)[number];

export const DOC_CATEGORY_LABELS = [
  "solution",
  "budget",
  "tender",
  "delivery",
] as const;
export type DocCategoryLabel = (typeof DOC_CATEGORY_LABELS)[number];

export const META_LOADING_VALUES = [
  "idle",
  "loading",
  "success",
] as const;
export type MetaLoadingValue = (typeof META_LOADING_VALUES)[number];

/**
 * Screen → primary state classes (PD-4.8 / PD-4.3 traceability).
 */
export const SCREEN_STATE_BINDINGS = [
  {
    screenId: "SCR-01",
    classes: ["ST-LOCAL", "ST-SESSION"],
  },
  {
    screenId: "SCR-02",
    classes: ["ST-LOCAL", "ST-META"],
  },
  {
    screenId: "SCR-03",
    classes: ["ST-LOCAL", "ST-SERVER", "ST-META"],
  },
  {
    screenId: "SCR-04",
    classes: ["ST-SERVER", "ST-CONTEXT", "ST-META"],
  },
  {
    screenId: "SCR-05",
    classes: ["ST-SERVER", "ST-CONTEXT", "ST-META"],
  },
  {
    screenId: "SCR-06",
    classes: ["ST-SERVER", "ST-CONTEXT", "ST-META"],
  },
  {
    screenId: "SCR-07",
    classes: ["ST-SERVER", "ST-META"],
  },
  {
    screenId: "SCR-08",
    classes: ["ST-SERVER", "ST-CONTEXT", "ST-META"],
  },
  {
    screenId: "SCR-09",
    classes: ["ST-SERVER", "ST-META"],
  },
] as const;

/** Command-class → cache invalidation policy (PD-4.3 §8.3) — registry only. */
export const CACHE_INVALIDATION_POLICY = [
  {
    commandClass: "intake-submit",
    invalidate: ["project-scoped"],
  },
  {
    commandClass: "download-share",
    invalidate: [],
  },
  {
    commandClass: "continue-project",
    invalidate: ["project-scoped"],
  },
  {
    commandClass: "sign-in-out",
    invalidate: ["session", "all-server"],
  },
  {
    commandClass: "nav-only",
    invalidate: [],
  },
] as const;
