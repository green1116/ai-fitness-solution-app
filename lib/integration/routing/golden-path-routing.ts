/**
 * PI-5.2 — Golden Path → dominant workflow kinds (PD-6.3 §2.2).
 * Path refs only — no new journeys.
 */
import type { IntegrationWorkflowId } from "./workflow-kinds";

export const GOLDEN_PATH_IDS = [
  "GP-01",
  "GP-01R",
  "GP-02",
  "GP-03",
  "GP-04",
] as const;

export type GoldenPathId = (typeof GOLDEN_PATH_IDS)[number];

export type GoldenPathRoutingRow = Readonly<{
  pathId: GoldenPathId;
  screenChain: string;
  dominantWorkflows: readonly IntegrationWorkflowId[];
}>;

export const GOLDEN_PATH_ROUTING = [
  {
    pathId: "GP-01",
    screenChain: "SCR-01→02→04→05→06→08",
    dominantWorkflows: ["WF-COMMAND", "WF-READ", "WF-ASYNC", "WF-NAV"],
  },
  {
    pathId: "GP-01R",
    screenChain: "SCR-01→07→04",
    dominantWorkflows: ["WF-READ", "WF-COMMAND", "WF-NAV"],
  },
  {
    pathId: "GP-02",
    screenChain: "SCR-01→03→04→05→08",
    dominantWorkflows: ["WF-COMMAND", "WF-ASYNC", "WF-READ"],
  },
  {
    pathId: "GP-03",
    screenChain: "SCR-01→04→05→06→08",
    dominantWorkflows: ["WF-COMMAND", "WF-READ", "WF-NAV"],
  },
  {
    pathId: "GP-04",
    screenChain: "SCR-09",
    dominantWorkflows: ["WF-READ"],
  },
] as const satisfies readonly GoldenPathRoutingRow[];
