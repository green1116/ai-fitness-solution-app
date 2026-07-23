/**
 * Launch L5 — Launch Freeze lock (read-only)
 * Freezes Launch Readiness L1–L4 versions + component lock
 * BASE: enterprise-launch-l4-enterprise-delivery-validation-v1
 * Isolated namespace: lib/launch/readiness/l5
 */

import {
  LAUNCH_L1_DEMO_FOUNDATION_BASE,
  LAUNCH_L1_DEMO_FOUNDATION_FREEZE_VERSION,
  LAUNCH_L1_DEMO_FOUNDATION_ID,
  LAUNCH_L1_DEMO_FOUNDATION_VERSION,
  LAUNCH_L1_DEMO_FREEZE_VERSION,
} from "../../l1/demo/demo.constants";
import {
  LAUNCH_L2_PILOT_CUSTOMER_FLOW_BASE,
  LAUNCH_L2_PILOT_CUSTOMER_FLOW_FREEZE_VERSION,
  LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID,
  LAUNCH_L2_PILOT_CUSTOMER_FLOW_VERSION,
  LAUNCH_L2_PILOT_FREEZE_VERSION,
} from "../../l2/pilot/pilot.constants";
import {
  LAUNCH_L3_HARDENING_FREEZE_VERSION,
  LAUNCH_L3_PRODUCTION_HARDENING_BASE,
  LAUNCH_L3_PRODUCTION_HARDENING_FREEZE_VERSION,
  LAUNCH_L3_PRODUCTION_HARDENING_ID,
  LAUNCH_L3_PRODUCTION_HARDENING_VERSION,
} from "../../l3/runtime/runtime.constants";
import {
  LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_BASE,
  LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_FREEZE_VERSION,
  LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_ID,
  LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_VERSION,
  LAUNCH_L4_VALIDATION_FREEZE_VERSION,
} from "../../l4/scenario/scenario.constants";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../signoff/governance.freeze.lock";

export const LAUNCH_L5_SIGNOFF_VERSION = "launch-l5-signoff-1" as const;

export const LAUNCH_L5_FREEZE_VERSION =
  "launch-l5-launch-freeze-1" as const;

export const LAUNCH_L5_FREEZE_BASE =
  "enterprise-launch-l4-enterprise-delivery-validation-v1" as const;

export const LAUNCH_READINESS_COMPLETE_ID =
  "enterprise-launch-readiness-complete-v1" as const;

/** Stable alias for downstream consumers. */
export const ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID =
  "enterprise-launch-readiness-complete-v1" as const;

export type LaunchL5ComponentId =
  | "l1-demo"
  | "l2-pilot"
  | "l3-hardening"
  | "l4-validation"
  | "l5-freeze";

export type LaunchL5ComponentLock = {
  id: LaunchL5ComponentId;
  path: string;
  label: string;
  required: true;
};

export type LaunchL5PhaseVersions = {
  l1: {
    id: typeof LAUNCH_L1_DEMO_FOUNDATION_ID;
    version: typeof LAUNCH_L1_DEMO_FOUNDATION_VERSION;
    freeze: typeof LAUNCH_L1_DEMO_FREEZE_VERSION;
    base: typeof LAUNCH_L1_DEMO_FOUNDATION_BASE;
  };
  l2: {
    id: typeof LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID;
    version: typeof LAUNCH_L2_PILOT_CUSTOMER_FLOW_VERSION;
    freeze: typeof LAUNCH_L2_PILOT_FREEZE_VERSION;
    base: typeof LAUNCH_L2_PILOT_CUSTOMER_FLOW_BASE;
  };
  l3: {
    id: typeof LAUNCH_L3_PRODUCTION_HARDENING_ID;
    version: typeof LAUNCH_L3_PRODUCTION_HARDENING_VERSION;
    freeze: typeof LAUNCH_L3_HARDENING_FREEZE_VERSION;
    base: typeof LAUNCH_L3_PRODUCTION_HARDENING_BASE;
  };
  l4: {
    id: typeof LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_ID;
    version: typeof LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_VERSION;
    freeze: typeof LAUNCH_L4_VALIDATION_FREEZE_VERSION;
    base: typeof LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_BASE;
  };
};

export type LaunchL5FreezeLock = {
  version: typeof LAUNCH_L5_FREEZE_VERSION;
  base: typeof LAUNCH_L5_FREEZE_BASE;
  completeId: typeof LAUNCH_READINESS_COMPLETE_ID;
  completeAlias: typeof ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID;
  signoff: typeof LAUNCH_L5_SIGNOFF_VERSION;
  commercializationBaseline: typeof ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID;
  evolutionBaseline: typeof ENTERPRISE_EVOLUTION_COMPLETE_ID;
  launchBaseline: typeof ENTERPRISE_LAUNCH_COMPLETE_ID;
  e12Baseline: "enterprise-e12-productization-complete-v1";
  platformBaseline: "enterprise-platform-v1-complete";
  phases: LaunchL5PhaseVersions;
  components: LaunchL5ComponentLock[];
  readOnly: true;
};

