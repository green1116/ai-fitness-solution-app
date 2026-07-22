/**
 * Post-Launch P8 — Operations Governance Freeze Lock (read-only)
 * Locks Operations P1–P7 versions + dependency chain
 * BASE: enterprise-post-launch-p7-operations-control-plane-v1
 * INTEGRATE: enterprise-launch-complete-v1
 */

import {
  OPERATIONS_P7_CONTROL_FREEZE_VERSION,
  OPERATIONS_CONTROL_PLANE_BASE,
  OPERATIONS_CONTROL_PLANE_FREEZE_VERSION,
  OPERATIONS_CONTROL_PLANE_ID,
  OPERATIONS_CONTROL_PLANE_VERSION,
} from "../control/control.constants";
import {
  OPERATIONS_P2_CUSTOMER_SUCCESS_FREEZE_VERSION,
  OPERATIONS_CUSTOMER_SUCCESS_BASE,
  OPERATIONS_CUSTOMER_SUCCESS_FREEZE_VERSION,
  OPERATIONS_CUSTOMER_SUCCESS_ID,
  OPERATIONS_CUSTOMER_SUCCESS_VERSION,
} from "../customer-success/success.constants";
import {
  OPERATIONS_P5_GROWTH_ANALYTICS_FREEZE_VERSION,
  OPERATIONS_GROWTH_ANALYTICS_BASE,
  OPERATIONS_GROWTH_ANALYTICS_FREEZE_VERSION,
  OPERATIONS_GROWTH_ANALYTICS_ID,
  OPERATIONS_GROWTH_ANALYTICS_VERSION,
} from "../growth/growth.constants";
import {
  OPERATIONS_P3_INCIDENT_RESPONSE_FREEZE_VERSION,
  OPERATIONS_INCIDENT_RESPONSE_BASE,
  OPERATIONS_INCIDENT_RESPONSE_FREEZE_VERSION,
  OPERATIONS_INCIDENT_RESPONSE_ID,
  OPERATIONS_INCIDENT_RESPONSE_VERSION,
} from "../incident/incident.constants";
import {
  OPERATIONS_P1_PRODUCTION_FREEZE_VERSION,
  OPERATIONS_PRODUCTION_FOUNDATION_BASE,
  OPERATIONS_PRODUCTION_FOUNDATION_FREEZE_VERSION,
  OPERATIONS_PRODUCTION_FOUNDATION_ID,
  OPERATIONS_PRODUCTION_FOUNDATION_VERSION,
} from "../production/production.constants";
import {
  OPERATIONS_P4_RELEASE_MANAGEMENT_FREEZE_VERSION,
  OPERATIONS_RELEASE_MANAGEMENT_BASE,
  OPERATIONS_RELEASE_MANAGEMENT_FREEZE_VERSION,
  OPERATIONS_RELEASE_MANAGEMENT_ID,
  OPERATIONS_RELEASE_MANAGEMENT_VERSION,
} from "../release/release.constants";
import {
  OPERATIONS_P6_ENTERPRISE_SUPPORT_FREEZE_VERSION,
  OPERATIONS_ENTERPRISE_SUPPORT_BASE,
  OPERATIONS_ENTERPRISE_SUPPORT_FREEZE_VERSION,
  OPERATIONS_ENTERPRISE_SUPPORT_ID,
  OPERATIONS_ENTERPRISE_SUPPORT_VERSION,
} from "../support/support.constants";
import {
  ENTERPRISE_LAUNCH_COMPLETE_ID,
} from "../../launch/signoff/governance.freeze.lock";

export const OPERATIONS_P8_SIGNOFF_VERSION = "operations-p8-signoff-1" as const;
export const OPERATIONS_P8_GOVERNANCE_FREEZE_VERSION =
  "operations-p8-operations-governance-freeze-1" as const;

export const OPERATIONS_P8_GOVERNANCE_BASE =
  "enterprise-post-launch-p7-operations-control-plane-v1" as const;

