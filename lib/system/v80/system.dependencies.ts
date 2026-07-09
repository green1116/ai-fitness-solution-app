/**
 * V80 P1 — System stack dependencies V76–V79 (read-only)
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

export type SystemStackDependency = {
  id: string;
  layerRef: SystemLayerId;
  upstreamVersion: string;
  systemRef: string;
  required: boolean;
  description: string;
};

export const SYSTEM_STACK_DEPENDENCIES: SystemStackDependency[] = [
  {
    id: "SYS-DEP-001",
    layerRef: "V76",
    upstreamVersion: V76_COLLABORATION_FREEZE_VERSION,
    systemRef: "SYS-001",
    required: true,
    description: "V76 collaboration freeze stack lock",
  },
  {
    id: "SYS-DEP-002",
    layerRef: "V76",
    upstreamVersion: V76_COLLABORATION_SIGNOFF_VERSION,
    systemRef: "SYS-008",
    required: true,
    description: "V76 collaboration sign-off stack lock",
  },
  {
    id: "SYS-DEP-003",
    layerRef: "V77",
    upstreamVersion: V77_PLANNING_FREEZE_VERSION,
    systemRef: "SYS-001",
    required: true,
    description: "V77 planning freeze stack lock",
  },
  {
    id: "SYS-DEP-004",
    layerRef: "V77",
    upstreamVersion: V77_PLANNING_SIGNOFF_VERSION,
    systemRef: "SYS-008",
    required: true,
    description: "V77 planning sign-off stack lock",
  },
  {
    id: "SYS-DEP-005",
    layerRef: "V78",
    upstreamVersion: V78_EXECUTION_FREEZE_VERSION,
    systemRef: "SYS-001",
    required: true,
    description: "V78 execution freeze stack lock",
  },
  {
    id: "SYS-DEP-006",
    layerRef: "V78",
    upstreamVersion: V78_EXECUTION_SIGNOFF_VERSION,
    systemRef: "SYS-008",
    required: true,
    description: "V78 execution sign-off stack lock",
  },
  {
    id: "SYS-DEP-007",
    layerRef: "V79",
    upstreamVersion: V79_TASK_FREEZE_VERSION,
    systemRef: "SYS-001",
    required: true,
    description: "V79 task freeze stack lock",
  },
  {
    id: "SYS-DEP-008",
    layerRef: "V79",
    upstreamVersion: V79_TASK_SIGNOFF_VERSION,
    systemRef: "SYS-008",
    required: true,
    description: "V79 task sign-off stack lock",
  },
];

export function isSystemStackUpstreamAligned(): boolean {
  const layers = new Set(SYSTEM_STACK_DEPENDENCIES.map((d) => d.layerRef));
  return (
    SYSTEM_STACK_DEPENDENCIES.length >= 8 &&
    layers.has("V76") &&
    layers.has("V77") &&
    layers.has("V78") &&
    layers.has("V79") &&
    SYSTEM_STACK_DEPENDENCIES.every((d) => d.upstreamVersion.length > 0)
  );
}

export function getSystemDependencyById(id: string): SystemStackDependency | undefined {
  return SYSTEM_STACK_DEPENDENCIES.find((d) => d.id === id);
}

export function getSystemDependenciesByLayer(layer: SystemLayerId): SystemStackDependency[] {
  return SYSTEM_STACK_DEPENDENCIES.filter((d) => d.layerRef === layer);
}
