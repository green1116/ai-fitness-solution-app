/**
 * PL-8 — Post Launch Baseline verification gate.
 * Freeze catalogue only — nests no upstream redesign.
 */

import fs from "node:fs";
import path from "node:path";

import {
  createPostLaunchBaselineManager,
  type PostLaunchBaselineSnapshot,
} from "../baseline.manager";
import {
  POST_LAUNCH_BASE_FREEZE_REF,
  POST_LAUNCH_BASELINE_ID,
  POST_LAUNCH_COMPLETE_ID,
  POST_LAUNCH_FREEZE_GATE,
  POST_LAUNCH_FREEZE_ID,
  POST_LAUNCH_MODULE_PATH,
  POST_LAUNCH_MODULE_PATHS,
  POST_LAUNCH_NON_GOALS,
  POST_LAUNCH_PACKAGE_CHAIN,
  POST_LAUNCH_PRIOR_PACKAGE_CHAIN,
  POST_LAUNCH_TAG_REF,
} from "../freeze.constants";
import { POST_LAUNCH_FREEZE_LOCKS, POST_LAUNCH_LOCK_IDS } from "../freeze.lock";
import {
  POST_LAUNCH_MANIFEST_PACKAGES,
  isPostLaunchFreezeManifestIntact,
  resolvePostLaunchFreezeManifest,
} from "../freeze.manifest";
import { CONTINUOUS_IMPROVEMENT_ID } from "../../../p7/continuous-improvement/continuous-improvement.types";

