/**
 * E11-P8 — Cloud Runtime Governance Freeze Lock (read-only)
 * Locks E11 P1–P7 versions + dependency chain
 * BASE: enterprise-e11-p7-cloud-runtime-control-plane-v1
 */

import {
  E11_AUTONOMOUS_BASE,
  E11_AUTONOMOUS_FREEZE_VERSION,
  E11_AUTONOMOUS_ID,
  E11_AUTONOMOUS_VERSION,
  E11_P6_AUTONOMOUS_FREEZE_VERSION,
} from "../autonomous/autonomous.constants";
import {
  E11_CONTROL_PLANE_BASE,
  E11_CONTROL_PLANE_FREEZE_VERSION,
  E11_CONTROL_PLANE_ID,
  E11_CONTROL_PLANE_VERSION,
  E11_P7_CONTROL_PLANE_FREEZE_VERSION,
} from "../control-plane/control-plane.constants";
import {
  E11_CLOUD_RUNTIME_BASE,
  E11_CLOUD_RUNTIME_FREEZE_VERSION,
  E11_CLOUD_RUNTIME_ID,
  E11_CLOUD_RUNTIME_VERSION,
  E11_P1_CLOUD_FREEZE_VERSION,
} from "../core/cloud.constants";
import {
  E11_EXECUTION_BASE,
  E11_EXECUTION_FREEZE_VERSION,
  E11_EXECUTION_ID,
  E11_EXECUTION_VERSION,
  E11_P2_EXECUTION_FREEZE_VERSION,
} from "../execution/execution.constants";
import {
  E11_GOVERNANCE_BASE,
  E11_GOVERNANCE_FREEZE_VERSION,
  E11_GOVERNANCE_ID,
  E11_GOVERNANCE_VERSION,
  E11_P4_GOVERNANCE_FREEZE_VERSION,
} from "../governance/governance.constants";
import {
  E11_OBSERVABILITY_BASE,
  E11_OBSERVABILITY_FREEZE_VERSION,
  E11_OBSERVABILITY_ID,
  E11_OBSERVABILITY_VERSION,
  E11_P5_OBSERVABILITY_FREEZE_VERSION,
} from "../observability/observability.constants";
import {
  E11_TENANT_BASE,
  E11_TENANT_FREEZE_VERSION,
  E11_TENANT_ID,
  E11_TENANT_VERSION,
  E11_P3_TENANT_FREEZE_VERSION,
} from "../tenant/tenant.constants";

export const E11_P8_SIGNOFF_VERSION = "e11-p8-signoff-1" as const;
export const E11_P8_CLOUD_RUNTIME_FREEZE_VERSION =
  "e11-p8-cloud-runtime-governance-freeze-1" as const;

export const E11_P8_GOVERNANCE_BASE =
  "enterprise-e11-p7-cloud-runtime-control-plane-v1" as const;

export type E11P8ComponentId =
  | "p1-foundation"
  | "p2-execution"
  | "p3-tenant"
  | "p4-governance"
  | "p5-observability"
  | "p6-autonomous"
  | "p7-control-plane"
  | "signoff";

export type E11P8ComponentLock = {
  id: E11P8ComponentId;
  path: string;
  label: string;
  required: true;
};

export type E11P8PhaseVersions = {
  p1: {
    id: typeof E11_CLOUD_RUNTIME_ID;
    version: typeof E11_CLOUD_RUNTIME_VERSION;
    freeze: typeof E11_P1_CLOUD_FREEZE_VERSION;
    base: typeof E11_CLOUD_RUNTIME_BASE;
  };
  p2: {
    id: typeof E11_EXECUTION_ID;
    version: typeof E11_EXECUTION_VERSION;
    freeze: typeof E11_P2_EXECUTION_FREEZE_VERSION;
    base: typeof E11_EXECUTION_BASE;
  };
  p3: {
    id: typeof E11_TENANT_ID;
    version: typeof E11_TENANT_VERSION;
    freeze: typeof E11_P3_TENANT_FREEZE_VERSION;
    base: typeof E11_TENANT_BASE;
  };
  p4: {
    id: typeof E11_GOVERNANCE_ID;
    version: typeof E11_GOVERNANCE_VERSION;
    freeze: typeof E11_P4_GOVERNANCE_FREEZE_VERSION;
    base: typeof E11_GOVERNANCE_BASE;
  };
  p5: {
    id: typeof E11_OBSERVABILITY_ID;
    version: typeof E11_OBSERVABILITY_VERSION;
    freeze: typeof E11_P5_OBSERVABILITY_FREEZE_VERSION;
    base: typeof E11_OBSERVABILITY_BASE;
  };
  p6: {
    id: typeof E11_AUTONOMOUS_ID;
    version: typeof E11_AUTONOMOUS_VERSION;
    freeze: typeof E11_P6_AUTONOMOUS_FREEZE_VERSION;
    base: typeof E11_AUTONOMOUS_BASE;
  };
  p7: {
    id: typeof E11_CONTROL_PLANE_ID;
    version: typeof E11_CONTROL_PLANE_VERSION;
    freeze: typeof E11_P7_CONTROL_PLANE_FREEZE_VERSION;
    base: typeof E11_CONTROL_PLANE_BASE;
  };
};

