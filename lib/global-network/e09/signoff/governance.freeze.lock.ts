/**
 * E09-P8 — Global Network Governance Freeze Lock (read-only)
 * Platform freeze over E09 P1–P7 layers
 */

import {
  E09_AGENT_BASE,
  E09_AGENT_FREEZE_VERSION,
  E09_AGENT_ID,
  E09_AGENT_VERSION,
} from "../agent/agent.constants";
import {
  E09_CIVILIZATION_BASE,
  E09_CIVILIZATION_FREEZE_VERSION,
  E09_CIVILIZATION_ID,
  E09_CIVILIZATION_VERSION,
} from "../civilization/civilization.constants";
import {
  E09_GLOBAL_NETWORK_BASE,
  E09_GLOBAL_NETWORK_FREEZE_VERSION,
  E09_GLOBAL_NETWORK_PLATFORM_ID,
  E09_GLOBAL_NETWORK_VERSION,
} from "../core/global.constants";
import {
  E09_ECONOMY_BASE,
  E09_ECONOMY_FREEZE_VERSION,
  E09_ECONOMY_ID,
  E09_ECONOMY_VERSION,
} from "../economy/economy.constants";
import {
  E09_FEDERATION_BASE,
  E09_FEDERATION_FREEZE_VERSION,
  E09_FEDERATION_ID,
  E09_FEDERATION_VERSION,
} from "../federation/federation.constants";
import {
  E09_MARKET_BASE,
  E09_MARKET_FREEZE_VERSION,
  E09_MARKET_ID,
  E09_MARKET_VERSION,
} from "../market/market.constants";
import {
  E09_REGIONAL_BASE,
  E09_REGIONAL_FREEZE_VERSION,
  E09_REGIONAL_ID,
  E09_REGIONAL_VERSION,
} from "../regional/regional.constants";

export const E09_P8_SIGNOFF_VERSION = "e09-p8-signoff-1" as const;
export const E09_P8_PLATFORM_FREEZE_VERSION =
  "e09-p8-governance-freeze-1" as const;

export const E09_P8_GOVERNANCE_BASE =
  "enterprise-e09-p6-agent-freeze-v1" as const;

export type E09P8ComponentId =
  | "p1-global"
  | "p2-regional"
  | "p3-market"
  | "p4-federation"
  | "p5-economy"
  | "p6-agent"
  | "p7-civilization"
  | "signoff";

export type E09P8ComponentLock = {
  id: E09P8ComponentId;
  path: string;
  label: string;
  required: true;
};

export type E09P8PhaseVersions = {
  p1: {
    id: typeof E09_GLOBAL_NETWORK_PLATFORM_ID;
    version: typeof E09_GLOBAL_NETWORK_VERSION;
    freeze: typeof E09_GLOBAL_NETWORK_FREEZE_VERSION;
    base: typeof E09_GLOBAL_NETWORK_BASE;
  };
  p2: {
    id: typeof E09_REGIONAL_ID;
    version: typeof E09_REGIONAL_VERSION;
    freeze: typeof E09_REGIONAL_FREEZE_VERSION;
    base: typeof E09_REGIONAL_BASE;
  };
  p3: {
    id: typeof E09_MARKET_ID;
    version: typeof E09_MARKET_VERSION;
    freeze: typeof E09_MARKET_FREEZE_VERSION;
    base: typeof E09_MARKET_BASE;
  };
  p4: {
    id: typeof E09_FEDERATION_ID;
    version: typeof E09_FEDERATION_VERSION;
    freeze: typeof E09_FEDERATION_FREEZE_VERSION;
    base: typeof E09_FEDERATION_BASE;
  };
  p5: {
    id: typeof E09_ECONOMY_ID;
    version: typeof E09_ECONOMY_VERSION;
    freeze: typeof E09_ECONOMY_FREEZE_VERSION;
    base: typeof E09_ECONOMY_BASE;
  };
  p6: {
    id: typeof E09_AGENT_ID;
    version: typeof E09_AGENT_VERSION;
    freeze: typeof E09_AGENT_FREEZE_VERSION;
    base: typeof E09_AGENT_BASE;
  };
  p7: {
    id: typeof E09_CIVILIZATION_ID;
    version: typeof E09_CIVILIZATION_VERSION;
    freeze: typeof E09_CIVILIZATION_FREEZE_VERSION;
    base: typeof E09_CIVILIZATION_BASE;
  };
};

export type E09P8FreezeLock = {
  version: typeof E09_P8_PLATFORM_FREEZE_VERSION;
  base: typeof E09_P8_GOVERNANCE_BASE;
  platformId: typeof E09_GLOBAL_NETWORK_PLATFORM_ID;
  civilizationId: typeof E09_CIVILIZATION_ID;
  signoff: typeof E09_P8_SIGNOFF_VERSION;
  phases: E09P8PhaseVersions;
  components: E09P8ComponentLock[];
};