export const LAUNCH_L5_COMPONENT_LOCK: LaunchL5ComponentLock[] = [
  {
    id: "l1-demo",
    path: "lib/launch/readiness/l1/",
    label: "Launch L1 Demo Foundation",
    required: true,
  },
  {
    id: "l2-pilot",
    path: "lib/launch/readiness/l2/",
    label: "Launch L2 Pilot Customer Flow",
    required: true,
  },
  {
    id: "l3-hardening",
    path: "lib/launch/readiness/l3/",
    label: "Launch L3 Production Hardening",
    required: true,
  },
  {
    id: "l4-validation",
    path: "lib/launch/readiness/l4/",
    label: "Launch L4 Enterprise Delivery Validation",
    required: true,
  },
  {
    id: "l5-freeze",
    path: "lib/launch/readiness/l5/",
    label: "Launch L5 Launch Freeze",
    required: true,
  },
];

export const LAUNCH_L5_PHASE_VERSIONS: LaunchL5PhaseVersions = {
  l1: {
    id: LAUNCH_L1_DEMO_FOUNDATION_ID,
    version: LAUNCH_L1_DEMO_FOUNDATION_VERSION,
    freeze: LAUNCH_L1_DEMO_FREEZE_VERSION,
    base: LAUNCH_L1_DEMO_FOUNDATION_BASE,
  },
  l2: {
    id: LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID,
    version: LAUNCH_L2_PILOT_CUSTOMER_FLOW_VERSION,
    freeze: LAUNCH_L2_PILOT_FREEZE_VERSION,
    base: LAUNCH_L2_PILOT_CUSTOMER_FLOW_BASE,
  },
  l3: {
    id: LAUNCH_L3_PRODUCTION_HARDENING_ID,
    version: LAUNCH_L3_PRODUCTION_HARDENING_VERSION,
    freeze: LAUNCH_L3_HARDENING_FREEZE_VERSION,
    base: LAUNCH_L3_PRODUCTION_HARDENING_BASE,
  },
  l4: {
    id: LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_ID,
    version: LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_VERSION,
    freeze: LAUNCH_L4_VALIDATION_FREEZE_VERSION,
    base: LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_BASE,
  },
};

export const LAUNCH_L5_FREEZE_LOCK: LaunchL5FreezeLock = {
  version: LAUNCH_L5_FREEZE_VERSION,
  base: LAUNCH_L5_FREEZE_BASE,
  completeId: LAUNCH_READINESS_COMPLETE_ID,
  completeAlias: ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID,
  signoff: LAUNCH_L5_SIGNOFF_VERSION,
  commercializationBaseline: ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID,
  evolutionBaseline: ENTERPRISE_EVOLUTION_COMPLETE_ID,
  launchBaseline: ENTERPRISE_LAUNCH_COMPLETE_ID,
  e12Baseline: "enterprise-e12-productization-complete-v1",
  platformBaseline: "enterprise-platform-v1-complete",
  phases: LAUNCH_L5_PHASE_VERSIONS,
  components: LAUNCH_L5_COMPONENT_LOCK,
  readOnly: true,
};

export const EXPECTED_LAUNCH_L5_FREEZE_LOCK: LaunchL5FreezeLock =
  LAUNCH_L5_FREEZE_LOCK;

export function isLaunchL5FreezeLockIntact(): boolean {
  const lock = LAUNCH_L5_FREEZE_LOCK;
  const phaseKeys = ["l1", "l2", "l3", "l4"] as const;
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

export function launchL5FreezeLockMatchesExpected(): boolean {
  const lock = LAUNCH_L5_FREEZE_LOCK;
  const expected = EXPECTED_LAUNCH_L5_FREEZE_LOCK;
  const phaseKeys = ["l1", "l2", "l3", "l4"] as const;

  return (
    lock.version === expected.version &&
    lock.base === expected.base &&
    lock.completeId === expected.completeId &&
    lock.completeAlias === expected.completeAlias &&
    lock.signoff === expected.signoff &&
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
  LAUNCH_L1_DEMO_FOUNDATION_FREEZE_VERSION,
  LAUNCH_L2_PILOT_CUSTOMER_FLOW_FREEZE_VERSION,
  LAUNCH_L3_PRODUCTION_HARDENING_FREEZE_VERSION,
  LAUNCH_L4_ENTERPRISE_DELIVERY_VALIDATION_FREEZE_VERSION,
};
