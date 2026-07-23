/**
 * Operations O5 — Governance Freeze lock (read-only)
 * Freezes Operations O1–O4 versions + component lock
 * BASE: enterprise-operations-o4-growth-analytics-foundation-v1
 * Isolated namespace: lib/operations/o5
 */

import {
  OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_BASE,
  OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_FREEZE_VERSION,
  OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_ID,
  OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_VERSION,
  OPERATIONS_O1_SUCCESS_FREEZE_VERSION,
} from "../../o1/success/success.constants";
import {
  OPERATIONS_O2_USAGE_FREEZE_VERSION,
  OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_BASE,
  OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_FREEZE_VERSION,
  OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_ID,
  OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_VERSION,
} from "../../o2/usage/usage.constants";
import {
  OPERATIONS_O3_SUPPORT_FREEZE_VERSION,
  OPERATIONS_O3_SUPPORT_OPERATIONS_BASE,
  OPERATIONS_O3_SUPPORT_OPERATIONS_FREEZE_VERSION,
  OPERATIONS_O3_SUPPORT_OPERATIONS_ID,
  OPERATIONS_O3_SUPPORT_OPERATIONS_VERSION,
} from "../../o3/ticket/ticket.constants";
import {
  OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_BASE,
  OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_FREEZE_VERSION,
  OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_ID,
  OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_VERSION,
  OPERATIONS_O4_GROWTH_FREEZE_VERSION,
} from "../../o4/growth/growth.constants";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";

export const OPERATIONS_O5_SIGNOFF_VERSION = "operations-o5-signoff-1" as const;

export const OPERATIONS_O5_FREEZE_VERSION =
  "operations-o5-governance-freeze-1" as const;

export const OPERATIONS_O5_FREEZE_BASE =
  "enterprise-operations-o4-growth-analytics-foundation-v1" as const;

export const OPERATIONS_COMPLETE_ID =
  "enterprise-operations-complete-v1" as const;

/** Stable alias for downstream consumers. */
export const ENTERPRISE_OPERATIONS_COMPLETE_ID =
  "enterprise-operations-complete-v1" as const;

export type OperationsO5ComponentId =
  | "o1-customer-success"
  | "o2-usage-intelligence"
  | "o3-support-operations"
  | "o4-growth-analytics"
  | "o5-freeze";

export type OperationsO5ComponentLock = {
  id: OperationsO5ComponentId;
  path: string;
  label: string;
  required: true;
};

export type OperationsO5PhaseVersions = {
  o1: {
    id: typeof OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_ID;
    version: typeof OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_VERSION;
    freeze: typeof OPERATIONS_O1_SUCCESS_FREEZE_VERSION;
    base: typeof OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_BASE;
  };
  o2: {
    id: typeof OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_ID;
    version: typeof OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_VERSION;
    freeze: typeof OPERATIONS_O2_USAGE_FREEZE_VERSION;
    base: typeof OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_BASE;
  };
  o3: {
    id: typeof OPERATIONS_O3_SUPPORT_OPERATIONS_ID;
    version: typeof OPERATIONS_O3_SUPPORT_OPERATIONS_VERSION;
    freeze: typeof OPERATIONS_O3_SUPPORT_FREEZE_VERSION;
    base: typeof OPERATIONS_O3_SUPPORT_OPERATIONS_BASE;
  };
  o4: {
    id: typeof OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_ID;
    version: typeof OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_VERSION;
    freeze: typeof OPERATIONS_O4_GROWTH_FREEZE_VERSION;
    base: typeof OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_BASE;
  };
};

export type OperationsO5FreezeLock = {
  version: typeof OPERATIONS_O5_FREEZE_VERSION;
  base: typeof OPERATIONS_O5_FREEZE_BASE;
  completeId: typeof OPERATIONS_COMPLETE_ID;
  completeAlias: typeof ENTERPRISE_OPERATIONS_COMPLETE_ID;
  signoff: typeof OPERATIONS_O5_SIGNOFF_VERSION;
  launchReadinessBaseline: typeof ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID;
  commercializationBaseline: typeof ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID;
  evolutionBaseline: typeof ENTERPRISE_EVOLUTION_COMPLETE_ID;
  launchBaseline: typeof ENTERPRISE_LAUNCH_COMPLETE_ID;
  e12Baseline: "enterprise-e12-productization-complete-v1";
  platformBaseline: "enterprise-platform-v1-complete";
  phases: OperationsO5PhaseVersions;
  components: OperationsO5ComponentLock[];
  readOnly: true;
};

