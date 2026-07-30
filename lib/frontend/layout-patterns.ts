import {
  PRESENTATION_ROUTES,
  type PresentationRoutePath,
} from "@/lib/frontend/presentation-routes";

export const LAYOUT_PATTERN_IDS = [
  "LAY-ENTRY",
  "LAY-INTAKE",
  "LAY-SPLIT-3",
  "LAY-RESULT",
  "LAY-LIST",
  "LAY-LIBRARY",
  "LAY-OPS",
] as const;

export type LayoutPatternId = (typeof LAYOUT_PATTERN_IDS)[number];

export const SHELL_MODES = [
  "entry",
  "work",
  "result",
  "library",
  "ops",
  "minimal",
] as const;

export type ShellMode = (typeof SHELL_MODES)[number];

export type ScreenLayoutBinding = Readonly<{
  screenId:
    | "SCR-01"
    | "SCR-02"
    | "SCR-03"
    | "SCR-04"
    | "SCR-05"
    | "SCR-06"
    | "SCR-07"
    | "SCR-08"
    | "SCR-09";
  layoutId: LayoutPatternId;
  shellMode: Exclude<ShellMode, "minimal">;
  layoutHostId:
    | "LAYCMP-ENTRY"
    | "LAYCMP-INTAKE"
    | "LAYCMP-SPLIT-3"
    | "LAYCMP-RESULT"
    | "LAYCMP-LIST"
    | "LAYCMP-LIBRARY"
    | "LAYCMP-OPS";
}>;

/**
 * Frozen Screen → LAY-* → shell mode bindings (PD-4.1 §5 / PD-4.2 §4 / PD-4.4 §7–8).
 * Presentation structure only — no Domain or API ownership.
 */
export const SCREEN_LAYOUT_BINDINGS = [
  {
    screenId: "SCR-01",
    layoutId: "LAY-ENTRY",
    shellMode: "entry",
    layoutHostId: "LAYCMP-ENTRY",
  },
  {
    screenId: "SCR-02",
    layoutId: "LAY-INTAKE",
    shellMode: "work",
    layoutHostId: "LAYCMP-INTAKE",
  },
  {
    screenId: "SCR-03",
    layoutId: "LAY-INTAKE",
    shellMode: "work",
    layoutHostId: "LAYCMP-INTAKE",
  },
  {
    screenId: "SCR-04",
    layoutId: "LAY-SPLIT-3",
    shellMode: "work",
    layoutHostId: "LAYCMP-SPLIT-3",
  },
  {
    screenId: "SCR-05",
    layoutId: "LAY-RESULT",
    shellMode: "result",
    layoutHostId: "LAYCMP-RESULT",
  },
  {
    screenId: "SCR-06",
    layoutId: "LAY-RESULT",
    shellMode: "result",
    layoutHostId: "LAYCMP-RESULT",
  },
  {
    screenId: "SCR-07",
    layoutId: "LAY-LIST",
    shellMode: "library",
    layoutHostId: "LAYCMP-LIST",
  },
  {
    screenId: "SCR-08",
    layoutId: "LAY-LIBRARY",
    shellMode: "library",
    layoutHostId: "LAYCMP-LIBRARY",
  },
  {
    screenId: "SCR-09",
    layoutId: "LAY-OPS",
    shellMode: "ops",
    layoutHostId: "LAYCMP-OPS",
  },
] as const satisfies readonly ScreenLayoutBinding[];

export const LAYOUT_PATTERN_STRUCTURE = {
  "LAY-ENTRY": ["access", "goals", "continuity"],
  "LAY-INTAKE": ["guide", "capture", "forward"],
  "LAY-SPLIT-3": ["conversation", "task", "context", "outcomes"],
  "LAY-RESULT": ["summary", "body", "artifacts", "forward"],
  "LAY-LIST": ["list"],
  "LAY-LIBRARY": ["categories", "items", "artifacts", "forward"],
  "LAY-OPS": ["areas"],
} as const satisfies Record<LayoutPatternId, readonly string[]>;

export function getScreenLayoutBinding(
  screenId: ScreenLayoutBinding["screenId"],
): ScreenLayoutBinding {
  const binding = SCREEN_LAYOUT_BINDINGS.find(
    (entry) => entry.screenId === screenId,
  );
  if (!binding) {
    throw new Error(`Missing frozen layout binding for ${screenId}`);
  }
  return binding;
}

export function resolveShellMode(
  pathname: string,
): ShellMode {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  const route = PRESENTATION_ROUTES.find((entry) => entry.path === normalized);

  if (!route) {
    return "minimal";
  }

  if (route.group === "system") {
    return "minimal";
  }

  if (route.screenId) {
    return getScreenLayoutBinding(route.screenId).shellMode;
  }

  return "minimal";
}

export function resolveLayoutPattern(
  pathname: PresentationRoutePath | string,
): LayoutPatternId | null {
  const route = PRESENTATION_ROUTES.find((entry) => entry.path === pathname);
  return route?.layoutId ?? null;
}
