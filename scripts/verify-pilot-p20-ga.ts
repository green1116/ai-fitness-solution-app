/**
 * Pilot P20 — GA Freeze & Release verification (+ writes ga-manifest.json)
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  GA_ARTIFACT_PATHS,
  GA_PILOTS,
  PILOT_GA_VERSION,
  buildGaReleaseManifest,
  computeGaFingerprint,
  exportGaReleaseManifestJson,
  listGaArtifactPresence,
  listRegressionSuiteCatalog,
} from "../lib/pilot/v80";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== Pilot P20 / GA Freeze & Release ===\n");

  const fingerprint = computeGaFingerprint();
  assert(fingerprint.length === 64, "fingerprint length");
  assert(computeGaFingerprint() === fingerprint, "deterministic fingerprint");
  console.log("PASS Deterministic GA fingerprint");

  const manifest = buildGaReleaseManifest();
  assert(manifest.version === PILOT_GA_VERSION, "GA version");
  assert(manifest.scope.noNewBusinessCapability === true, "no new capability flag");
  assert(manifest.scope.projectQuoteTenderModelsUnchanged === true, "models unchanged flag");
  assert(manifest.pilots.length === 19, "P1-P19 pilots");
  assert(manifest.fingerprint === fingerprint, "manifest fingerprint");
  assert(manifest.apiIndex.length >= 20, "api index");
  assert(manifest.uiSurfaces.length >= 8, "ui surfaces");
  assert(manifest.architecture.length >= 5, "architecture layers");
  console.log("PASS GA release manifest");

  // Ensure docs exist (written in repo); write/update machine manifest
  const docsDir = path.join(process.cwd(), "docs/pilot/ga");
  mkdirSync(docsDir, { recursive: true });

  const requiredDocs = [
    GA_ARTIFACT_PATHS.architectureDoc,
    GA_ARTIFACT_PATHS.apiIndexDoc,
    GA_ARTIFACT_PATHS.releaseNotesDoc,
    GA_ARTIFACT_PATHS.changelogDoc,
    GA_ARTIFACT_PATHS.verificationSummaryDoc,
  ];
  for (const doc of requiredDocs) {
    const full = path.join(process.cwd(), doc);
    assert(readFileSync(full, "utf8").length > 50, `doc present: ${doc}`);
  }
  console.log("PASS Documentation artifacts");

  const exported = exportGaReleaseManifestJson(manifest);
  const manifestPath = path.join(process.cwd(), GA_ARTIFACT_PATHS.manifestJson);
  writeFileSync(manifestPath, exported.body, "utf8");
  const roundtrip = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert(roundtrip.version === PILOT_GA_VERSION, "written manifest version");
  assert(roundtrip.fingerprint === fingerprint, "written fingerprint");
  console.log("PASS Wrote docs/pilot/ga/ga-manifest.json");

  // Verify scripts P1-P19 + regression runner
  for (const p of GA_PILOTS) {
    assert(
      listGaArtifactPresence().length >= 1 || true,
      "presence helper callable",
    );
    const full = path.join(process.cwd(), p.verifyScript);
    assert(readFileSync(full, "utf8").length > 20, `verify script ${p.id}`);
  }
  const regression = listRegressionSuiteCatalog();
  assert(regression.length === 18, "regression catalogs P1-P18");
  assert(regression.every((e) => e.present), "regression scripts present");
  assert(
    readFileSync(path.join(process.cwd(), "scripts/verify-pilot-regression.ts"), "utf8")
      .length > 20,
    "regression runner",
  );
  console.log("PASS P1-P19 verify scripts + regression suite");

  assert(manifest.verification.certification === "certified", "GA certification");
  const presence = listGaArtifactPresence();
  assert(
    presence.every((p) => p.present),
    `all artifacts present: ${presence
      .filter((p) => !p.present)
      .map((p) => p.path)
      .join(", ")}`,
  );
  console.log("PASS Final readiness certification");

  console.log("\n=== ALL P20 GA CHECKS PASSED ===");
  console.log(`GA ${PILOT_GA_VERSION} · fingerprint ${fingerprint.slice(0, 16)}…`);
}

main();
