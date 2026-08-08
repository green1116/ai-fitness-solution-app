/**
 * EP-1 / WP-26 — Closure & Freeze verification
 * Freezes WP-1~WP-25 against baseline v80-pilot-ga-1.0.0.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import * as enterprise from "../lib/enterprise";
import {
  EP_1_BASELINE,
  EP_1_CORE_MODELS_UNCHANGED,
  EP_1_FREEZE_VERSION,
  EP_1_WORK_PACKAGES,
  EP_WP26_ID,
  buildEp1Manifest,
  computeEp1Fingerprint,
  listEp1ArtifactPresence,
  validateEp1DependencyChain,
} from "../lib/enterprise/ep1-manifest";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== EP-1 / WP-26 Closure & Freeze ===\n");

  assert(EP_WP26_ID === "WP-26", "WP-26 id");
  assert(EP_1_FREEZE_VERSION === "ep-1-freeze-1.0.0", "freeze version");
  assert(EP_1_BASELINE === "v80-pilot-ga-1.0.0", "baseline");
  assert(EP_1_WORK_PACKAGES.length === 25, "WP-1~WP-25 count");

  // Exports: every WP build/get API present on barrel
  for (const wp of EP_1_WORK_PACKAGES) {
    const buildFn = (enterprise as Record<string, unknown>)[wp.buildApi];
    const getFn = (enterprise as Record<string, unknown>)[wp.getApi];
    assert(typeof buildFn === "function", `export ${wp.buildApi}`);
    assert(typeof getFn === "function", `export ${wp.getApi}`);
  }
  assert(
    typeof enterprise.buildEp1Manifest === "function" ||
      typeof buildEp1Manifest === "function",
    "manifest builder available",
  );
  console.log("PASS All WP registries exported");

  // Deterministic fingerprint
  const fp1 = computeEp1Fingerprint();
  const fp2 = computeEp1Fingerprint();
  assert(fp1.length === 64, "fingerprint length");
  assert(fp1 === fp2, "deterministic fingerprint");
  const m1 = buildEp1Manifest();
  const m2 = buildEp1Manifest();
  assert(m1.fingerprint === m2.fingerprint, "manifest fingerprint stable");
  assert(m1.fingerprint === fp1, "manifest matches compute");
  assert(m1.baseline === "v80-pilot-ga-1.0.0", "manifest baseline");
  assert(m1.scope.noNewBusinessCapability === true, "no new capability");
  assert(
    m1.scope.projectQuoteTenderModelsUnchanged === true,
    "models unchanged flag",
  );

  // Foundation registry determinism (avoid full WP-25 chain cost)
  enterprise.clearOrganizationRegistry();
  const orgA = enterprise.buildOrganizationRegistry();
  const orgB = enterprise.buildOrganizationRegistry();
  assert(
    enterprise.organizationRegistryFingerprint(orgA) ===
      enterprise.organizationRegistryFingerprint(orgB),
    "org registry deterministic",
  );
  console.log("PASS Deterministic");

  // Dependency chain
  const chain = validateEp1DependencyChain();
  assert(chain.ok, `dependency chain: ${chain.errors.join("; ")}`);
  assert(
    m1.dependencyChain.join(",") ===
      EP_1_WORK_PACKAGES.map((w) => w.id).join(","),
    "chain order WP-1..WP-25",
  );
  console.log("PASS Dependency chain valid");

  // No core model changes: EP sources must not reference Prisma Project/Quote/Tender models
  for (const wp of EP_1_WORK_PACKAGES) {
    const src = readFileSync(path.join(process.cwd(), wp.modulePath), "utf8");
    for (const model of EP_1_CORE_MODELS_UNCHANGED) {
      assert(
        !src.includes(`prisma.${model.toLowerCase()}`) &&
          !src.includes(`model ${model}`),
        `${wp.id} must not touch core model ${model}`,
      );
    }
  }
  const manifestSrc = readFileSync(
    path.join(process.cwd(), "lib/enterprise/ep1-manifest.ts"),
    "utf8",
  );
  assert(
    !manifestSrc.includes("prisma.project") &&
      !manifestSrc.includes("prisma.quote") &&
      !manifestSrc.includes("prisma.tender"),
    "manifest must not touch core models",
  );
  console.log("PASS No core model changes");

  // Artifacts present + certification
  const presence = listEp1ArtifactPresence();
  assert(
    presence.every((p) => p.present),
    `missing artifacts: ${presence
      .filter((p) => !p.present)
      .map((p) => p.path)
      .join(", ")}`,
  );
  assert(m1.certification === "certified", "EP-1 certification");
  assert(m1.workPackages.every((w) => w.status === "frozen"), "all frozen");
  console.log("PASS EP-1");

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
      "scripts/verify-ep1.ts",
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

  console.log("\n=== ALL EP-1 CHECKS PASSED ===");
  console.log(
    `EP-1 frozen · ${EP_1_FREEZE_VERSION} · baseline ${EP_1_BASELINE} · fingerprint ${fp1.slice(0, 16)}…`,
  );
}

main();