export const OPERATIONS_O5_COMPONENT_LOCK: OperationsO5ComponentLock[] = [
  {
    id: "o1-customer-success",
    path: "lib/operations/o1/",
    label: "Operations O1 Customer Success Foundation",
    required: true,
  },
  {
    id: "o2-usage-intelligence",
    path: "lib/operations/o2/",
    label: "Operations O2 Usage Intelligence Foundation",
    required: true,
  },
  {
    id: "o3-support-operations",
    path: "lib/operations/o3/",
    label: "Operations O3 Support Operations",
    required: true,
  },
  {
    id: "o4-growth-analytics",
    path: "lib/operations/o4/",
    label: "Operations O4 Growth Analytics Foundation",
    required: true,
  },
  {
    id: "o5-freeze",
    path: "lib/operations/o5/",
    label: "Operations O5 Governance Freeze",
    required: true,
  },
];

export const OPERATIONS_O5_PHASE_VERSIONS: OperationsO5PhaseVersions = {
  o1: {
    id: OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_ID,
    version: OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_VERSION,
    freeze: OPERATIONS_O1_SUCCESS_FREEZE_VERSION,
    base: OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_BASE,
  },
  o2: {
    id: OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_ID,
    version: OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_VERSION,
    freeze: OPERATIONS_O2_USAGE_FREEZE_VERSION,
    base: OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_BASE,
  },
  o3: {
    id: OPERATIONS_O3_SUPPORT_OPERATIONS_ID,
    version: OPERATIONS_O3_SUPPORT_OPERATIONS_VERSION,
    freeze: OPERATIONS_O3_SUPPORT_FREEZE_VERSION,
    base: OPERATIONS_O3_SUPPORT_OPERATIONS_BASE,
  },
  o4: {
    id: OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_ID,
    version: OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_VERSION,
    freeze: OPERATIONS_O4_GROWTH_FREEZE_VERSION,
    base: OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_BASE,
  },
};

export const OPERATIONS_O5_FREEZE_LOCK: OperationsO5FreezeLock = {
  version: OPERATIONS_O5_FREEZE_VERSION,
  base: OPERATIONS_O5_FREEZE_BASE,
  completeId: OPERATIONS_COMPLETE_ID,
  completeAlias: ENTERPRISE_OPERATIONS_COMPLETE_ID,
  signoff: OPERATIONS_O5_SIGNOFF_VERSION,
  launchReadinessBaseline: ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID,
  commercializationBaseline: ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID,
  evolutionBaseline: ENTERPRISE_EVOLUTION_COMPLETE_ID,
  launchBaseline: ENTERPRISE_LAUNCH_COMPLETE_ID,
  e12Baseline: "enterprise-e12-productization-complete-v1",
  platformBaseline: "enterprise-platform-v1-complete",
  phases: OPERATIONS_O5_PHASE_VERSIONS,
  components: OPERATIONS_O5_COMPONENT_LOCK,
  readOnly: true,
};

export const EXPECTED_OPERATIONS_O5_FREEZE_LOCK: OperationsO5FreezeLock =
  OPERATIONS_O5_FREEZE_LOCK;

export function isOperationsO5FreezeLockIntact(): boolean {
  const lock = OPERATIONS_O5_FREEZE_LOCK;
  const phaseKeys = ["o1", "o2", "o3", "o4"] as const;
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
    lock.readOnly === true &&
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
    lock.launchReadinessBaseline ===
      "enterprise-launch-readiness-complete-v1" &&
    lock.commercializationBaseline ===
      "enterprise-commercialization-complete-v1" &&
    lock.evolutionBaseline === "enterprise-evolution-complete-v1" &&
    lock.launchBaseline === "enterprise-launch-complete-v1" &&
    lock.e12Baseline === "enterprise-e12-productization-complete-v1" &&
    lock.platformBaseline === "enterprise-platform-v1-complete" &&
    phasesOk &&
    Array.isArray(lock.components) &&
    lock.components.length >= 5 &&
    lock.components.every(
      (c) =>
        typeof c.id === "string" &&
        typeof c.path === "string" &&
        typeof c.label === "string" &&
        c.required === true,
    )
  );
}

export function operationsO5FreezeLockMatchesExpected(): boolean {
  const lock = OPERATIONS_O5_FREEZE_LOCK;
  const expected = EXPECTED_OPERATIONS_O5_FREEZE_LOCK;
  const phaseKeys = ["o1", "o2", "o3", "o4"] as const;

  return (
    lock.version === expected.version &&
    lock.base === expected.base &&
    lock.completeId === expected.completeId &&
    lock.completeAlias === expected.completeAlias &&
    lock.signoff === expected.signoff &&
    lock.launchReadinessBaseline === expected.launchReadinessBaseline &&
    lock.commercializationBaseline === expected.commercializationBaseline &&
    lock.evolutionBaseline === expected.evolutionBaseline &&
    lock.launchBaseline === expected.launchBaseline &&
    lock.e12Baseline === expected.e12Baseline &&
    lock.platformBaseline === expected.platformBaseline &&
    lock.readOnly === expected.readOnly &&
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

export {
  OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_FREEZE_VERSION,
  OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_FREEZE_VERSION,
  OPERATIONS_O3_SUPPORT_OPERATIONS_FREEZE_VERSION,
  OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_FREEZE_VERSION,
};
