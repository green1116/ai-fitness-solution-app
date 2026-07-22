/**
 * Launch P8 — Commercial Release Freeze Lock (read-only)
 * Locks Launch P1–P7 versions + dependency chain
 * BASE: enterprise-launch-p7-launch-control-plane-v1
 */

import {
  LAUNCH_P7_CONTROL_FREEZE_VERSION,
  LAUNCH_CONTROL_PLANE_BASE,
  LAUNCH_CONTROL_PLANE_FREEZE_VERSION,
  LAUNCH_CONTROL_PLANE_ID,
  LAUNCH_CONTROL_PLANE_VERSION,
} from "../control/control.constants";
import {
  LAUNCH_P3_DEMO_FREEZE_VERSION,
  LAUNCH_DEMO_ENVIRONMENT_BASE,
  LAUNCH_DEMO_ENVIRONMENT_FREEZE_VERSION,
  LAUNCH_DEMO_ENVIRONMENT_ID,
  LAUNCH_DEMO_ENVIRONMENT_VERSION,
} from "../demo/demo.constants";
import {
  LAUNCH_P6_DOCUMENTATION_FREEZE_VERSION,
  LAUNCH_DOCUMENTATION_BASE,
  LAUNCH_DOCUMENTATION_FREEZE_VERSION,
  LAUNCH_DOCUMENTATION_ID,
  LAUNCH_DOCUMENTATION_VERSION,
} from "../documentation/documentation.constants";
import {
  LAUNCH_P1_PRODUCTION_FREEZE_VERSION,
  LAUNCH_PRODUCTION_FOUNDATION_BASE,
  LAUNCH_PRODUCTION_FOUNDATION_FREEZE_VERSION,
  LAUNCH_PRODUCTION_FOUNDATION_ID,
  LAUNCH_PRODUCTION_FOUNDATION_VERSION,
} from "../launch.constants";
import {
  LAUNCH_P2_ONBOARDING_FREEZE_VERSION,
  LAUNCH_CUSTOMER_ONBOARDING_BASE,
  LAUNCH_CUSTOMER_ONBOARDING_FREEZE_VERSION,
  LAUNCH_CUSTOMER_ONBOARDING_ID,
  LAUNCH_CUSTOMER_ONBOARDING_VERSION,
} from "../onboarding/onboarding.constants";
import {
  LAUNCH_P4_SECURITY_FREEZE_VERSION,
  LAUNCH_SECURITY_READINESS_BASE,
  LAUNCH_SECURITY_READINESS_FREEZE_VERSION,
  LAUNCH_SECURITY_READINESS_ID,
  LAUNCH_SECURITY_READINESS_VERSION,
} from "../security/security.constants";
import {
  LAUNCH_P5_SUPPORT_FREEZE_VERSION,
  LAUNCH_SLA_SUPPORT_BASE,
  LAUNCH_SLA_SUPPORT_FREEZE_VERSION,
  LAUNCH_SLA_SUPPORT_ID,
  LAUNCH_SLA_SUPPORT_VERSION,
} from "../support/support.constants";

export const LAUNCH_P8_SIGNOFF_VERSION = "launch-p8-signoff-1" as const;
export const LAUNCH_P8_COMMERCIAL_RELEASE_FREEZE_VERSION =
  "launch-p8-commercial-release-freeze-1" as const;

export const LAUNCH_P8_GOVERNANCE_BASE =
  "enterprise-launch-p7-launch-control-plane-v1" as const;

export const LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID =
  "enterprise-launch-commercial-release-complete-v1" as const;

/** Post-launch series root alias (stable BASE name for downstream layers). */
export const ENTERPRISE_LAUNCH_COMPLETE_ID =
  "enterprise-launch-complete-v1" as const;

export type LaunchP8ComponentId =
  | "p1-production"
  | "p2-onboarding"
  | "p3-demo"
  | "p4-security"
  | "p5-sla"
  | "p6-documentation"
  | "p7-control-plane"
  | "signoff";

export type LaunchP8ComponentLock = {
  id: LaunchP8ComponentId;
  path: string;
  label: string;
  required: true;
};