export const OPERATIONS_GOVERNANCE_COMPLETE_ID =
  "enterprise-post-launch-operations-complete-v1" as const;

/** Stable alias for downstream consumers. */
export const ENTERPRISE_OPERATIONS_COMPLETE_ID =
  "enterprise-operations-complete-v1" as const;

export type OperationsP8ComponentId =
  | "p1-production"
  | "p2-customer-success"
  | "p3-incident"
  | "p4-release"
  | "p5-growth"
  | "p6-support"
  | "p7-control-plane"
  | "signoff";

export type OperationsP8ComponentLock = {
  id: OperationsP8ComponentId;
  path: string;
  label: string;
  required: true;
};

export type OperationsP8PhaseVersions = {
  p1: {
    id: typeof OPERATIONS_PRODUCTION_FOUNDATION_ID;
    version: typeof OPERATIONS_PRODUCTION_FOUNDATION_VERSION;
    freeze: typeof OPERATIONS_P1_PRODUCTION_FREEZE_VERSION;
    base: typeof OPERATIONS_PRODUCTION_FOUNDATION_BASE;
  };
  p2: {
    id: typeof OPERATIONS_CUSTOMER_SUCCESS_ID;
    version: typeof OPERATIONS_CUSTOMER_SUCCESS_VERSION;
    freeze: typeof OPERATIONS_P2_CUSTOMER_SUCCESS_FREEZE_VERSION;
    base: typeof OPERATIONS_CUSTOMER_SUCCESS_BASE;
  };
  p3: {
    id: typeof OPERATIONS_INCIDENT_RESPONSE_ID;
    version: typeof OPERATIONS_INCIDENT_RESPONSE_VERSION;
    freeze: typeof OPERATIONS_P3_INCIDENT_RESPONSE_FREEZE_VERSION;
    base: typeof OPERATIONS_INCIDENT_RESPONSE_BASE;
  };
  p4: {
    id: typeof OPERATIONS_RELEASE_MANAGEMENT_ID;
    version: typeof OPERATIONS_RELEASE_MANAGEMENT_VERSION;
    freeze: typeof OPERATIONS_P4_RELEASE_MANAGEMENT_FREEZE_VERSION;
    base: typeof OPERATIONS_RELEASE_MANAGEMENT_BASE;
  };
  p5: {
    id: typeof OPERATIONS_GROWTH_ANALYTICS_ID;
    version: typeof OPERATIONS_GROWTH_ANALYTICS_VERSION;
    freeze: typeof OPERATIONS_P5_GROWTH_ANALYTICS_FREEZE_VERSION;
    base: typeof OPERATIONS_GROWTH_ANALYTICS_BASE;
  };
  p6: {
    id: typeof OPERATIONS_ENTERPRISE_SUPPORT_ID;
    version: typeof OPERATIONS_ENTERPRISE_SUPPORT_VERSION;
    freeze: typeof OPERATIONS_P6_ENTERPRISE_SUPPORT_FREEZE_VERSION;
    base: typeof OPERATIONS_ENTERPRISE_SUPPORT_BASE;
  };
  p7: {
    id: typeof OPERATIONS_CONTROL_PLANE_ID;
    version: typeof OPERATIONS_CONTROL_PLANE_VERSION;
    freeze: typeof OPERATIONS_P7_CONTROL_FREEZE_VERSION;
    base: typeof OPERATIONS_CONTROL_PLANE_BASE;
  };
};

export type OperationsP8FreezeLock = {
  version: typeof OPERATIONS_P8_GOVERNANCE_FREEZE_VERSION;
  base: typeof OPERATIONS_P8_GOVERNANCE_BASE;
  completeId: typeof OPERATIONS_GOVERNANCE_COMPLETE_ID;
  completeAlias: typeof ENTERPRISE_OPERATIONS_COMPLETE_ID;
  signoff: typeof OPERATIONS_P8_SIGNOFF_VERSION;
  launchBaseline: typeof ENTERPRISE_LAUNCH_COMPLETE_ID;
  e12Baseline: "enterprise-e12-productization-complete-v1";
  platformBaseline: "enterprise-platform-v1-complete";
  phases: OperationsP8PhaseVersions;
  components: OperationsP8ComponentLock[];
};