export type E11P8FreezeLock = {
  version: typeof E11_P8_CLOUD_RUNTIME_FREEZE_VERSION;
  base: typeof E11_P8_GOVERNANCE_BASE;
  cloudRuntimeId: typeof E11_CLOUD_RUNTIME_ID;
  controlPlaneId: typeof E11_CONTROL_PLANE_ID;
  signoff: typeof E11_P8_SIGNOFF_VERSION;
  phases: E11P8PhaseVersions;
  components: E11P8ComponentLock[];
};

/** Expected dependency chain (P2←P1 … P7←P6). */
export const E11_P8_EXPECTED_BASE_CHAIN = {
  p1: "enterprise-e10-autonomous-platform-complete-v1",
  p2: "enterprise-e11-p1-cloud-runtime-foundation-v1",
  p3: "enterprise-e11-p2-cloud-runtime-execution-v1",
  p4: "enterprise-e11-p3-cloud-runtime-multi-tenant-isolation-v1",
  p5: "enterprise-e11-p4-cloud-runtime-resource-governance-v1",
  p6: "enterprise-e11-p5-cloud-runtime-observability-v1",
  p7: "enterprise-e11-p6-cloud-runtime-autonomous-operations-v1",
} as const;

export const E11_P8_COMPONENT_LOCK: E11P8ComponentLock[] = [
  {
    id: "p1-foundation",
    path: "lib/cloud-runtime/e11/core/",
    label: "E11-P1 Cloud Runtime Foundation",
    required: true,
  },
  {
    id: "p2-execution",
    path: "lib/cloud-runtime/e11/execution/",
    label: "E11-P2 Cloud Runtime Execution",
    required: true,
  },
  {
    id: "p3-tenant",
    path: "lib/cloud-runtime/e11/tenant/",
    label: "E11-P3 Multi-Tenant Isolation",
    required: true,
  },
  {
    id: "p4-governance",
    path: "lib/cloud-runtime/e11/governance/",
    label: "E11-P4 Resource Governance",
    required: true,
  },
  {
    id: "p5-observability",
    path: "lib/cloud-runtime/e11/observability/",
    label: "E11-P5 Observability",
    required: true,
  },
  {
    id: "p6-autonomous",
    path: "lib/cloud-runtime/e11/autonomous/",
    label: "E11-P6 Autonomous Operations",
    required: true,
  },
  {
    id: "p7-control-plane",
    path: "lib/cloud-runtime/e11/control-plane/",
    label: "E11-P7 Enterprise Control Plane",
    required: true,
  },
  {
    id: "signoff",
    path: "lib/cloud-runtime/e11/signoff/",
    label: "E11-P8 Governance Freeze Gate",
    required: true,
  },
];

export const E11_P8_PHASE_VERSIONS: E11P8PhaseVersions = {
  p1: {
    id: E11_CLOUD_RUNTIME_ID,
    version: E11_CLOUD_RUNTIME_VERSION,
    freeze: E11_P1_CLOUD_FREEZE_VERSION,
    base: E11_CLOUD_RUNTIME_BASE,
  },
  p2: {
    id: E11_EXECUTION_ID,
    version: E11_EXECUTION_VERSION,
    freeze: E11_P2_EXECUTION_FREEZE_VERSION,
    base: E11_EXECUTION_BASE,
  },
  p3: {
    id: E11_TENANT_ID,
    version: E11_TENANT_VERSION,
    freeze: E11_P3_TENANT_FREEZE_VERSION,
    base: E11_TENANT_BASE,
  },
  p4: {
    id: E11_GOVERNANCE_ID,
    version: E11_GOVERNANCE_VERSION,
    freeze: E11_P4_GOVERNANCE_FREEZE_VERSION,
    base: E11_GOVERNANCE_BASE,
  },
  p5: {
    id: E11_OBSERVABILITY_ID,
    version: E11_OBSERVABILITY_VERSION,
    freeze: E11_P5_OBSERVABILITY_FREEZE_VERSION,
    base: E11_OBSERVABILITY_BASE,
  },
  p6: {
    id: E11_AUTONOMOUS_ID,
    version: E11_AUTONOMOUS_VERSION,
    freeze: E11_P6_AUTONOMOUS_FREEZE_VERSION,
    base: E11_AUTONOMOUS_BASE,
  },
  p7: {
    id: E11_CONTROL_PLANE_ID,
    version: E11_CONTROL_PLANE_VERSION,
    freeze: E11_P7_CONTROL_PLANE_FREEZE_VERSION,
    base: E11_CONTROL_PLANE_BASE,
  },
};

