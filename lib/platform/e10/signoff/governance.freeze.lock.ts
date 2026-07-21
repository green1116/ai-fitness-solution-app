/**
 * E10-P8 — Platform Governance Freeze Lock (read-only)
 * Locks E10 P1–P7 versions + dependency chain
 * BASE: enterprise-e10-p7-platform-os-v1
 */

import {
  E10_PLATFORM_BASE,
  E10_PLATFORM_FREEZE_VERSION,
  E10_PLATFORM_ID,
  E10_PLATFORM_VERSION,
} from "../core/platform.constants";
import {
  E10_EVENT_BASE,
  E10_EVENT_FREEZE_VERSION,
  E10_EVENT_ID,
  E10_EVENT_VERSION,
} from "../event/event.constants";
import {
  E10_GATEWAY_BASE,
  E10_GATEWAY_FREEZE_VERSION,
  E10_GATEWAY_ID,
  E10_GATEWAY_VERSION,
} from "../gateway/gateway.constants";
import {
  E10_MARKETPLACE_BASE,
  E10_MARKETPLACE_FREEZE_VERSION,
  E10_MARKETPLACE_ID,
  E10_MARKETPLACE_VERSION,
} from "../marketplace/marketplace.constants";
import {
  E10_OS_BASE,
  E10_OS_FREEZE_VERSION,
  E10_OS_ID,
  E10_OS_VERSION,
} from "../os/os.constants";
import {
  E10_RESOURCE_BASE,
  E10_RESOURCE_FREEZE_VERSION,
  E10_RESOURCE_ID,
  E10_RESOURCE_VERSION,
} from "../resource/resource.constants";
import {
  E10_RUNTIME_BASE,
  E10_RUNTIME_FREEZE_VERSION,
  E10_RUNTIME_ID,
  E10_RUNTIME_VERSION,
} from "../runtime/runtime.constants";

export const E10_P8_SIGNOFF_VERSION = "e10-p8-signoff-1" as const;
export const E10_P8_PLATFORM_FREEZE_VERSION =
  "e10-p8-governance-freeze-1" as const;

export const E10_P8_GOVERNANCE_BASE =
  "enterprise-e10-p7-platform-os-v1" as const;

export type E10P8ComponentId =
  | "p1-foundation"
  | "p2-runtime"
  | "p3-resource"
  | "p4-event"
  | "p5-gateway"
  | "p6-marketplace"
  | "p7-os"
  | "signoff";

export type E10P8ComponentLock = {
  id: E10P8ComponentId;
  path: string;
  label: string;
  required: true;
};

export type E10P8PhaseVersions = {
  p1: {
    id: typeof E10_PLATFORM_ID;
    version: typeof E10_PLATFORM_VERSION;
    freeze: typeof E10_PLATFORM_FREEZE_VERSION;
    base: typeof E10_PLATFORM_BASE;
  };
  p2: {
    id: typeof E10_RUNTIME_ID;
    version: typeof E10_RUNTIME_VERSION;
    freeze: typeof E10_RUNTIME_FREEZE_VERSION;
    base: typeof E10_RUNTIME_BASE;
  };
  p3: {
    id: typeof E10_RESOURCE_ID;
    version: typeof E10_RESOURCE_VERSION;
    freeze: typeof E10_RESOURCE_FREEZE_VERSION;
    base: typeof E10_RESOURCE_BASE;
  };
  p4: {
    id: typeof E10_EVENT_ID;
    version: typeof E10_EVENT_VERSION;
    freeze: typeof E10_EVENT_FREEZE_VERSION;
    base: typeof E10_EVENT_BASE;
  };
  p5: {
    id: typeof E10_GATEWAY_ID;
    version: typeof E10_GATEWAY_VERSION;
    freeze: typeof E10_GATEWAY_FREEZE_VERSION;
    base: typeof E10_GATEWAY_BASE;
  };
  p6: {
    id: typeof E10_MARKETPLACE_ID;
    version: typeof E10_MARKETPLACE_VERSION;
    freeze: typeof E10_MARKETPLACE_FREEZE_VERSION;
    base: typeof E10_MARKETPLACE_BASE;
  };
  p7: {
    id: typeof E10_OS_ID;
    version: typeof E10_OS_VERSION;
    freeze: typeof E10_OS_FREEZE_VERSION;
    base: typeof E10_OS_BASE;
  };
};

export type E10P8FreezeLock = {
  version: typeof E10_P8_PLATFORM_FREEZE_VERSION;
  base: typeof E10_P8_GOVERNANCE_BASE;
  platformId: typeof E10_PLATFORM_ID;
  osId: typeof E10_OS_ID;
  signoff: typeof E10_P8_SIGNOFF_VERSION;
  phases: E10P8PhaseVersions;
  components: E10P8ComponentLock[];
};

/** Expected dependency chain (P2←P1 … P7←P6). */
export const E10_P8_EXPECTED_BASE_CHAIN = {
  p1: "enterprise-e09-global-autonomous-enterprise-network-freeze-v1",
  p2: "enterprise-e10-p1-platform-foundation-v1",
  p3: "enterprise-e10-p2-platform-runtime-v1",
  p4: "enterprise-e10-p3-platform-resource-v1",
  p5: "enterprise-e10-p4-platform-event-v1",
  p6: "enterprise-e10-p5-platform-gateway-v1",
  p7: "enterprise-e10-p6-platform-marketplace-v1",
} as const;