export const E09_P8_COMPONENT_LOCK: E09P8ComponentLock[] = [
  {
    id: "p1-global",
    path: "lib/global-network/e09/core/",
    label: "E09-P1 Global Network Foundation",
    required: true,
  },
  {
    id: "p2-regional",
    path: "lib/global-network/e09/regional/",
    label: "E09-P2 Regional Foundation",
    required: true,
  },
  {
    id: "p3-market",
    path: "lib/global-network/e09/market/",
    label: "E09-P3 Market Foundation",
    required: true,
  },
  {
    id: "p4-federation",
    path: "lib/global-network/e09/federation/",
    label: "E09-P4 Federation Foundation",
    required: true,
  },
  {
    id: "p5-economy",
    path: "lib/global-network/e09/economy/",
    label: "E09-P5 Autonomous Network Economy",
    required: true,
  },
  {
    id: "p6-agent",
    path: "lib/global-network/e09/agent/",
    label: "E09-P6 Global Agent Federation",
    required: true,
  },
  {
    id: "p7-civilization",
    path: "lib/global-network/e09/civilization/",
    label: "E09-P7 Enterprise Civilization OS",
    required: true,
  },
  {
    id: "signoff",
    path: "lib/global-network/e09/signoff/",
    label: "E09-P8 Governance Freeze Gate",
    required: true,
  },
];

export const E09_P8_PHASE_VERSIONS: E09P8PhaseVersions = {
  p1: {
    id: E09_GLOBAL_NETWORK_PLATFORM_ID,
    version: E09_GLOBAL_NETWORK_VERSION,
    freeze: E09_GLOBAL_NETWORK_FREEZE_VERSION,
    base: E09_GLOBAL_NETWORK_BASE,
  },
  p2: {
    id: E09_REGIONAL_ID,
    version: E09_REGIONAL_VERSION,
    freeze: E09_REGIONAL_FREEZE_VERSION,
    base: E09_REGIONAL_BASE,
  },
  p3: {
    id: E09_MARKET_ID,
    version: E09_MARKET_VERSION,
    freeze: E09_MARKET_FREEZE_VERSION,
    base: E09_MARKET_BASE,
  },
  p4: {
    id: E09_FEDERATION_ID,
    version: E09_FEDERATION_VERSION,
    freeze: E09_FEDERATION_FREEZE_VERSION,
    base: E09_FEDERATION_BASE,
  },
  p5: {
    id: E09_ECONOMY_ID,
    version: E09_ECONOMY_VERSION,
    freeze: E09_ECONOMY_FREEZE_VERSION,
    base: E09_ECONOMY_BASE,
  },
  p6: {
    id: E09_AGENT_ID,
    version: E09_AGENT_VERSION,
    freeze: E09_AGENT_FREEZE_VERSION,
    base: E09_AGENT_BASE,
  },
  p7: {
    id: E09_CIVILIZATION_ID,
    version: E09_CIVILIZATION_VERSION,
    freeze: E09_CIVILIZATION_FREEZE_VERSION,
    base: E09_CIVILIZATION_BASE,
  },
};

export const E09_P8_FREEZE_LOCK: E09P8FreezeLock = {
  version: E09_P8_PLATFORM_FREEZE_VERSION,
  base: E09_P8_GOVERNANCE_BASE,
  platformId: E09_GLOBAL_NETWORK_PLATFORM_ID,
  civilizationId: E09_CIVILIZATION_ID,
  signoff: E09_P8_SIGNOFF_VERSION,
  phases: E09_P8_PHASE_VERSIONS,
  components: E09_P8_COMPONENT_LOCK,
};

export const EXPECTED_E09_P8_FREEZE_LOCK: E09P8FreezeLock = E09_P8_FREEZE_LOCK;

export function isE09P8FreezeLockIntact(): boolean {
  const lock = E09_P8_FREEZE_LOCK;
  const phaseOk = (Object.keys(lock.phases) as Array<keyof E09P8PhaseVersions>).every(
    (key) => {
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
    },
  );

  return (
    typeof lock.version === "string" &&
    lock.version.length > 0 &&
    typeof lock.base === "string" &&
    lock.base.length > 0 &&
    typeof lock.platformId === "string" &&
    lock.platformId.length > 0 &&
    typeof lock.civilizationId === "string" &&
    lock.civilizationId.length > 0 &&
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

export function e09P8FreezeLockMatchesExpected(): boolean {
  const lock = E09_P8_FREEZE_LOCK;
  const expected = EXPECTED_E09_P8_FREEZE_LOCK;
  const phaseKeys = Object.keys(expected.phases) as Array<
    keyof E09P8PhaseVersions
  >;

  return (
    lock.version === expected.version &&
    lock.base === expected.base &&
    lock.platformId === expected.platformId &&
    lock.civilizationId === expected.civilizationId &&
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