export const OPERATIONS_P8_EXPECTED_BASE_CHAIN = {
  p1: "enterprise-launch-complete-v1",
  p2: "enterprise-post-launch-p1-production-operations-foundation-v1",
  p3: "enterprise-post-launch-p2-customer-success-operations-v1",
  p4: "enterprise-post-launch-p3-incident-response-operations-v1",
  p5: "enterprise-post-launch-p4-release-management-operations-v1",
  p6: "enterprise-post-launch-p5-growth-analytics-operations-v1",
  p7: "enterprise-post-launch-p6-enterprise-support-operations-v1",
  governance: "enterprise-post-launch-p7-operations-control-plane-v1",
} as const;

export const OPERATIONS_P8_COMPONENT_LOCK: OperationsP8ComponentLock[] = [
  {
    id: "p1-production",
    path: "lib/operations/production/",
    label: "Post-Launch P1 Production Operations Foundation",
    required: true,
  },
  {
    id: "p2-customer-success",
    path: "lib/operations/customer-success/",
    label: "Post-Launch P2 Customer Success Operations",
    required: true,
  },
  {
    id: "p3-incident",
    path: "lib/operations/incident/",
    label: "Post-Launch P3 Incident Response Operations",
    required: true,
  },
  {
    id: "p4-release",
    path: "lib/operations/release/",
    label: "Post-Launch P4 Release Management Operations",
    required: true,
  },
  {
    id: "p5-growth",
    path: "lib/operations/growth/",
    label: "Post-Launch P5 Growth Analytics Operations",
    required: true,
  },
  {
    id: "p6-support",
    path: "lib/operations/support/",
    label: "Post-Launch P6 Enterprise Support Operations",
    required: true,
  },
  {
    id: "p7-control-plane",
    path: "lib/operations/control/",
    label: "Post-Launch P7 Operations Control Plane",
    required: true,
  },
  {
    id: "signoff",
    path: "lib/operations/signoff/",
    label: "Post-Launch P8 Operations Governance Freeze",
    required: true,
  },
];

export const OPERATIONS_P8_PHASE_VERSIONS: OperationsP8PhaseVersions = {
  p1: {
    id: OPERATIONS_PRODUCTION_FOUNDATION_ID,
    version: OPERATIONS_PRODUCTION_FOUNDATION_VERSION,
    freeze: OPERATIONS_P1_PRODUCTION_FREEZE_VERSION,
    base: OPERATIONS_PRODUCTION_FOUNDATION_BASE,
  },
  p2: {
    id: OPERATIONS_CUSTOMER_SUCCESS_ID,
    version: OPERATIONS_CUSTOMER_SUCCESS_VERSION,
    freeze: OPERATIONS_P2_CUSTOMER_SUCCESS_FREEZE_VERSION,
    base: OPERATIONS_CUSTOMER_SUCCESS_BASE,
  },
  p3: {
    id: OPERATIONS_INCIDENT_RESPONSE_ID,
    version: OPERATIONS_INCIDENT_RESPONSE_VERSION,
    freeze: OPERATIONS_P3_INCIDENT_RESPONSE_FREEZE_VERSION,
    base: OPERATIONS_INCIDENT_RESPONSE_BASE,
  },
  p4: {
    id: OPERATIONS_RELEASE_MANAGEMENT_ID,
    version: OPERATIONS_RELEASE_MANAGEMENT_VERSION,
    freeze: OPERATIONS_P4_RELEASE_MANAGEMENT_FREEZE_VERSION,
    base: OPERATIONS_RELEASE_MANAGEMENT_BASE,
  },
  p5: {
    id: OPERATIONS_GROWTH_ANALYTICS_ID,
    version: OPERATIONS_GROWTH_ANALYTICS_VERSION,
    freeze: OPERATIONS_P5_GROWTH_ANALYTICS_FREEZE_VERSION,
    base: OPERATIONS_GROWTH_ANALYTICS_BASE,
  },
  p6: {
    id: OPERATIONS_ENTERPRISE_SUPPORT_ID,
    version: OPERATIONS_ENTERPRISE_SUPPORT_VERSION,
    freeze: OPERATIONS_P6_ENTERPRISE_SUPPORT_FREEZE_VERSION,
    base: OPERATIONS_ENTERPRISE_SUPPORT_BASE,
  },
  p7: {
    id: OPERATIONS_CONTROL_PLANE_ID,
    version: OPERATIONS_CONTROL_PLANE_VERSION,
    freeze: OPERATIONS_P7_CONTROL_FREEZE_VERSION,
    base: OPERATIONS_CONTROL_PLANE_BASE,
  },
};