export const E11_P8_FREEZE_LOCK: E11P8FreezeLock = {
  version: E11_P8_CLOUD_RUNTIME_FREEZE_VERSION,
  base: E11_P8_GOVERNANCE_BASE,
  cloudRuntimeId: E11_CLOUD_RUNTIME_ID,
  controlPlaneId: E11_CONTROL_PLANE_ID,
  signoff: E11_P8_SIGNOFF_VERSION,
  phases: E11_P8_PHASE_VERSIONS,
  components: E11_P8_COMPONENT_LOCK,
};

export const EXPECTED_E11_P8_FREEZE_LOCK: E11P8FreezeLock = E11_P8_FREEZE_LOCK;

export function isE11P8FreezeLockIntact(): boolean {
  const lock = E11_P8_FREEZE_LOCK;
  const phaseOk = (
    Object.keys(lock.phases) as Array<keyof E11P8PhaseVersions>
  ).every((key) => {
    const phase = lock.phases[key];
    return (
      typeof phase.id === "string" &&
      phase.id.length > 0 &&
      typeof phase.version === "string" &&
      phase.version.length > 0 &&
      typeof phase.freeze === "string" &&
      phase.freeze.length > 0 &&
      typeof phase.base === "string" &&
      phase.base.length > 0
    );
  });

  return (
    typeof lock.version === "string" &&
    lock.version.length > 0 &&
    typeof lock.base === "string" &&
    lock.base.length > 0 &&
    typeof lock.cloudRuntimeId === "string" &&
    lock.cloudRuntimeId.length > 0 &&
    typeof lock.controlPlaneId === "string" &&
    lock.controlPlaneId.length > 0 &&
    typeof lock.signoff === "string" &&
    lock.signoff.length > 0 &&
    phaseOk &&
    Array.isArray(lock.components) &&
    lock.components.length >= 8 &&
    lock.components.every(
      (c) =>
        typeof c.id === "string" &&
        typeof c.path === "string" &&
        typeof c.label === "string" &&
        c.required === true,
    )
  );
}

export function e11P8FreezeLockMatchesExpected(): boolean {
  const lock = E11_P8_FREEZE_LOCK;
  const expected = EXPECTED_E11_P8_FREEZE_LOCK;
  const phaseKeys = Object.keys(expected.phases) as Array<
    keyof E11P8PhaseVersions
  >;

  return (
    lock.version === expected.version &&
    lock.base === expected.base &&
    lock.cloudRuntimeId === expected.cloudRuntimeId &&
    lock.controlPlaneId === expected.controlPlaneId &&
    lock.signoff === expected.signoff &&
    phaseKeys.every(
      (key) =>
        lock.phases[key].id === expected.phases[key].id &&
        lock.phases[key].version === expected.phases[key].version &&
        lock.phases[key].freeze === expected.phases[key].freeze &&
        lock.phases[key].base === expected.phases[key].base,
    ) &&
    lock.components.length === expected.components.length &&
    lock.components.every(
      (c, i) =>
        c.id === expected.components[i]?.id &&
        c.path === expected.components[i]?.path,
    )
  );
}

/** Validate P1→P7 BASE dependency chain against expected freeze tags. */
export function validateE11P8DependencyChain(): {
  ok: boolean;
  failures: string[];
} {
  const phases = E11_P8_PHASE_VERSIONS;
  const expected = E11_P8_EXPECTED_BASE_CHAIN;
  const failures: string[] = [];

  const keys = Object.keys(expected) as Array<keyof typeof expected>;
  for (const key of keys) {
    if (phases[key].base !== expected[key]) {
      failures.push(
        `${key}.base expected=${expected[key]} actual=${phases[key].base}`,
      );
    }
  }

  if (E11_P8_GOVERNANCE_BASE !== "enterprise-e11-p7-cloud-runtime-control-plane-v1") {
    failures.push(
      `p8.base expected=enterprise-e11-p7-cloud-runtime-control-plane-v1 actual=${E11_P8_GOVERNANCE_BASE}`,
    );
  }

  return { ok: failures.length === 0, failures };
}
