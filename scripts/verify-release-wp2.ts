/**
 * Release / WP-2 — Release Candidate verification
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import {
  RELEASE_CANDIDATE_BASELINE,
  RELEASE_CANDIDATE_CAPABILITY,
  RELEASE_CANDIDATE_VERSION,
  RELEASE_WP2_ID,
  buildReleaseCandidate,
  clearReleaseCandidate,
  getReleaseCandidate,
  releaseCandidateFingerprint,
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
  console.log("=== Release / WP-2 Release Candidate ===\n");

  clearReleaseCandidate();
  clearReleaseReadiness();
  buildReleaseReadiness();

  const first = buildReleaseCandidate();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === RELEASE_WP2_ID, "WP-2 id");
  assert(first.capability === RELEASE_CANDIDATE_CAPABILITY, "capability");
  assert(first.version === RELEASE_CANDIDATE_VERSION, "version");
  assert(first.baseline === "v80-pilot-ga-1.0.0", "baseline");
  assert(first.baseline === RELEASE_CANDIDATE_BASELINE, "baseline const");
  assert(typeof first.fingerprint === "string", "fingerprint type");
  assert(first.fingerprint.length === 64, "fingerprint length");
  assert(first.rollback.strategy === "ep-freeze-baseline", "rollback strategy");
  assert(first.rollback.mocked === false, "rollback no mock");
  assert(first.rollback.restoreTargets.length === 4, "rollback targets");
  assert(first.readinessFingerprint.length === 64, "readiness fingerprint");
  console.log("PASS Build");

  assert(first.status === "READY", "status READY");
  console.log("PASS READY");

  assert(first.certification === "certified", "certification certified");
  assert(first.rollback.ready === true, "rollback ready");
  console.log("PASS certified");

  clearReleaseCandidate();
  const second = buildReleaseCandidate();
  assert(
    releaseCandidateFingerprint(first) ===
      releaseCandidateFingerprint(second),
    "deterministic fingerprint",
  );
  assert(
    JSON.stringify(first) === JSON.stringify(second),
    "deterministic JSON",
  );
  const viaGet = getReleaseCandidate();
  assert(
    releaseCandidateFingerprint(viaGet) ===
      releaseCandidateFingerprint(first),
    "get fingerprint",
  );
  console.log("PASS deterministic");

  assert(RELEASE_WP2_ID === "WP-2", "WP-2 const");
  console.log("PASS Release WP-2");

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
      "scripts/verify-release-wp2.ts",
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

  console.log("\n=== ALL RELEASE / WP-2 CHECKS PASSED ===");
  console.log(
    `${RELEASE_ID}/${RELEASE_WP2_ID} · ${first.version} · baseline ${first.baseline} · ${first.status}/${first.certification} · fingerprint ${first.fingerprint.slice(0, 16)}…`,
  );
}

main();
