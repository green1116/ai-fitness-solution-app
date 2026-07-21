/**
 * Platform v1 — Governance Freeze Lock (read-only)
 * Locks E09 / E10 / E11 complete + platform v1 alignment
 * BASE: platform-v1-alignment
 */

import {
  E09_P8_GOVERNANCE_BASE,
  E09_P8_PLATFORM_FREEZE_VERSION,
  E09_P8_SIGNOFF_VERSION,
} from "../../../global-network/e09/signoff/governance.freeze.lock";
import {
  E11_P8_CLOUD_RUNTIME_FREEZE_VERSION,
  E11_P8_GOVERNANCE_BASE,
  E11_P8_SIGNOFF_VERSION,
} from "../../../cloud-runtime/e11/signoff/governance.freeze.lock";
import {
  E10_P8_GOVERNANCE_BASE,
  E10_P8_PLATFORM_FREEZE_VERSION,
  E10_P8_SIGNOFF_VERSION,
} from "../../e10/signoff/governance.freeze.lock";
import {
  E09_ENTERPRISE_COMPLETE_ID,
  E10_ENTERPRISE_COMPLETE_ID,
  E11_ENTERPRISE_COMPLETE_ID,
  PLATFORM_V1_BASE,
  PLATFORM_V1_FREEZE_VERSION,
  PLATFORM_V1_ID,
  PLATFORM_V1_VERSION,
} from "../platform.v1.constants";

export const PLATFORM_V1_P8_SIGNOFF_VERSION = "platform-v1-p8-signoff-1" as const;
export const PLATFORM_V1_GOVERNANCE_FREEZE_VERSION =
  "platform-v1-governance-freeze-1" as const;

export const PLATFORM_V1_GOVERNANCE_BASE = "platform-v1-alignment" as const;

export type PlatformV1P8ComponentId =
  | "e09-complete"
  | "e10-complete"
  | "e11-complete"
  | "v1-alignment"
  | "signoff";

export type PlatformV1P8ComponentLock = {
  id: PlatformV1P8ComponentId;
  path: string;
  label: string;
  required: true;
};

export type PlatformV1EnterpriseComplete = {
  code: "E09" | "E10" | "E11";
  completeId: string;
  freezeVersion: string;
  signoffVersion: string;
  governanceBase: string;
};

export type PlatformV1P8FreezeLock = {
  version: typeof PLATFORM_V1_GOVERNANCE_FREEZE_VERSION;
  base: typeof PLATFORM_V1_GOVERNANCE_BASE;
  platformId: typeof PLATFORM_V1_ID;
  alignmentVersion: typeof PLATFORM_V1_VERSION;
  alignmentFreeze: typeof PLATFORM_V1_FREEZE_VERSION;
  alignmentBase: typeof PLATFORM_V1_BASE;
  signoff: typeof PLATFORM_V1_P8_SIGNOFF_VERSION;
  enterprise: {
    e09: PlatformV1EnterpriseComplete;
    e10: PlatformV1EnterpriseComplete;
    e11: PlatformV1EnterpriseComplete;
  };
  components: PlatformV1P8ComponentLock[];
};

export const PLATFORM_V1_P8_EXPECTED_COMPLETE_CHAIN = {
  e09: E09_ENTERPRISE_COMPLETE_ID,
  e10: E10_ENTERPRISE_COMPLETE_ID,
  e11: E11_ENTERPRISE_COMPLETE_ID,
  alignment: PLATFORM_V1_BASE,
} as const;

export const PLATFORM_V1_P8_COMPONENT_LOCK: PlatformV1P8ComponentLock[] = [
  {
    id: "e09-complete",
    path: "lib/global-network/e09/",
    label: "E09 Global Autonomous Enterprise Network (complete)",
    required: true,
  },
  {
    id: "e10-complete",
    path: "lib/platform/e10/",
    label: "E10 Autonomous Platform (complete)",
    required: true,
  },
  {
    id: "e11-complete",
    path: "lib/cloud-runtime/e11/",
    label: "E11 Cloud Runtime (complete)",
    required: true,
  },
  {
    id: "v1-alignment",
    path: "lib/platform/v1/",
    label: "Platform v1 alignment layer",
    required: true,
  },
  {
    id: "signoff",
    path: "lib/platform/v1/signoff/",
    label: "Platform v1 governance freeze gate",
    required: true,
  },
];

