/**
 * PD-3.4 / PD-4.4 component composition registry.
 * Presentation inventory only — no Domain / API ownership.
 */

export const PRODUCT_CMP_IDS = [
  "CMP-SHELL-HEADER",
  "CMP-SHELL-CONTEXT",
  "CMP-SHELL-FOOTER",
  "CMP-ACCESS-SIGNIN",
  "CMP-ACCESS-LANGUAGE",
  "CMP-GOAL-CARD",
  "CMP-NAV-CONTINUITY",
  "CMP-GUIDE-PANEL",
  "CMP-INPUT-PLANNING",
  "CMP-UPLOAD-TENDER",
  "CMP-STATUS-PROCESS",
  "CMP-FORWARD-PRIMARY",
  "CMP-CONV-PANEL",
  "CMP-TASK-PANEL",
  "CMP-CONTEXT-PANEL",
  "CMP-OUTCOME-LINKS",
  "CMP-RESULT-SUMMARY",
  "CMP-RESULT-BLOCKS",
  "CMP-BUDGET-OVERVIEW",
  "CMP-ARTIFACT-ACTIONS",
  "CMP-FORWARD-GROUP",
  "CMP-PROJECT-LIST",
  "CMP-PROJECT-ROW",
  "CMP-DOC-CATEGORIES",
  "CMP-DOC-ITEM",
  "CMP-OPS-AREA",
] as const;

export type ProductCmpId = (typeof PRODUCT_CMP_IDS)[number];

export const FEATCMP_IDS = [
  "FEATCMP-GOAL-ENTRY",
  "FEATCMP-ACCESS",
  "FEATCMP-CONTINUITY",
  "FEATCMP-BUILDER-INTAKE",
  "FEATCMP-TENDER-INTAKE",
  "FEATCMP-WORKSPACE",
  "FEATCMP-SOLUTION-RESULT",
  "FEATCMP-BUDGET-RESULT",
  "FEATCMP-PROJECTS",
  "FEATCMP-DOCUMENTS",
  "FEATCMP-ADMIN-OPS",
] as const;

export type FeatCmpId = (typeof FEATCMP_IDS)[number];

export const SCRCMP_IDS = [
  "SCRCMP-HOME",
  "SCRCMP-BUILDER",
  "SCRCMP-TENDER",
  "SCRCMP-WORKSPACE",
  "SCRCMP-SOLUTION",
  "SCRCMP-BUDGET",
  "SCRCMP-PROJECTS",
  "SCRCMP-DOCUMENTS",
  "SCRCMP-ADMIN",
] as const;

export type ScrCmpId = (typeof SCRCMP_IDS)[number];

/**
 * PD-3.4 §5 — Screen → required product CMP-* (shell wrap separate via FE-1).
 * Shell CMPs are owned by LAYCMP-SHELL; listed here for SCR mapping completeness.
 */
