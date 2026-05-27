/**
 * V3.7 Runtime Verification Freeze — manifest gate
 */
import {
  BUILD_FREEZE_MANIFEST,
  BUILD_FREEZE_VERSION,
  formatBuildFreezeSummary,
} from "../lib/commercialization/stabilization/build-freeze";
import { VERIFY_REGISTRY } from "./verify-registry";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`FREEZE: ${msg}`);
}

function main() {
  console.log("=== V3.7 Runtime Verification Freeze Manifest ===");
  assert(BUILD_FREEZE_MANIFEST.version === BUILD_FREEZE_VERSION, "manifest version");
  assert(BUILD_FREEZE_MANIFEST.buildPassed, "buildPassed");
  assert(BUILD_FREEZE_MANIFEST.tscPassed, "tscPassed");
  assert(BUILD_FREEZE_MANIFEST.runtimeVerified, "runtimeVerified");
  assert(BUILD_FREEZE_MANIFEST.evidenceVerified, "evidenceVerified");
  assert(BUILD_FREEZE_MANIFEST.executiveVerified, "executiveVerified");
  assert(VERIFY_REGISTRY.length >= 20, "verify registry populated");

  console.log(formatBuildFreezeSummary());
  console.log(`registryEntries=${VERIFY_REGISTRY.length}`);
  console.log("");
  console.log("Runtime verification freeze manifest OK.");
}

main();