export type PostLaunchBaselineCheck = Readonly<{
  id: string;
  source: "PL-8";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type PostLaunchBaselineReport = Readonly<{
  layer: "PL-8";
  freezeId: typeof POST_LAUNCH_FREEZE_ID;
  gateId: typeof POST_LAUNCH_FREEZE_GATE;
  baselineId: typeof POST_LAUNCH_BASELINE_ID;
  passed: boolean;
  checks: readonly PostLaunchBaselineCheck[];
  summary: Readonly<{
    priorPackages: number;
    packages: number;
    locks: number;
    metadataValid: boolean;
    manifestValid: boolean;
  }>;
}>;

function check(
  id: string,
  title: string,
  ok: boolean,
  evidence: string,
): PostLaunchBaselineCheck {
  return {
    id,
    source: "PL-8",
    title,
    status: ok ? "PASS" : "FAIL",
    evidence,
  };
}

function resolveRoot(rootDir?: string): string {
  return rootDir
    ? path.resolve(rootDir)
    : path.resolve(__dirname, "../../../../..");
}

export function runPostLaunchBaselineGate(
  rootDir?: string,
): PostLaunchBaselineReport {
  const root = resolveRoot(rootDir);
  const checks: PostLaunchBaselineCheck[] = [];
  const manager = createPostLaunchBaselineManager();
  const snap: PostLaunchBaselineSnapshot = manager.snapshot();
  const manifest = resolvePostLaunchFreezeManifest();

  const missingModules = POST_LAUNCH_PRIOR_PACKAGE_CHAIN.filter(
    (id) => !fs.existsSync(path.join(root, POST_LAUNCH_MODULE_PATHS[id])),
  );
  const missingEvidence = POST_LAUNCH_MANIFEST_PACKAGES.flatMap((pkg) =>
    pkg.evidenceFiles.filter((rel) => !fs.existsSync(path.join(root, rel))),
  );

  checks.push(
    check(
      "PL8-PRESENT",
      "PL-1..PL-7 present",
      missingModules.length === 0 &&
        POST_LAUNCH_PRIOR_PACKAGE_CHAIN.length === 6 &&
        missingEvidence.filter((f) => !f.includes("/p8/")).length === 0,
      missingModules.length || missingEvidence.length
        ? `missingModules=${missingModules.join(",")} missingEvidence=${missingEvidence.join(",")}`
        : `prior=${snap.priorChain} (series starts PL-2.1; no separate PL-1 module)`,
    ),
  );

  checks.push(
    check(
      "PL8-META",
      "Baseline metadata valid",
      snap.metadataValid &&
        POST_LAUNCH_FREEZE_ID === "pl-8-post-launch-baseline-v1" &&
        POST_LAUNCH_BASELINE_ID === "post-launch-baseline-v1" &&
        POST_LAUNCH_COMPLETE_ID === "post-launch-complete-v1" &&
        POST_LAUNCH_TAG_REF === "pl-8-post-launch-baseline-v1" &&
        POST_LAUNCH_FREEZE_GATE === "pl-8-post-launch-baseline-gate" &&
        POST_LAUNCH_BASE_FREEZE_REF === CONTINUOUS_IMPROVEMENT_ID,
      `${POST_LAUNCH_FREEZE_ID} / baseline=${POST_LAUNCH_BASELINE_ID} / base=${POST_LAUNCH_BASE_FREEZE_REF}`,
    ),
  );

  checks.push(
    check(
      "PL8-MANIFEST",
      "Freeze manifest valid",
      snap.manifestValid &&
        isPostLaunchFreezeManifestIntact(manifest) &&
        manifest.packages.length === POST_LAUNCH_PACKAGE_CHAIN.length &&
        POST_LAUNCH_FREEZE_LOCKS.length === POST_LAUNCH_LOCK_IDS.length,
      `chain=${manifest.chain} packages=${manifest.packages.length} locks=${POST_LAUNCH_FREEZE_LOCKS.length}`,
    ),
  );

  checks.push(
    check(
      "PL8-SCOPE",
      "Freeze only — no new capability; PL stack refs only",
      snap.freezeOnly &&
        snap.readOnly &&
        POST_LAUNCH_NON_GOALS.includes("new-capability") &&
        manager.isIntact() &&
        POST_LAUNCH_MANIFEST_PACKAGES.every((p) =>
          p.modulePath.startsWith("lib/post-launch/"),
        ) &&
        POST_LAUNCH_FREEZE_LOCKS.every((l) =>
          l.modulePath.startsWith("lib/post-launch/"),
        ),
      `nonGoals=${POST_LAUNCH_NON_GOALS.length}`,
    ),
  );

  const pl8Root = path.join(root, POST_LAUNCH_MODULE_PATH);
  const requiredPl8 = [
    "freeze.constants.ts",
    "freeze.manifest.ts",
    "freeze.lock.ts",
    "baseline.manager.ts",
    "verify/post-launch.baseline.gate.ts",
  ];
  const missingPl8 = requiredPl8.filter(
    (rel) => !fs.existsSync(path.join(pl8Root, rel)),
  );
  const verifyScriptOk = fs.existsSync(
    path.join(root, "scripts/verify-post-launch-p8.ts"),
  );
  checks.push(
    check(
      "PL8-FILES",
      "PL-8 freeze artefacts present",
      missingPl8.length === 0 && verifyScriptOk,
      missingPl8.length || !verifyScriptOk
        ? `missing=${[...missingPl8, !verifyScriptOk ? "scripts/verify-post-launch-p8.ts" : ""].filter(Boolean).join(",")}`
        : `tree=${POST_LAUNCH_MODULE_PATH}`,
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "PL-8",
    freezeId: POST_LAUNCH_FREEZE_ID,
    gateId: POST_LAUNCH_FREEZE_GATE,
    baselineId: POST_LAUNCH_BASELINE_ID,
    passed,
    checks,
    summary: {
      priorPackages: POST_LAUNCH_PRIOR_PACKAGE_CHAIN.length,
      packages: POST_LAUNCH_MANIFEST_PACKAGES.length,
      locks: POST_LAUNCH_FREEZE_LOCKS.length,
      metadataValid: snap.metadataValid,
      manifestValid: snap.manifestValid,
    },
  };
}

export function assertPostLaunchBaselineGate(
  report: PostLaunchBaselineReport = runPostLaunchBaselineGate(),
): void {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `Post Launch baseline gate FAILED: ${failed.map((f) => f.id).join(", ")}`,
    );
  }
}
