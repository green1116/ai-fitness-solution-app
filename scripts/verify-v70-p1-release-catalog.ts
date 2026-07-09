/**
 * V70 P1 — Release Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertReleaseCatalogPass,
  buildReleaseCatalog,
  formatReleaseCatalogSummary,
  getReleaseById,
  getReleasesByChannel,
  getReleasesByStage,
  RELEASE_CATALOG,
  runReleaseCatalog,
  V70_RELEASE_FREEZE_VERSION,
  V70_RELEASE_VERSION,
} from "../lib/delivery/v70/release.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v70-p1-release-catalog";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/delivery/v70/release.types.ts",
    "lib/delivery/v70/release.catalog.ts",
    "lib/delivery/v70/release.builder.ts",
    "lib/delivery/v70/release.entry.ts",
    "docs/V70-P1-RELEASE-CATALOG.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V70 release catalog module structure");
}

function testCatalogFields() {
  check(RELEASE_CATALOG.length >= 6, "release catalog entries");
  for (const entry of RELEASE_CATALOG) {
    check(entry.release.length > 0, `${entry.id} release`);
    check(entry.version.length > 0, `${entry.id} version`);
    check(entry.channel.length > 0, `${entry.id} channel`);
    check(entry.stage.length > 0, `${entry.id} stage`);
    check(entry.artifact.length > 0, `${entry.id} artifact`);
    check(entry.owner.length > 0, `${entry.id} owner`);
    check(entry.status.length > 0, `${entry.id} status`);
    check(entry.compatibility.length > 0, `${entry.id} compatibility`);
    check(entry.supportWindow.length > 0, `${entry.id} supportWindow`);
    check(entry.rollbackTarget.length > 0, `${entry.id} rollbackTarget`);
  }
  console.log("✓ release catalog field coverage");
}

function testCatalogQueries() {
  const rel = getReleaseById("DLV-REL-001");
  check(rel?.channel === "stable", "DLV-REL-001 stable channel");
  check(rel?.rollbackTarget === "v68-platform-freeze-1", "DLV-REL-001 rollback target");

  const beta = getReleasesByChannel("beta");
  check(beta.length >= 1, "beta channel releases");

  const staging = getReleasesByStage("staging");
  check(staging.length >= 1, "staging stage releases");

  console.log("✓ release catalog queries");
}

function testReport() {
  const incomplete = runReleaseCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { catalogComplete: false },
  });
  check(!incomplete.catalogReady, "incomplete catalog not ready");

  const ready = buildReleaseCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V70_RELEASE_VERSION, "release version");
  check(ready.freezeVersion === V70_RELEASE_FREEZE_VERSION, "freeze version declared");
  check(ready.manifest.catalogComplete, "manifest complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertReleaseCatalogPass(ready);

  console.log("✓ release catalog report");
  console.log(formatReleaseCatalogSummary(ready));
  console.log("\n✅ V70 P1 Release Catalog — verify PASS");
}

function main() {
  console.log("V70 P1 Release Catalog Verification\n");
  checkModuleStructure();
  testCatalogFields();
  testCatalogQueries();
  testReport();
}

main();