export const OPERATIONS_P8_FREEZE_LOCK: OperationsP8FreezeLock = {
  version: OPERATIONS_P8_GOVERNANCE_FREEZE_VERSION,
  base: OPERATIONS_P8_GOVERNANCE_BASE,
  completeId: OPERATIONS_GOVERNANCE_COMPLETE_ID,
  completeAlias: ENTERPRISE_OPERATIONS_COMPLETE_ID,
  signoff: OPERATIONS_P8_SIGNOFF_VERSION,
  launchBaseline: ENTERPRISE_LAUNCH_COMPLETE_ID,
  e12Baseline: "enterprise-e12-productization-complete-v1",
  platformBaseline: "enterprise-platform-v1-complete",
  phases: OPERATIONS_P8_PHASE_VERSIONS,
  components: OPERATIONS_P8_COMPONENT_LOCK,
};

export const EXPECTED_OPERATIONS_P8_FREEZE_LOCK: OperationsP8FreezeLock =
  OPERATIONS_P8_FREEZE_LOCK;

export function isOperationsP8FreezeLockIntact(): boolean {
  const lock = OPERATIONS_P8_FREEZE_LOCK;
  const phaseKeys = ["p1", "p2", "p3", "p4", "p5", "p6", "p7"] as const;
  const phasesOk = phaseKeys.every((key) => {
    const phase = lock.phases[key];
    return (
      phase.id.length > 0 &&
      phase.version.length > 0 &&
      phase.freeze.length > 0 &&
      phase.base.length > 0
    );
  });

  return (
    typeof lock.version === "string" &&
    lock.version.length > 0 &&
    typeof lock.base === "string" &&
    lock.base.length > 0 &&
    typeof lock.completeId === "string" &&
    lock.completeId.length > 0 &&
    typeof lock.completeAlias === "string" &&
    lock.completeAlias.length > 0 &&
    typeof lock.signoff === "string" &&
    lock.signoff.length > 0 &&
    lock.launchBaseline === "enterprise-launch-complete-v1" &&
    lock.e12Baseline === "enterprise-e12-productization-complete-v1" &&
    lock.platformBaseline === "enterprise-platform-v1-complete" &&
    phasesOk &&
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

export function operationsP8FreezeLockMatchesExpected(): boolean {
  const lock = OPERATIONS_P8_FREEZE_LOCK;
  const expected = EXPECTED_OPERATIONS_P8_FREEZE_LOCK;
  const phaseKeys = ["p1", "p2", "p3", "p4", "p5", "p6", "p7"] as const;

  return (
    lock.version === expected.version &&
    lock.base === expected.base &&
    lock.completeId === expected.completeId &&
    lock.completeAlias === expected.completeAlias &&
    lock.signoff === expected.signoff &&
    lock.launchBaseline === expected.launchBaseline &&
    lock.e12Baseline === expected.e12Baseline &&
    lock.platformBaseline === expected.platformBaseline &&
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

export function validateOperationsP8DependencyChain(): {
  ok: boolean;
  failures: string[];
} {
  const expected = OPERATIONS_P8_EXPECTED_BASE_CHAIN;
  const phases = OPERATIONS_P8_FREEZE_LOCK.phases;
  const failures: string[] = [];

  if (phases.p1.base !== expected.p1) {
    failures.push(`p1 base expected=${expected.p1}`);
  }
  if (phases.p2.base !== expected.p2) {
    failures.push(`p2 base expected=${expected.p2}`);
  }
  if (phases.p3.base !== expected.p3) {
    failures.push(`p3 base expected=${expected.p3}`);
  }
  if (phases.p4.base !== expected.p4) {
    failures.push(`p4 base expected=${expected.p4}`);
  }
  if (phases.p5.base !== expected.p5) {
    failures.push(`p5 base expected=${expected.p5}`);
  }
  if (phases.p6.base !== expected.p6) {
    failures.push(`p6 base expected=${expected.p6}`);
  }
  if (phases.p7.base !== expected.p7) {
    failures.push(`p7 base expected=${expected.p7}`);
  }
  if (OPERATIONS_P8_GOVERNANCE_BASE !== expected.governance) {
    failures.push(`governance base expected=${expected.governance}`);
  }

  if (phases.p1.base !== ENTERPRISE_LAUNCH_COMPLETE_ID) {
    failures.push("p1 base must equal enterprise-launch-complete-v1");
  }
  if (phases.p2.base !== phases.p1.id) {
    failures.push("p2 base must equal p1 id");
  }
  if (phases.p3.base !== phases.p2.id) {
    failures.push("p3 base must equal p2 id");
  }
  if (phases.p4.base !== phases.p3.id) {
    failures.push("p4 base must equal p3 id");
  }
  if (phases.p5.base !== phases.p4.id) {
    failures.push("p5 base must equal p4 id");
  }
  if (phases.p6.base !== phases.p5.id) {
    failures.push("p6 base must equal p5 id");
  }
  if (phases.p7.base !== phases.p6.id) {
    failures.push("p7 base must equal p6 id");
  }
  if (OPERATIONS_P8_GOVERNANCE_BASE !== phases.p7.id) {
    failures.push("governance base must equal p7 id");
  }

  if (
    OPERATIONS_PRODUCTION_FOUNDATION_FREEZE_VERSION !==
    "operations-production-foundation-freeze-1"
  ) {
    failures.push("p1 foundation freeze mismatch");
  }
  if (
    OPERATIONS_CUSTOMER_SUCCESS_FREEZE_VERSION !==
    "operations-customer-success-freeze-1"
  ) {
    failures.push("p2 customer success freeze mismatch");
  }
  if (
    OPERATIONS_INCIDENT_RESPONSE_FREEZE_VERSION !==
    "operations-incident-response-freeze-1"
  ) {
    failures.push("p3 incident freeze mismatch");
  }
  if (
    OPERATIONS_RELEASE_MANAGEMENT_FREEZE_VERSION !==
    "operations-release-management-freeze-1"
  ) {
    failures.push("p4 release freeze mismatch");
  }
  if (
    OPERATIONS_GROWTH_ANALYTICS_FREEZE_VERSION !==
    "operations-growth-analytics-freeze-1"
  ) {
    failures.push("p5 growth freeze mismatch");
  }
  if (
    OPERATIONS_ENTERPRISE_SUPPORT_FREEZE_VERSION !==
    "operations-enterprise-support-freeze-1"
  ) {
    failures.push("p6 support freeze mismatch");
  }
  if (
    OPERATIONS_CONTROL_PLANE_FREEZE_VERSION !==
    "operations-control-plane-freeze-1"
  ) {
    failures.push("p7 control freeze mismatch");
  }

  return { ok: failures.length === 0, failures };
}
