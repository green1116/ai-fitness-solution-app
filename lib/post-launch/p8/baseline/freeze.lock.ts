/**
 * PL-8 — Post Launch freeze lock catalogue.
 * Lock records only — no runtime mutation.
 */

import {
  POST_LAUNCH_BASELINE_ID,
  POST_LAUNCH_FREEZE_ID,
  POST_LAUNCH_LAYER_IDS,
  POST_LAUNCH_MODULE_PATHS,
  POST_LAUNCH_PACKAGE_CHAIN,
  POST_LAUNCH_TAG_REF,
  type PostLaunchPackageId,
} from "./freeze.constants";

export const POST_LAUNCH_LOCK_IDS = [
  "LOCK-PL-2.1",
  "LOCK-PL-3",
  "LOCK-PL-4",
  "LOCK-PL-5",
  "LOCK-PL-6",
  "LOCK-PL-7",
  "LOCK-STACK",
] as const;

export type PostLaunchLockId = (typeof POST_LAUNCH_LOCK_IDS)[number];

export type PostLaunchFreezeLock = Readonly<{
  lockId: PostLaunchLockId;
  packageId: PostLaunchPackageId | "STACK";
  targetRef: string;
  modulePath: string;
  notes: string;
}>;

/**
 * Closed freeze locks — one per prior package + stack lock.
 */
export const POST_LAUNCH_FREEZE_LOCKS = [
  {
    lockId: "LOCK-PL-2.1",
    packageId: "PL-2.1",
    targetRef: POST_LAUNCH_LAYER_IDS["PL-2.1"],
    modulePath: POST_LAUNCH_MODULE_PATHS["PL-2.1"],
    notes: "Lock PL-2.1 service monitoring",
  },
  {
    lockId: "LOCK-PL-3",
    packageId: "PL-3",
    targetRef: POST_LAUNCH_LAYER_IDS["PL-3"],
    modulePath: POST_LAUNCH_MODULE_PATHS["PL-3"],
    notes: "Lock PL-3 incident management",
  },
  {
    lockId: "LOCK-PL-4",
    packageId: "PL-4",
    targetRef: POST_LAUNCH_LAYER_IDS["PL-4"],
    modulePath: POST_LAUNCH_MODULE_PATHS["PL-4"],
    notes: "Lock PL-4 release operations",
  },
  {
    lockId: "LOCK-PL-5",
    packageId: "PL-5",
    targetRef: POST_LAUNCH_LAYER_IDS["PL-5"],
    modulePath: POST_LAUNCH_MODULE_PATHS["PL-5"],
    notes: "Lock PL-5 maintenance",
  },
  {
    lockId: "LOCK-PL-6",
    packageId: "PL-6",
    targetRef: POST_LAUNCH_LAYER_IDS["PL-6"],
    modulePath: POST_LAUNCH_MODULE_PATHS["PL-6"],
    notes: "Lock PL-6 customer support",
  },
  {
    lockId: "LOCK-PL-7",
    packageId: "PL-7",
    targetRef: POST_LAUNCH_LAYER_IDS["PL-7"],
    modulePath: POST_LAUNCH_MODULE_PATHS["PL-7"],
    notes: "Lock PL-7 continuous improvement",
  },
  {
    lockId: "LOCK-STACK",
    packageId: "STACK",
    targetRef: POST_LAUNCH_FREEZE_ID,
    modulePath: POST_LAUNCH_MODULE_PATHS["PL-8"],
    notes: `Lock full stack → ${POST_LAUNCH_TAG_REF} / ${POST_LAUNCH_BASELINE_ID}`,
  },
] as const satisfies readonly PostLaunchFreezeLock[];

export function getPostLaunchFreezeLock(
  lockId: PostLaunchLockId,
): PostLaunchFreezeLock | undefined {
  return POST_LAUNCH_FREEZE_LOCKS.find((l) => l.lockId === lockId);
}

export function isPostLaunchFreezeLockIntact(
  locks: readonly PostLaunchFreezeLock[] = POST_LAUNCH_FREEZE_LOCKS,
): boolean {
  return (
    locks.length === POST_LAUNCH_LOCK_IDS.length &&
    locks.length === POST_LAUNCH_PACKAGE_CHAIN.length &&
    locks.every(
      (l) =>
        typeof l.lockId === "string" &&
        typeof l.targetRef === "string" &&
        l.targetRef.length > 0 &&
        typeof l.modulePath === "string" &&
        l.modulePath.startsWith("lib/post-launch/"),
    )
  );
}