export const PLATFORM_V1_P8_ENTERPRISE_COMPLETE: PlatformV1P8FreezeLock["enterprise"] =
  {
    e09: {
      code: "E09",
      completeId: E09_ENTERPRISE_COMPLETE_ID,
      freezeVersion: E09_P8_PLATFORM_FREEZE_VERSION,
      signoffVersion: E09_P8_SIGNOFF_VERSION,
      governanceBase: E09_P8_GOVERNANCE_BASE,
    },
    e10: {
      code: "E10",
      completeId: E10_ENTERPRISE_COMPLETE_ID,
      freezeVersion: E10_P8_PLATFORM_FREEZE_VERSION,
      signoffVersion: E10_P8_SIGNOFF_VERSION,
      governanceBase: E10_P8_GOVERNANCE_BASE,
    },
    e11: {
      code: "E11",
      completeId: E11_ENTERPRISE_COMPLETE_ID,
      freezeVersion: E11_P8_CLOUD_RUNTIME_FREEZE_VERSION,
      signoffVersion: E11_P8_SIGNOFF_VERSION,
      governanceBase: E11_P8_GOVERNANCE_BASE,
    },
  };

export const PLATFORM_V1_P8_FREEZE_LOCK: PlatformV1P8FreezeLock = {
  version: PLATFORM_V1_GOVERNANCE_FREEZE_VERSION,
  base: PLATFORM_V1_GOVERNANCE_BASE,
  platformId: PLATFORM_V1_ID,
  alignmentVersion: PLATFORM_V1_VERSION,
  alignmentFreeze: PLATFORM_V1_FREEZE_VERSION,
  alignmentBase: PLATFORM_V1_BASE,
  signoff: PLATFORM_V1_P8_SIGNOFF_VERSION,
  enterprise: PLATFORM_V1_P8_ENTERPRISE_COMPLETE,
  components: PLATFORM_V1_P8_COMPONENT_LOCK,
};

export const EXPECTED_PLATFORM_V1_P8_FREEZE_LOCK: PlatformV1P8FreezeLock =
  PLATFORM_V1_P8_FREEZE_LOCK;

export function isPlatformV1P8FreezeLockIntact(): boolean {
  const lock = PLATFORM_V1_P8_FREEZE_LOCK;
  const enterpriseOk = (["e09", "e10", "e11"] as const).every((key) => {
    const entry = lock.enterprise[key];
    return (
      entry.completeId.length > 0 &&
      entry.freezeVersion.length > 0 &&
      entry.signoffVersion.length > 0 &&
      entry.governanceBase.length > 0
    );
  });

  return (
    typeof lock.version === "string" &&
    lock.version.length > 0 &&
    typeof lock.base === "string" &&
    lock.base.length > 0 &&
    typeof lock.platformId === "string" &&
    lock.platformId.length > 0 &&
    typeof lock.signoff === "string" &&
    lock.signoff.length > 0 &&
    enterpriseOk &&
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

export function platformV1P8FreezeLockMatchesExpected(): boolean {
  const lock = PLATFORM_V1_P8_FREEZE_LOCK;
  const expected = EXPECTED_PLATFORM_V1_P8_FREEZE_LOCK;
  const keys = ["e09", "e10", "e11"] as const;

  return (
    lock.version === expected.version &&
    lock.base === expected.base &&
    lock.platformId === expected.platformId &&
    lock.signoff === expected.signoff &&
    keys.every(
      (key) =>
        lock.enterprise[key].completeId === expected.enterprise[key].completeId &&
        lock.enterprise[key].freezeVersion ===
          expected.enterprise[key].freezeVersion &&
        lock.enterprise[key].signoffVersion ===
          expected.enterprise[key].signoffVersion,
    ) &&
    lock.components.length === expected.components.length &&
    lock.components.every(
      (c, i) =>
        c.id === expected.components[i]?.id &&
        c.path === expected.components[i]?.path,
    )
  );
}

export function validatePlatformV1P8CompleteChain(): {
  ok: boolean;
  failures: string[];
} {
  const expected = PLATFORM_V1_P8_EXPECTED_COMPLETE_CHAIN;
  const lock = PLATFORM_V1_P8_FREEZE_LOCK;
  const failures: string[] = [];

  if (lock.enterprise.e09.completeId !== expected.e09) {
    failures.push(`e09 complete expected=${expected.e09}`);
  }
  if (lock.enterprise.e10.completeId !== expected.e10) {
    failures.push(`e10 complete expected=${expected.e10}`);
  }
  if (lock.enterprise.e11.completeId !== expected.e11) {
    failures.push(`e11 complete expected=${expected.e11}`);
  }
  if (lock.alignmentBase !== expected.alignment) {
    failures.push(`alignment base expected=${expected.alignment}`);
  }
  if (PLATFORM_V1_GOVERNANCE_BASE !== "platform-v1-alignment") {
    failures.push(
      `governance base expected=platform-v1-alignment actual=${PLATFORM_V1_GOVERNANCE_BASE}`,
    );
  }

  return { ok: failures.length === 0, failures };
}
