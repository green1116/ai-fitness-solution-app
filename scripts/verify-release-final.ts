/**
 * Release / Final Release Pack verification
 * Packs GA notes + rollback snapshot against release-wp-4-ga-1.0.0.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  GA_RELEASE_BASELINE,
  GA_RELEASE_FREEZE_VERSION,
  GA_RELEASE_VERSION,
  buildGaRelease,
  clearGaRelease,
  gaReleaseFingerprint,
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
  buildReleaseReadiness,
  clearReleaseReadiness,
} from "../lib/release/release-readiness";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function root(...parts: string[]): string {
  return path.join(process.cwd(), ...parts);
}

const NOTES = "docs/release/release-notes.md";
const ROLLBACK = "docs/release/rollback-snapshot.md";

function main() {
  console.log("=== Release / Final Release Pack ===\n");

  clearGaRelease();
  clearProductionValidation();
  clearReleaseCandidate();
  clearReleaseReadiness();
  buildReleaseReadiness();
  buildReleaseCandidate();
  buildProductionValidation();
  const ga = buildGaRelease();

  assert(existsSync(root(NOTES)), "release-notes.md exists");
  assert(existsSync(root(ROLLBACK)), "rollback-snapshot.md exists");
  const notes = readFileSync(root(NOTES), "utf8");
  const rollbackDoc = readFileSync(root(ROLLBACK), "utf8");

  // --- tag ---
  assert(ga.version === "release-wp-4-ga-1.0.0", "GA version");
  assert(ga.version === GA_RELEASE_VERSION, "GA version const");
  assert(ga.freezeVersion === "release-ga-freeze-1.0.0", "freeze version");
  assert(ga.freezeVersion === GA_RELEASE_FREEZE_VERSION, "freeze const");
  assert(notes.includes("`release-wp-4-ga-1.0.0`"), "notes GA tag");
  assert(notes.includes("`release-ga-freeze-1.0.0`"), "notes freeze tag");
  assert(rollbackDoc.includes("`release-wp-4-ga-1.0.0`"), "rollback GA tag");
  assert(
    rollbackDoc.includes("`release-ga-freeze-1.0.0`"),
    "rollback freeze tag",
  );
  console.log("PASS tag");

  // --- notes ---
  assert(notes.includes("# Release Notes"), "notes title");
  assert(notes.includes("v80-pilot-ga-1.0.0"), "notes baseline");
  assert(notes.includes(ga.fingerprint), "notes fingerprint");
  assert(notes.includes("certified"), "notes certified");
  assert(notes.includes("WorkflowEntryPanelActions"), "notes UI host");
  assert(notes.includes("/pilot/intake"), "notes intake route");
  assert(notes.includes("/dashboard/command-center"), "notes command-center");
  console.log("PASS notes");

  // --- rollback ---
  assert(ga.rollback.ready === true, "rollback ready");
  assert(ga.rollback.strategy === "ep-freeze-baseline", "rollback strategy");
  assert(ga.rollback.mocked === false, "rollback no mock");
  assert(
    rollbackDoc.includes("ep-freeze-baseline"),
    "rollback doc strategy",
  );
  for (const target of ga.rollback.restoreTargets) {
    assert(rollbackDoc.includes(target), `rollback doc target ${target}`);
    assert(notes.includes(target) || notes.includes("ep-freeze-baseline"), "notes rollback");
  }
  assert(rollbackDoc.includes(ga.fingerprint), "rollback doc fingerprint");
  console.log("PASS rollback");

  // --- deterministic ---
  assert(ga.status === "GA", "status GA");
  assert(ga.certification === "certified", "certified");
  assert(ga.productionStatus === "PASS", "production PASS");
  assert(ga.baseline === "v80-pilot-ga-1.0.0", "baseline");
  assert(ga.baseline === GA_RELEASE_BASELINE, "baseline const");
  clearGaRelease();
  const again = buildGaRelease();
  assert(
    gaReleaseFingerprint(ga) === gaReleaseFingerprint(again),
    "deterministic fingerprint",
  );
  assert(ga.fingerprint === again.fingerprint, "fingerprint stable");
  assert(
    notes.includes(again.fingerprint),
    "notes matches live fingerprint",
  );
  assert(
    rollbackDoc.includes(again.fingerprint),
    "rollback matches live fingerprint",
  );
  console.log("PASS deterministic");

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
      "docs/release",
      "lib/release",
      "scripts/verify-release-final.ts",
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

  console.log("\n=== ALL FINAL RELEASE PACK CHECKS PASSED ===");
  console.log(
    `Final Release Pack · ${ga.version} · ${ga.freezeVersion} · baseline ${ga.baseline} · ${ga.status}/${ga.certification} · fingerprint ${ga.fingerprint.slice(0, 16)}…`,
  );
}

main();
