/**
 * Release / WP-4 — GA Release & Freeze verification
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  GA_RELEASE_BASELINE,
  GA_RELEASE_CAPABILITY,
  GA_RELEASE_CODENAME,
  GA_RELEASE_FREEZE_DATE,
  GA_RELEASE_FREEZE_VERSION,
  GA_RELEASE_VERSION,
  RELEASE_WP4_ID,
  buildGaRelease,
  clearGaRelease,
  gaReleaseFingerprint,
  getGaRelease,
} from "../lib/release/ga-release";
import {
  buildProductionValidation,
  clearProductionValidation,
} from "../lib/release/production-validation";
import {
  buildReleaseCandidate,
  clearReleaseCandidate,
} from "../lib/release/release-candidate";
import {
  RELEASE_ID,
  buildReleaseReadiness,
  clearReleaseReadiness,
} from "../lib/release/release-readiness";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== Release / WP-4 GA Release & Freeze ===\n");

  clearGaRelease();
  clearProductionValidation();
  clearReleaseCandidate();
  clearReleaseReadiness();
  buildReleaseReadiness();
  buildReleaseCandidate();
  buildProductionValidation();

  const first = buildGaRelease();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === RELEASE_WP4_ID, "WP-4 id");
  assert(first.capability === GA_RELEASE_CAPABILITY, "capability");
  assert(first.version === GA_RELEASE_VERSION, "version");
  assert(first.baseline === "v80-pilot-ga-1.0.0", "baseline");
  assert(first.baseline === GA_RELEASE_BASELINE, "baseline const");
  assert(first.freezeVersion === GA_RELEASE_FREEZE_VERSION, "freeze version");
  assert(first.codename === GA_RELEASE_CODENAME, "codename");
  assert(first.freezeDate === GA_RELEASE_FREEZE_DATE, "freeze date");
  assert(first.fingerprint.length === 64, "fingerprint length");
  assert(first.rollback.strategy === "ep-freeze-baseline", "rollback strategy");
  assert(first.rollback.mocked === false, "rollback no mock");
  assert(first.rollback.restoreTargets.length === 4, "rollback targets");
  assert(first.scope.workPackages === "WP-1~WP-3", "scope WPs");
  assert(first.scope.closure === "WP-4", "scope closure");
  assert(first.scope.noNewBusinessCapability === true, "no new capability");
  assert(first.scope.additiveOnly === true, "additive only");
  assert(first.scope.productionValidated === true, "production validated");
  console.log("PASS Build");

  assert(first.status === "GA", "status GA");
  console.log("PASS GA");

  assert(first.certification === "certified", "certification certified");
  assert(first.rollback.ready === true, "rollback ready");
  console.log("PASS certified");

  assert(first.productionStatus === "PASS", "production PASS");
  assert(first.productionFingerprint.length === 64, "production fingerprint");
  console.log("PASS production PASS");

  clearGaRelease();
  const second = buildGaRelease();
  assert(
    gaReleaseFingerprint(first) === gaReleaseFingerprint(second),
    "deterministic fingerprint",
  );
  assert(
    JSON.stringify(first) === JSON.stringify(second),
    "deterministic JSON",
  );
  const viaGet = getGaRelease();
  assert(
    gaReleaseFingerprint(viaGet) === gaReleaseFingerprint(first),
    "get fingerprint",
  );
  console.log("PASS deterministic");

  assert(RELEASE_WP4_ID === "WP-4", "WP-4 const");
  console.log("PASS Release WP-4");

  const tscBin = path.join(
    process.cwd(),
    "node_modules",
    "typescript",
    "bin",
    "tsc",
  );
  const tsc = spawnSync(
    process.execPath,
    [
      tscBin,
      "--noEmit",
      "--pretty",
      "false",
      "-p",
      "tsconfig.release-wp1.json",
    ],
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
      "lib/release",
      "scripts/verify-release-ga.ts",
      "tsconfig.release-wp1.json",
    ],
    { encoding: "utf8", cwd: process.cwd() },
  );
  if (diffCheck.status !== 0) {
    throw new Error(
      `ASSERT: git diff --check failed\n${diffCheck.stdout}\n${diffCheck.stderr}`,
    );
  }
  console.log("PASS git diff --check");

  console.log("\n=== ALL RELEASE / WP-4 GA CHECKS PASSED ===");
  console.log(
    `${RELEASE_ID}/${RELEASE_WP4_ID} · ${first.version} · ${first.freezeVersion} · baseline ${first.baseline} · ${first.status}/${first.certification} · fingerprint ${first.fingerprint.slice(0, 16)}…`,
  );
}

main();