export type LaunchP8PhaseVersions = {
  p1: {
    id: typeof LAUNCH_PRODUCTION_FOUNDATION_ID;
    version: typeof LAUNCH_PRODUCTION_FOUNDATION_VERSION;
    freeze: typeof LAUNCH_P1_PRODUCTION_FREEZE_VERSION;
    base: typeof LAUNCH_PRODUCTION_FOUNDATION_BASE;
  };
  p2: {
    id: typeof LAUNCH_CUSTOMER_ONBOARDING_ID;
    version: typeof LAUNCH_CUSTOMER_ONBOARDING_VERSION;
    freeze: typeof LAUNCH_P2_ONBOARDING_FREEZE_VERSION;
    base: typeof LAUNCH_CUSTOMER_ONBOARDING_BASE;
  };
  p3: {
    id: typeof LAUNCH_DEMO_ENVIRONMENT_ID;
    version: typeof LAUNCH_DEMO_ENVIRONMENT_VERSION;
    freeze: typeof LAUNCH_P3_DEMO_FREEZE_VERSION;
    base: typeof LAUNCH_DEMO_ENVIRONMENT_BASE;
  };
  p4: {
    id: typeof LAUNCH_SECURITY_READINESS_ID;
    version: typeof LAUNCH_SECURITY_READINESS_VERSION;
    freeze: typeof LAUNCH_P4_SECURITY_FREEZE_VERSION;
    base: typeof LAUNCH_SECURITY_READINESS_BASE;
  };
  p5: {
    id: typeof LAUNCH_SLA_SUPPORT_ID;
    version: typeof LAUNCH_SLA_SUPPORT_VERSION;
    freeze: typeof LAUNCH_P5_SUPPORT_FREEZE_VERSION;
    base: typeof LAUNCH_SLA_SUPPORT_BASE;
  };
  p6: {
    id: typeof LAUNCH_DOCUMENTATION_ID;
    version: typeof LAUNCH_DOCUMENTATION_VERSION;
    freeze: typeof LAUNCH_P6_DOCUMENTATION_FREEZE_VERSION;
    base: typeof LAUNCH_DOCUMENTATION_BASE;
  };
  p7: {
    id: typeof LAUNCH_CONTROL_PLANE_ID;
    version: typeof LAUNCH_CONTROL_PLANE_VERSION;
    freeze: typeof LAUNCH_P7_CONTROL_FREEZE_VERSION;
    base: typeof LAUNCH_CONTROL_PLANE_BASE;
  };
};

export type LaunchP8FreezeLock = {
  version: typeof LAUNCH_P8_COMMERCIAL_RELEASE_FREEZE_VERSION;
  base: typeof LAUNCH_P8_GOVERNANCE_BASE;
  completeId: typeof LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID;
  signoff: typeof LAUNCH_P8_SIGNOFF_VERSION;
  e12Baseline: "enterprise-e12-productization-complete-v1";
  platformBaseline: "enterprise-platform-v1-complete";
  phases: LaunchP8PhaseVersions;
  components: LaunchP8ComponentLock[];
};

export const LAUNCH_P8_EXPECTED_BASE_CHAIN = {
  p1: "enterprise-e12-productization-complete-v1",
  p2: "enterprise-launch-p1-production-deployment-foundation-v1",
  p3: "enterprise-launch-p2-customer-onboarding-v1",
  p4: "enterprise-launch-p3-demo-environment-v1",
  p5: "enterprise-launch-p4-security-readiness-v1",
  p6: "enterprise-launch-p5-sla-support-v1",
  p7: "enterprise-launch-p6-documentation-v1",
  governance: "enterprise-launch-p7-launch-control-plane-v1",
} as const;

export const LAUNCH_P8_COMPONENT_LOCK: LaunchP8ComponentLock[] = [
  {
    id: "p1-production",
    path: "lib/launch/",
    label: "Launch P1 Production Deployment Foundation",
    required: true,
  },
  {
    id: "p2-onboarding",
    path: "lib/launch/onboarding/",
    label: "Launch P2 Customer Onboarding",
    required: true,
  },
  {
    id: "p3-demo",
    path: "lib/launch/demo/",
    label: "Launch P3 Demo Environment",
    required: true,
  },
  {
    id: "p4-security",
    path: "lib/launch/security/",
    label: "Launch P4 Security Readiness",
    required: true,
  },
  {
    id: "p5-sla",
    path: "lib/launch/support/",
    label: "Launch P5 SLA Support Package",
    required: true,
  },
  {
    id: "p6-documentation",
    path: "lib/launch/documentation/",
    label: "Launch P6 Documentation Package",
    required: true,
  },
  {
    id: "p7-control-plane",
    path: "lib/launch/control/",
    label: "Launch P7 Launch Control Plane",
    required: true,
  },
  {
    id: "signoff",
    path: "lib/launch/signoff/",
    label: "Launch P8 Final Release Freeze",
    required: true,
  },
];

