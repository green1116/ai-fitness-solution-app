/**
 * Enterprise Platform v1 — Dependency Map
 * E09 → E10 → E11 → Platform v1 alignment chain
 */

import { E11_CLOUD_RUNTIME_BASE } from "../../cloud-runtime/e11/core/cloud.constants";
import { E10_PLATFORM_BASE } from "../e10/core/platform.constants";
import {
  E09_ENTERPRISE_COMPLETE_ID,
  E10_ENTERPRISE_COMPLETE_ID,
  E11_ENTERPRISE_COMPLETE_ID,
  PLATFORM_V1_BASE,
} from "./platform.v1.constants";
import { ENTERPRISE_LAYER_REGISTRY } from "./layer.registry";
import type { DependencyEdge, DependencyMap } from "./platform.v1.types";

export const ENTERPRISE_DEPENDENCY_EDGES: DependencyEdge[] = [
  {
    from: "E09",
    to: "E10",
    viaBase: E09_ENTERPRISE_COMPLETE_ID,
    label: "E10 platform builds on frozen E09 network",
  },
  {
    from: "E10",
    to: "E11",
    viaBase: E10_ENTERPRISE_COMPLETE_ID,
    label: "E11 cloud runtime builds on frozen E10 platform",
  },
  {
    from: "E11",
    to: "PLATFORM_V1",
    viaBase: E11_ENTERPRISE_COMPLETE_ID,
    label: "Platform v1 aligns on frozen E11 cloud runtime",
  },
];

export function validateEnterpriseDependencyChain(): {
  ok: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  if (E10_PLATFORM_BASE !== E09_ENTERPRISE_COMPLETE_ID) {
    failures.push(
      `E10 base expected=${E09_ENTERPRISE_COMPLETE_ID} actual=${E10_PLATFORM_BASE}`,
    );
  }
  if (E11_CLOUD_RUNTIME_BASE !== E10_ENTERPRISE_COMPLETE_ID) {
    failures.push(
      `E11 base expected=${E10_ENTERPRISE_COMPLETE_ID} actual=${E11_CLOUD_RUNTIME_BASE}`,
    );
  }
  if (PLATFORM_V1_BASE !== E11_ENTERPRISE_COMPLETE_ID) {
    failures.push(
      `Platform v1 base expected=${E11_ENTERPRISE_COMPLETE_ID} actual=${PLATFORM_V1_BASE}`,
    );
  }

  const e09 = ENTERPRISE_LAYER_REGISTRY.find((l) => l.code === "E09");
  const e10 = ENTERPRISE_LAYER_REGISTRY.find((l) => l.code === "E10");
  const e11 = ENTERPRISE_LAYER_REGISTRY.find((l) => l.code === "E11");

  if (e09?.completeId !== E09_ENTERPRISE_COMPLETE_ID) {
    failures.push("E09 registry completeId mismatch");
  }
  if (e10?.completeId !== E10_ENTERPRISE_COMPLETE_ID) {
    failures.push("E10 registry completeId mismatch");
  }
  if (e11?.completeId !== E11_ENTERPRISE_COMPLETE_ID) {
    failures.push("E11 registry completeId mismatch");
  }

  return { ok: failures.length === 0, failures };
}

export function buildEnterpriseDependencyMap(): DependencyMap {
  const validation = validateEnterpriseDependencyChain();
  return {
    edges: ENTERPRISE_DEPENDENCY_EDGES.map((edge) => ({ ...edge })),
    chainOk: validation.ok,
    failures: validation.failures,
  };
}

export function isEnterpriseDependencyMapAligned(): boolean {
  return validateEnterpriseDependencyChain().ok;
}
