/**
 * EP-2 / WP-16 — Closure & Freeze verification
 * Freezes WP-1~WP-15 against baseline v80-pilot-ga-1.0.0.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import * as enterprise from "../lib/enterprise";
import {
  EP_2_BASELINE,
  EP_2_CORE_MODELS_UNCHANGED,
  EP_2_FREEZE_VERSION,
  EP_2_WORK_PACKAGES,
  EP_2_WP16_ID,
  buildEp2Manifest,
  computeEp2Fingerprint,
  listEp2ArtifactPresence,
  validateEp2DependencyChain,
} from "../lib/enterprise/ep2-manifest";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== EP-2 / WP-16 Closure & Freeze ===\n");

  assert(EP_2_WP16_ID === "WP-16", "WP-16 id");
  assert(EP_2_FREEZE_VERSION === "ep-2-freeze-1.0.0", "freeze version");
  assert(EP_2_BASELINE === "v80-pilot-ga-1.0.0", "baseline");
  assert(EP_2_WORK_PACKAGES.length === 15, "WP-1~WP-15 count");

  for (const wp of EP_2_WORK_PACKAGES) {
    const buildFn = (enterprise as Record<string, unknown>)[wp.buildApi];
    const getFn = (enterprise as Record<string, unknown>)[wp.getApi];
    assert(typeof buildFn === "function", `export ${wp.buildApi}`);
    assert(typeof getFn === "function", `export ${wp.getApi}`);
  }
  assert(
    typeof enterprise.buildEp2Manifest === "function" ||
      typeof buildEp2Manifest === "function",
    "manifest builder available",
  );
  console.log("PASS All EP-2 exports");

  const fp1 = computeEp2Fingerprint();
  const fp2 = computeEp2Fingerprint();
  assert(fp1.length === 64, "fingerprint length");
  assert(fp1 === fp2, "deterministic fingerprint");
  const m1 = buildEp2Manifest();
  const m2 = buildEp2Manifest();
  assert(m1.fingerprint === m2.fingerprint, "manifest fingerprint stable");
  assert(m1.fingerprint === fp1, "manifest matches compute");
  assert(m1.baseline === "v80-pilot-ga-1.0.0", "manifest baseline");
  assert(m1.scope.noNewBusinessCapability === true, "no new capability");
  assert(
    m1.scope.projectQuoteTenderModelsUnchanged === true,
    "models unchanged flag",
  );

  enterprise.clearWorkspaceRegistry();
  enterprise.clearWorkspaceSnapshot();
  enterprise.clearWorkspaceQuery();
  const wsA = enterprise.buildWorkspaceRegistry();
  const wsB = enterprise.buildWorkspaceRegistry();
  assert(
    enterprise.workspaceRegistryFingerprint(wsA) ===
      enterprise.workspaceRegistryFingerprint(wsB),
    "workspace registry deterministic",
  );
  console.log("PASS Deterministic");

  const chain = validateEp2DependencyChain();
  assert(chain.ok, `dependency chain: ${chain.errors.join("; ")}`);
  assert(
    m1.dependencyChain.join(",") ===
      EP_2_WORK_PACKAGES.map((w) => w.id).join(","),
    "chain order WP-1..WP-15",
  );
  console.log("PASS Dependency chain valid");

  for (const wp of EP_2_WORK_PACKAGES) {
    const src = readFileSync(path.join(process.cwd(), wp.modulePath), "utf8");
    for (const model of EP_2_CORE_MODELS_UNCHANGED) {
      assert(
        !src.includes(`prisma.${model.toLowerCase()}`) &&
          !src.includes(`model ${model}`),
        `${wp.id} must not touch core model ${model}`,
      );
    }
  }
  const manifestSrc = readFileSync(
    path.join(process.cwd(), "lib/enterprise/ep2-manifest.ts"),
    "utf8",
  );
  assert(
    !manifestSrc.includes("prisma.project") &&
      !manifestSrc.includes("prisma.quote") &&
      !manifestSrc.includes("prisma.tender"),
    "manifest must not touch core models",
  );
  console.log("PASS No core model changes");

  const presence = listEp2ArtifactPresence();
  assert(
    presence.every((p) => p.present),
    `missing artifacts: ${presence
      .filter((p) => !p.present)
      .map((p) => p.path)
      .join(", ")}`,
  );
  assert(m1.certification === "certified", "EP-2 certification");
  assert(m1.workPackages.every((w) => w.status === "frozen"), "all frozen");
  console.log("PASS EP-2");

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
      "scripts/verify-ep2.ts",
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

  console.log("\n=== ALL EP-2 CHECKS PASSED ===");
  console.log(
    `EP-2 frozen · ${EP_2_FREEZE_VERSION} · baseline ${EP_2_BASELINE} · fingerprint ${fp1.slice(0, 16)}…`,
  );
}

main();