export const SCREEN_CMP_COMPOSITION = [
  {
    screenId: "SCR-01",
    scrcmpId: "SCRCMP-HOME",
    laycmpId: "LAYCMP-ENTRY",
    featcmpIds: [
      "FEATCMP-ACCESS",
      "FEATCMP-GOAL-ENTRY",
      "FEATCMP-CONTINUITY",
    ],
    screenCmps: [
      "CMP-ACCESS-SIGNIN",
      "CMP-ACCESS-LANGUAGE",
      "CMP-GOAL-CARD",
      "CMP-NAV-CONTINUITY",
    ],
    shellCmps: ["CMP-SHELL-HEADER", "CMP-SHELL-FOOTER"],
  },
  {
    screenId: "SCR-02",
    scrcmpId: "SCRCMP-BUILDER",
    laycmpId: "LAYCMP-INTAKE",
    featcmpIds: ["FEATCMP-BUILDER-INTAKE"],
    screenCmps: [
      "CMP-GUIDE-PANEL",
      "CMP-INPUT-PLANNING",
      "CMP-FORWARD-PRIMARY",
    ],
    shellCmps: ["CMP-SHELL-HEADER"],
  },
  {
    screenId: "SCR-03",
    scrcmpId: "SCRCMP-TENDER",
    laycmpId: "LAYCMP-INTAKE",
    featcmpIds: ["FEATCMP-TENDER-INTAKE"],
    screenCmps: [
      "CMP-GUIDE-PANEL",
      "CMP-UPLOAD-TENDER",
      "CMP-STATUS-PROCESS",
      "CMP-FORWARD-PRIMARY",
    ],
    shellCmps: ["CMP-SHELL-HEADER"],
  },
  {
    screenId: "SCR-04",
    scrcmpId: "SCRCMP-WORKSPACE",
    laycmpId: "LAYCMP-SPLIT-3",
    featcmpIds: ["FEATCMP-WORKSPACE"],
    screenCmps: [
      "CMP-CONV-PANEL",
      "CMP-TASK-PANEL",
      "CMP-CONTEXT-PANEL",
      "CMP-OUTCOME-LINKS",
    ],
    shellCmps: ["CMP-SHELL-HEADER", "CMP-SHELL-CONTEXT"],
  },
  {
    screenId: "SCR-05",
    scrcmpId: "SCRCMP-SOLUTION",
    laycmpId: "LAYCMP-RESULT",
    featcmpIds: ["FEATCMP-SOLUTION-RESULT"],
    screenCmps: [
      "CMP-RESULT-SUMMARY",
      "CMP-RESULT-BLOCKS",
      "CMP-ARTIFACT-ACTIONS",
      "CMP-FORWARD-GROUP",
    ],
    shellCmps: ["CMP-SHELL-HEADER", "CMP-SHELL-CONTEXT"],
  },
  {
    screenId: "SCR-06",
    scrcmpId: "SCRCMP-BUDGET",
    laycmpId: "LAYCMP-RESULT",
    featcmpIds: ["FEATCMP-BUDGET-RESULT"],
    screenCmps: [
      "CMP-RESULT-SUMMARY",
      "CMP-BUDGET-OVERVIEW",
      "CMP-ARTIFACT-ACTIONS",
      "CMP-FORWARD-GROUP",
    ],
    shellCmps: ["CMP-SHELL-HEADER", "CMP-SHELL-CONTEXT"],
  },
  {
    screenId: "SCR-07",
    scrcmpId: "SCRCMP-PROJECTS",
    laycmpId: "LAYCMP-LIST",
    featcmpIds: ["FEATCMP-PROJECTS"],
    screenCmps: ["CMP-PROJECT-LIST", "CMP-PROJECT-ROW"],
    shellCmps: ["CMP-SHELL-HEADER"],
  },
  {
    screenId: "SCR-08",
    scrcmpId: "SCRCMP-DOCUMENTS",
    laycmpId: "LAYCMP-LIBRARY",
    featcmpIds: ["FEATCMP-DOCUMENTS"],
    screenCmps: [
      "CMP-DOC-CATEGORIES",
      "CMP-DOC-ITEM",
      "CMP-ARTIFACT-ACTIONS",
      "CMP-FORWARD-GROUP",
    ],
    shellCmps: ["CMP-SHELL-HEADER", "CMP-SHELL-CONTEXT"],
  },
  {
    screenId: "SCR-09",
    scrcmpId: "SCRCMP-ADMIN",
    laycmpId: "LAYCMP-OPS",
    featcmpIds: ["FEATCMP-ADMIN-OPS"],
    screenCmps: ["CMP-OPS-AREA"],
    shellCmps: ["CMP-SHELL-HEADER"],
  },
] as const;

export const PRODUCT_CMP_COUNT = PRODUCT_CMP_IDS.length;
export const FEATCMP_COUNT = FEATCMP_IDS.length;
export const SCRCMP_COUNT = SCRCMP_IDS.length;