export const E10_P8_COMPONENT_LOCK: E10P8ComponentLock[] = [
  {
    id: "p1-foundation",
    path: "lib/platform/e10/core/",
    label: "E10-P1 Platform Foundation",
    required: true,
  },
  {
    id: "p2-runtime",
    path: "lib/platform/e10/runtime/",
    label: "E10-P2 Platform Runtime",
    required: true,
  },
  {
    id: "p3-resource",
    path: "lib/platform/e10/resource/",
    label: "E10-P3 Platform Resource Manager",
    required: true,
  },
  {
    id: "p4-event",
    path: "lib/platform/e10/event/",
    label: "E10-P4 Platform Event Bus",
    required: true,
  },
  {
    id: "p5-gateway",
    path: "lib/platform/e10/gateway/",
    label: "E10-P5 Platform API Gateway",
    required: true,
  },
  {
    id: "p6-marketplace",
    path: "lib/platform/e10/marketplace/",
    label: "E10-P6 Platform Marketplace",
    required: true,
  },
  {
    id: "p7-os",
    path: "lib/platform/e10/os/",
    label: "E10-P7 Enterprise Platform OS",
    required: true,
  },
  {
    id: "signoff",
    path: "lib/platform/e10/signoff/",
    label: "E10-P8 Governance Freeze Gate",
    required: true,
  },
];

export const E10_P8_PHASE_VERSIONS: E10P8PhaseVersions = {
  p1: {
    id: E10_PLATFORM_ID,
    version: E10_PLATFORM_VERSION,
    freeze: E10_PLATFORM_FREEZE_VERSION,
    base: E10_PLATFORM_BASE,
  },
  p2: {
    id: E10_RUNTIME_ID,
    version: E10_RUNTIME_VERSION,
    freeze: E10_RUNTIME_FREEZE_VERSION,
    base: E10_RUNTIME_BASE,
  },
  p3: {
    id: E10_RESOURCE_ID,
    version: E10_RESOURCE_VERSION,
    freeze: E10_RESOURCE_FREEZE_VERSION,
    base: E10_RESOURCE_BASE,
  },
  p4: {
    id: E10_EVENT_ID,
    version: E10_EVENT_VERSION,
    freeze: E10_EVENT_FREEZE_VERSION,
    base: E10_EVENT_BASE,
  },
  p5: {
    id: E10_GATEWAY_ID,
    version: E10_GATEWAY_VERSION,
    freeze: E10_GATEWAY_FREEZE_VERSION,
    base: E10_GATEWAY_BASE,
  },
  p6: {
    id: E10_MARKETPLACE_ID,
    version: E10_MARKETPLACE_VERSION,
    freeze: E10_MARKETPLACE_FREEZE_VERSION,
    base: E10_MARKETPLACE_BASE,
  },
  p7: {
    id: E10_OS_ID,
    version: E10_OS_VERSION,
    freeze: E10_OS_FREEZE_VERSION,
    base: E10_OS_BASE,
  },
};

export const E10_P8_FREEZE_LOCK: E10P8FreezeLock = {
  version: E10_P8_PLATFORM_FREEZE_VERSION,
  base: E10_P8_GOVERNANCE_BASE,
  platformId: E10_PLATFORM_ID,
  osId: E10_OS_ID,
  signoff: E10_P8_SIGNOFF_VERSION,
  phases: E10_P8_PHASE_VERSIONS,
  components: E10_P8_COMPONENT_LOCK,
};

export const EXPECTED_E10_P8_FREEZE_LOCK: E10P8FreezeLock = E10_P8_FREEZE_LOCK;

export function isE10P8FreezeLockIntact(): boolean {
  const lock = E10_P8_FREEZE_LOCK;
  const phaseOk = (
    Object.keys(lock.phases) as Array<keyof E10P8PhaseVersions>
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
    typeof lock.platformId === "string" &&
    lock.platformId.length > 0 &&
    typeof lock.osId === "string" &&
    lock.osId.length > 0 &&
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

export function e10P8FreezeLockMatchesExpected(): boolean {
  const lock = E10_P8_FREEZE_LOCK;
  const expected = EXPECTED_E10_P8_FREEZE_LOCK;
  const phaseKeys = Object.keys(expected.phases) as Array<
    keyof E10P8PhaseVersions
  >;

  return (
    lock.version === expected.version &&
    lock.base === expected.base &&
    lock.platformId === expected.platformId &&
    lock.osId === expected.osId &&
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
export function validateE10P8DependencyChain(): {
  ok: boolean;
  failures: string[];
} {
  const phases = E10_P8_PHASE_VERSIONS;
  const expected = E10_P8_EXPECTED_BASE_CHAIN;
  const failures: string[] = [];

  const keys = Object.keys(expected) as Array<keyof typeof expected>;
  for (const key of keys) {
    if (phases[key].base !== expected[key]) {
      failures.push(
        `${key}.base expected=${expected[key]} actual=${phases[key].base}`,
      );
    }
  }

  if (E10_P8_GOVERNANCE_BASE !== "enterprise-e10-p7-platform-os-v1") {
    failures.push(
      `p8.base expected=enterprise-e10-p7-platform-os-v1 actual=${E10_P8_GOVERNANCE_BASE}`,
    );
  }

  return { ok: failures.length === 0, failures };
}