export const LAUNCH_P8_PHASE_VERSIONS: LaunchP8PhaseVersions = {
  p1: {
    id: LAUNCH_PRODUCTION_FOUNDATION_ID,
    version: LAUNCH_PRODUCTION_FOUNDATION_VERSION,
    freeze: LAUNCH_P1_PRODUCTION_FREEZE_VERSION,
    base: LAUNCH_PRODUCTION_FOUNDATION_BASE,
  },
  p2: {
    id: LAUNCH_CUSTOMER_ONBOARDING_ID,
    version: LAUNCH_CUSTOMER_ONBOARDING_VERSION,
    freeze: LAUNCH_P2_ONBOARDING_FREEZE_VERSION,
    base: LAUNCH_CUSTOMER_ONBOARDING_BASE,
  },
  p3: {
    id: LAUNCH_DEMO_ENVIRONMENT_ID,
    version: LAUNCH_DEMO_ENVIRONMENT_VERSION,
    freeze: LAUNCH_P3_DEMO_FREEZE_VERSION,
    base: LAUNCH_DEMO_ENVIRONMENT_BASE,
  },
  p4: {
    id: LAUNCH_SECURITY_READINESS_ID,
    version: LAUNCH_SECURITY_READINESS_VERSION,
    freeze: LAUNCH_P4_SECURITY_FREEZE_VERSION,
    base: LAUNCH_SECURITY_READINESS_BASE,
  },
  p5: {
    id: LAUNCH_SLA_SUPPORT_ID,
    version: LAUNCH_SLA_SUPPORT_VERSION,
    freeze: LAUNCH_P5_SUPPORT_FREEZE_VERSION,
    base: LAUNCH_SLA_SUPPORT_BASE,
  },
  p6: {
    id: LAUNCH_DOCUMENTATION_ID,
    version: LAUNCH_DOCUMENTATION_VERSION,
    freeze: LAUNCH_P6_DOCUMENTATION_FREEZE_VERSION,
    base: LAUNCH_DOCUMENTATION_BASE,
  },
  p7: {
    id: LAUNCH_CONTROL_PLANE_ID,
    version: LAUNCH_CONTROL_PLANE_VERSION,
    freeze: LAUNCH_P7_CONTROL_FREEZE_VERSION,
    base: LAUNCH_CONTROL_PLANE_BASE,
  },
};

export const LAUNCH_P8_FREEZE_LOCK: LaunchP8FreezeLock = {
  version: LAUNCH_P8_COMMERCIAL_RELEASE_FREEZE_VERSION,
  base: LAUNCH_P8_GOVERNANCE_BASE,
  completeId: LAUNCH_COMMERCIAL_RELEASE_COMPLETE_ID,
  signoff: LAUNCH_P8_SIGNOFF_VERSION,
  e12Baseline: "enterprise-e12-productization-complete-v1",
  platformBaseline: "enterprise-platform-v1-complete",
  phases: LAUNCH_P8_PHASE_VERSIONS,
  components: LAUNCH_P8_COMPONENT_LOCK,
};

export const EXPECTED_LAUNCH_P8_FREEZE_LOCK: LaunchP8FreezeLock =
  LAUNCH_P8_FREEZE_LOCK;

export function isLaunchP8FreezeLockIntact(): boolean {
  const lock = LAUNCH_P8_FREEZE_LOCK;
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
    typeof lock.signoff === "string" &&
    lock.signoff.length > 0 &&
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

export function launchP8FreezeLockMatchesExpected(): boolean {
  const lock = LAUNCH_P8_FREEZE_LOCK;
  const expected = EXPECTED_LAUNCH_P8_FREEZE_LOCK;
  const phaseKeys = ["p1", "p2", "p3", "p4", "p5", "p6", "p7"] as const;

  return (
    lock.version === expected.version &&
    lock.base === expected.base &&
    lock.completeId === expected.completeId &&
    lock.signoff === expected.signoff &&
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

export function validateLaunchP8DependencyChain(): {
  ok: boolean;
  failures: string[];
} {
  const expected = LAUNCH_P8_EXPECTED_BASE_CHAIN;
  const phases = LAUNCH_P8_FREEZE_LOCK.phases;
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
  if (LAUNCH_P8_GOVERNANCE_BASE !== expected.governance) {
    failures.push(`governance base expected=${expected.governance}`);
  }

  // Sequential id ↔ next base
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
  if (LAUNCH_P8_GOVERNANCE_BASE !== phases.p7.id) {
    failures.push("governance base must equal p7 id");
  }

  // Layer freeze tags preserved
  if (
    LAUNCH_PRODUCTION_FOUNDATION_FREEZE_VERSION !==
    "launch-production-foundation-freeze-1"
  ) {
    failures.push("p1 foundation freeze mismatch");
  }
  if (
    LAUNCH_CUSTOMER_ONBOARDING_FREEZE_VERSION !==
    "launch-customer-onboarding-freeze-1"
  ) {
    failures.push("p2 onboarding freeze mismatch");
  }
  if (
    LAUNCH_DEMO_ENVIRONMENT_FREEZE_VERSION !==
    "launch-demo-environment-freeze-1"
  ) {
    failures.push("p3 demo freeze mismatch");
  }
  if (
    LAUNCH_SECURITY_READINESS_FREEZE_VERSION !==
    "launch-security-readiness-freeze-1"
  ) {
    failures.push("p4 security freeze mismatch");
  }
  if (LAUNCH_SLA_SUPPORT_FREEZE_VERSION !== "launch-sla-support-freeze-1") {
    failures.push("p5 sla freeze mismatch");
  }
  if (
    LAUNCH_DOCUMENTATION_FREEZE_VERSION !== "launch-documentation-freeze-1"
  ) {
    failures.push("p6 documentation freeze mismatch");
  }
  if (
    LAUNCH_CONTROL_PLANE_FREEZE_VERSION !== "launch-control-plane-freeze-1"
  ) {
    failures.push("p7 control freeze mismatch");
  }

  return { ok: failures.length === 0, failures };
}
