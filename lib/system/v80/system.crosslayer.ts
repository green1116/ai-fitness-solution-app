/**
 * V80 P1 — Cross-layer map V76–V79 (read-only)
 */
import {
  V76_COLLABORATION_FREEZE_VERSION,
  V76_COLLABORATION_SIGNOFF_VERSION,
} from "@/lib/collaboration/v76/signoff/signoff.types";
import {
  V78_EXECUTION_FREEZE_VERSION,
  V78_EXECUTION_SIGNOFF_VERSION,
} from "@/lib/execution/v78/signoff/signoff.types";
import {
  V77_PLANNING_FREEZE_VERSION,
  V77_PLANNING_SIGNOFF_VERSION,
} from "@/lib/planning/v77/signoff/signoff.types";
import {
  V79_TASK_FREEZE_VERSION,
  V79_TASK_SIGNOFF_VERSION,
} from "@/lib/task/v79/signoff/signoff.types";

import type { SystemLayerId } from "./system.types";

export type SystemCrossLayerEntry = {
  layer: SystemLayerId;
  domain: string;
  signoffVersion: string;
  freezeVersion: string;
  inventoryPath: string;
  signoffPath: string;
  required: boolean;
};

export const SYSTEM_CROSS_LAYER_MAP: SystemCrossLayerEntry[] = [
  {
    layer: "V76",
    domain: "collaboration",
    signoffVersion: V76_COLLABORATION_SIGNOFF_VERSION,
    freezeVersion: V76_COLLABORATION_FREEZE_VERSION,
    inventoryPath: "lib/collaboration/v76/",
    signoffPath: "lib/collaboration/v76/signoff/",
    required: true,
  },
  {
    layer: "V77",
    domain: "planning",
    signoffVersion: V77_PLANNING_SIGNOFF_VERSION,
    freezeVersion: V77_PLANNING_FREEZE_VERSION,
    inventoryPath: "lib/planning/v77/",
    signoffPath: "lib/planning/v77/signoff/",
    required: true,
  },
  {
    layer: "V78",
    domain: "execution",
    signoffVersion: V78_EXECUTION_SIGNOFF_VERSION,
    freezeVersion: V78_EXECUTION_FREEZE_VERSION,
    inventoryPath: "lib/execution/v78/",
    signoffPath: "lib/execution/v78/signoff/",
    required: true,
  },
  {
    layer: "V79",
    domain: "task",
    signoffVersion: V79_TASK_SIGNOFF_VERSION,
    freezeVersion: V79_TASK_FREEZE_VERSION,
    inventoryPath: "lib/task/v79/",
    signoffPath: "lib/task/v79/signoff/",
    required: true,
  },
];

export function isSystemCrossLayerMapComplete(): boolean {
  const layers = new Set(SYSTEM_CROSS_LAYER_MAP.map((e) => e.layer));
  return (
    SYSTEM_CROSS_LAYER_MAP.length === 4 &&
    layers.has("V76") &&
    layers.has("V77") &&
    layers.has("V78") &&
    layers.has("V79") &&
    SYSTEM_CROSS_LAYER_MAP.every((e) => e.signoffVersion.length > 0 && e.freezeVersion.length > 0)
  );
}

export function getCrossLayerEntry(layer: SystemLayerId): SystemCrossLayerEntry | undefined {
  return SYSTEM_CROSS_LAYER_MAP.find((e) => e.layer === layer);
}
