export const PRESENTATION_ROUTE_GROUPS = [
  "entry",
  "work",
  "result",
  "library",
  "ops",
  "system",
] as const;

export type PresentationRouteGroup =
  (typeof PRESENTATION_ROUTE_GROUPS)[number];

export type PresentationRoutePath =
  | "/"
  | "/home"
  | "/builder"
  | "/tender"
  | "/workspace"
  | "/solution"
  | "/budget"
  | "/projects"
  | "/documents"
  | "/admin"
  | "/404"
  | "/unavailable";

export type PresentationRoute = Readonly<{
  id:
    | "RT-HOME"
    | "RT-HOME-ALT"
    | "RT-BUILDER"
    | "RT-TENDER"
    | "RT-WORKSPACE"
    | "RT-SOLUTION"
    | "RT-BUDGET"
    | "RT-PROJECTS"
    | "RT-DOCUMENTS"
    | "RT-ADMIN"
    | "RT-NOT-FOUND"
    | "RT-UNAVAILABLE";
  path: PresentationRoutePath;
  label: string;
  group: PresentationRouteGroup;
  pageId:
    | "PG-HOME"
    | "PG-BUILDER"
    | "PG-TENDER"
    | "PG-WORKSPACE"
    | "PG-SOLUTION"
    | "PG-BUDGET"
    | "PG-PROJECTS"
    | "PG-DOCUMENTS"
    | "PG-ADMIN"
    | "PG-NOT-FOUND"
    | "PG-UNAVAILABLE";
  screenId:
    | "SCR-01"
    | "SCR-02"
    | "SCR-03"
    | "SCR-04"
    | "SCR-05"
    | "SCR-06"
    | "SCR-07"
    | "SCR-08"
    | "SCR-09"
    | null;
  layoutId:
    | "LAY-ENTRY"
    | "LAY-INTAKE"
    | "LAY-SPLIT-3"
    | "LAY-RESULT"
    | "LAY-LIST"
    | "LAY-LIBRARY"
    | "LAY-OPS"
    | null;
  canonicalPath?: "/";
}>;

/**
 * Presentation-only projection of the frozen PD-4.2 route catalogue.
 *
 * This registry owns no guards, API calls, permissions, or business decisions.
 * Next.js page modules remain the framework-level route owners.
 */
export const PRESENTATION_ROUTES = [
  {
    id: "RT-HOME",
    path: "/",
    label: "Home",
    group: "entry",
    pageId: "PG-HOME",
    screenId: "SCR-01",
    layoutId: "LAY-ENTRY",
  },
  {
    id: "RT-HOME-ALT",
    path: "/home",
    label: "Home",
    group: "entry",
    pageId: "PG-HOME",
    screenId: "SCR-01",
    layoutId: "LAY-ENTRY",
    canonicalPath: "/",
  },
  {
    id: "RT-BUILDER",
    path: "/builder",
    label: "Enterprise Builder",
    group: "work",
    pageId: "PG-BUILDER",
    screenId: "SCR-02",
    layoutId: "LAY-INTAKE",
  },
  {
    id: "RT-TENDER",
    path: "/tender",
    label: "Tender Intelligence",
    group: "work",
    pageId: "PG-TENDER",
    screenId: "SCR-03",
    layoutId: "LAY-INTAKE",
  },
  {
    id: "RT-WORKSPACE",
    path: "/workspace",
    label: "AI Workspace",
    group: "work",
    pageId: "PG-WORKSPACE",
    screenId: "SCR-04",
    layoutId: "LAY-SPLIT-3",
  },
  {
    id: "RT-SOLUTION",
    path: "/solution",
    label: "Solution Result",
    group: "result",
    pageId: "PG-SOLUTION",
    screenId: "SCR-05",
    layoutId: "LAY-RESULT",
  },
  {
    id: "RT-BUDGET",
    path: "/budget",
    label: "Budget Result",
    group: "result",
    pageId: "PG-BUDGET",
    screenId: "SCR-06",
    layoutId: "LAY-RESULT",
  },
  {
    id: "RT-PROJECTS",
    path: "/projects",
    label: "My Projects",
    group: "library",
    pageId: "PG-PROJECTS",
    screenId: "SCR-07",
    layoutId: "LAY-LIST",
  },
  {
    id: "RT-DOCUMENTS",
    path: "/documents",
    label: "My Documents",
    group: "library",
    pageId: "PG-DOCUMENTS",
    screenId: "SCR-08",
    layoutId: "LAY-LIBRARY",
  },
  {
    id: "RT-ADMIN",
    path: "/admin",
    label: "Admin Dashboard",
    group: "ops",
    pageId: "PG-ADMIN",
    screenId: "SCR-09",
    layoutId: "LAY-OPS",
  },
  {
    id: "RT-NOT-FOUND",
    path: "/404",
    label: "Not Found",
    group: "system",
    pageId: "PG-NOT-FOUND",
    screenId: null,
    layoutId: null,
  },
  {
    id: "RT-UNAVAILABLE",
    path: "/unavailable",
    label: "Temporarily Unavailable",
    group: "system",
    pageId: "PG-UNAVAILABLE",
    screenId: null,
    layoutId: null,
  },
] as const satisfies readonly PresentationRoute[];
