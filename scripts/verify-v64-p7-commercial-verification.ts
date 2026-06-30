/**
 * V64 P7 — Commercial Verification Layer Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  V64_VERIFY_LAYER_VERSION,
  assertCommercialVerificationPass,
  buildCommercialVerificationReport,
  checkCrossLayerInvariants,
  checkVersionConsistency,
  runCommercialVerification,
  verifyCommercialSnapshots,
} from "../lib/commercial/v64/verify";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v64-p7-commercial-verification";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/commercial/v64/verify.ts",
    "lib/commercial/v64/verify.types.ts",
    "lib/commercial/v64/verify.versions.ts",
    "lib/commercial/v64/verify.invariants.ts",
    "lib/commercial/v64/verify.snapshots.ts",
    "lib/commercial/v64/verify.builder.ts",
    "lib/commercial/v64/verify.entry.ts",
    "docs/production/V64-VERIFY-LAYER.md",
  ];
  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V64 verification layer module structure");
}

function testCrossLayerChecks() {
  const versions = checkVersionConsistency({ deploymentId: DEPLOYMENT_ID });
  assert(versions.versionConsistencyOk, "version consistency");
  assert(versions.allSnapshotsReferenceFoundation, "foundation version in snapshots");

  const invariants = checkCrossLayerInvariants({ deploymentId: DEPLOYMENT_ID });
  assert(invariants.crossLayerInvariantsOk, "cross-layer invariants");
  assert(invariants.tierCountConsistent, "tier count consistent");

  const snapshots = verifyCommercialSnapshots({ deploymentId: DEPLOYMENT_ID });
  assert(snapshots.snapshotVerificationOk, "snapshot verification");

  console.log("✓ version, invariant & snapshot checks");
}

function testUnifiedEntry() {
  const report = runCommercialVerification({ deploymentId: DEPLOYMENT_ID });
  assert(report.version === V64_VERIFY_LAYER_VERSION, "report version");
  assert(report.layers.length === 6, "six layer summaries");
  assert(report.layers.every((l) => l.ok), "all layers ok");

  const asserted = assertCommercialVerificationPass({ deploymentId: DEPLOYMENT_ID });
  assert(asserted.verificationOk, "assert verification pass");

  console.log("✓ verification builder & unified entry");
  console.log(" ", buildCommercialVerificationReport({ deploymentId: DEPLOYMENT_ID }).summary);
  console.log("\n✅ V64 P7 Commercial Verification Layer — verify PASS");
}

function main() {
  console.log("V64 P7 Commercial Verification Layer Verification\n");
  checkModuleStructure();
  testCrossLayerChecks();
  testUnifiedEntry();
}

main();
