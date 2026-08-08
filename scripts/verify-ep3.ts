/**
 * EP-3 / WP-9 — Closure & Freeze verification
 * Freezes WP-1~WP-8 against baseline v80-pilot-ga-1.0.0.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import * as enterprise from "../lib/enterprise";
import {
  EP_3_BASELINE,
  EP_3_CORE_MODELS_UNCHANGED,
  EP_3_FREEZE_VERSION,
  EP_3_WORK_PACKAGES,
  EP_3_WP9_ID,
  buildEp3Manifest,
  computeEp3Fingerprint,
  listEp3ArtifactPresence,
  validateEp3DependencyChain,
} from "../lib/enterprise/ep3-manifest";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== EP-3 / WP-9 Closure & Freeze ===\n");

  assert(EP_3_WP9_ID === "WP-9", "WP-9 id");
  assert(EP_3_FREEZE_VERSION === "ep-3-freeze-1.0.0", "freeze version");
  assert(EP_3_BASELINE === "v80-pilot-ga-1.0.0", "baseline");
  assert(EP_3_WORK_PACKAGES.length === 8, "WP-1~WP-8 count");

  for (const wp of EP_3_WORK_PACKAGES) {
    const buildFn = (enterprise as Record<string, unknown>)[wp.buildApi];
    const getFn = (enterprise as Record<string, unknown>)[wp.getApi];
    assert(typeof buildFn === "function", `export ${wp.buildApi}`);
    assert(typeof getFn === "function", `export ${wp.getApi}`);
  }
  assert(
    typeof enterprise.buildEp3Manifest === "function" ||
      typeof buildEp3Manifest === "function",
    "manifest builder available",
  );
  console.log("PASS All EP-3 exports");

  const fp1 = computeEp3Fingerprint();
  const fp2 = computeEp3Fingerprint();
  assert(fp1.length === 64, "fingerprint length");
  assert(fp1 === fp2, "deterministic fingerprint");
  const m1 = buildEp3Manifest();
  const m2 = buildEp3Manifest();
  assert(m1.fingerprint === m2.fingerprint, "manifest fingerprint stable");
  assert(m1.fingerprint === fp1, "manifest matches compute");
  assert(m1.baseline === "v80-pilot-ga-1.0.0", "manifest baseline");
  assert(m1.scope.noNewBusinessCapability === true, "no new capability");
  assert(
    m1.scope.projectQuoteTenderModelsUnchanged === true,
    "models unchanged flag",
  );

  enterprise.clearCollaborationContext();
  enterprise.clearCollaborationSnapshot();
  enterprise.clearCollaborationQuery();
  const ctxA = enterprise.buildCollaborationContext();
  const ctxB = enterprise.buildCollaborationContext();
  assert(
    enterprise.collaborationContextFingerprint(ctxA) ===
      enterprise.collaborationContextFingerprint(ctxB),
    "collaboration context deterministic",
  );
  console.log("PASS Deterministic");

  const chain = validateEp3DependencyChain();
  assert(chain.ok, `dependency chain: ${chain.errors.join("; ")}`);
  assert(
    m1.dependencyChain.join(",") ===
      EP_3_WORK_PACKAGES.map((w) => w.id).join(","),
    "chain order WP-1..WP-8",
  );
  console.log("PASS Dependency chain valid");

  for (const wp of EP_3_WORK_PACKAGES) {
    const src = readFileSync(path.join(process.cwd(), wp.modulePath), "utf8");
    for (const model of EP_3_CORE_MODELS_UNCHANGED) {
      assert(
        !src.includes(`prisma.${model.toLowerCase()}`) &&
          !src.includes(`model ${model}`),
        `${wp.id} must not touch core model ${model}`,
      );
    }
  }
  const manifestSrc = readFileSync(
    path.join(process.cwd(), "lib/enterprise/ep3-manifest.ts"),
    "utf8",
  );
  assert(
    !manifestSrc.includes("prisma.project") &&
      !manifestSrc.includes("prisma.quote") &&
      !manifestSrc.includes("prisma.tender"),
    "manifest must not touch core models",
  );
  console.log("PASS No core model changes");

  const presence = listEp3ArtifactPresence();
  assert(
    presence.every((p) => p.present),
    `missing artifacts: ${presence
      .filter((p) => !p.present)
      .map((p) => p.path)
      .join(", ")}`,
  );
  assert(m1.certification === "certified", "EP-3 certification");
  assert(m1.workPackages.every((w) => w.status === "frozen"), "all frozen");
  console.log("PASS EP-3");

  const tscBin = path.join(
    process.cwd(),
    "node_modules",
    "typescript",
    "bin",
    "tsc",
  );
  const tsc = spawnSync(
    process.execPath,
    [tscBin, "--noEmit", "--pretty", "false", "-p", "tsconfig.ep-wp1.json"],
    { encoding: "utf8", cwd: process.cwd() },
  );
  if (tsc.status !== 0) {
    const tscOut = `${tsc.stdout ?? ""}\n${tsc.stderr ?? ""}`.trim();
    throw new Error(`ASSERT: tsc failed\n${tscOut}`);
  }
  console.log("PASS tsc");

  const diffCheck = spawnSync(
    "git",
    [
      "diff",
      "--check",
      "--",
      "lib/enterprise",
      "scripts/verify-ep3.ts",
      "tsconfig.ep-wp1.json",
    ],
    { encoding: "utf8", cwd: process.cwd() },
  );
  if (diffCheck.status !== 0) {
    throw new Error(
      `ASSERT: git diff --check failed\n${diffCheck.stdout}\n${diffCheck.stderr}`,
    );
  }
  console.log("PASS git diff --check");

  console.log("\n=== ALL EP-3 CHECKS PASSED ===");
  console.log(
    `EP-3 frozen · ${EP_3_FREEZE_VERSION} · baseline ${EP_3_BASELINE} · fingerprint ${fp1.slice(0, 16)}…`,
  );
}

main();
