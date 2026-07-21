/**
 * Enterprise Platform v1 Alignment verification
 * Align E09 / E10 / E11 enterprise layers under Platform v1 baseline
 */
import fs from "node:fs";
import path from "node:path";

import { E09_GLOBAL_NETWORK_PLATFORM_ID } from "../lib/global-network/e09/core/global.constants";
import {
  E09_P8_GOVERNANCE_BASE,
  E09_P8_PLATFORM_FREEZE_VERSION,
} from "../lib/global-network/e09/signoff/governance.freeze.lock";
import { E11_CLOUD_RUNTIME_ID } from "../lib/cloud-runtime/e11/core/cloud.constants";
import {
  E11_P8_CLOUD_RUNTIME_FREEZE_VERSION,
  E11_P8_GOVERNANCE_BASE,
} from "../lib/cloud-runtime/e11/signoff/governance.freeze.lock";
import { E10_PLATFORM_ID } from "../lib/platform/e10/core/platform.constants";
import {
  E10_P8_GOVERNANCE_BASE,
  E10_P8_PLATFORM_FREEZE_VERSION,
} from "../lib/platform/e10/signoff/governance.freeze.lock";
import {
  assertPlatformV1ReleaseGatePass,
  checkPlatformV1ReleaseGate,
} from "../lib/platform/v1/alignment.release.gate";
import {
  ENTERPRISE_CAPABILITY_CATALOG,
  buildCapabilityIndex,
  isCapabilityIndexComplete,
} from "../lib/platform/v1/capability.index";
import {
  ENTERPRISE_DEPENDENCY_EDGES,
  buildEnterpriseDependencyMap,
  validateEnterpriseDependencyChain,
} from "../lib/platform/v1/dependency.map";
import {
  ENTERPRISE_LAYER_REGISTRY,
  isEnterpriseLayerRegistryComplete,
} from "../lib/platform/v1/layer.registry";
import {
  assertPlatformV1Aligned,
  buildPlatformV1Manifest,
} from "../lib/platform/v1/platform.manifest";
import {
  E09_ENTERPRISE_COMPLETE_ID,
  E10_ENTERPRISE_COMPLETE_ID,
  E11_ENTERPRISE_COMPLETE_ID,
  PLATFORM_V1_BASE,
  PLATFORM_V1_FREEZE_VERSION,
  PLATFORM_V1_ID,
  PLATFORM_V1_SIGNOFF_VERSION,
  PLATFORM_V1_VERSION,
} from "../lib/platform/v1/platform.v1.constants";
import {
  RELEASE_BASELINE_ENTRIES,
  buildReleaseBaseline,
  isReleaseBaselineAligned,
} from "../lib/platform/v1/release.baseline";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function pathExists(rel: string): boolean {
  return fs.existsSync(path.join(ROOT, rel));
}

function checkModules() {
  const required = [
    "lib/platform/v1/platform.v1.constants.ts",
    "lib/platform/v1/platform.v1.types.ts",
    "lib/platform/v1/layer.registry.ts",
    "lib/platform/v1/dependency.map.ts",
    "lib/platform/v1/capability.index.ts",
    "lib/platform/v1/release.baseline.ts",
    "lib/platform/v1/platform.manifest.ts",
    "lib/platform/v1/alignment.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(PLATFORM_V1_ID === "enterprise-platform-v1", "platform id");
  check(PLATFORM_V1_VERSION === "platform-v1-1", "platform version");
  check(
    PLATFORM_V1_FREEZE_VERSION === "platform-v1-freeze-1",
    "platform freeze",
  );
  check(PLATFORM_V1_SIGNOFF_VERSION === "platform-v1-signoff-1", "signoff");
  check(
    PLATFORM_V1_BASE === "enterprise-e11-cloud-runtime-complete-v1",
    "platform base",
  );
  check(
    E09_ENTERPRISE_COMPLETE_ID ===
      "enterprise-e09-global-autonomous-enterprise-network-freeze-v1",
    "e09 complete",
  );
  check(
    E10_ENTERPRISE_COMPLETE_ID ===
      "enterprise-e10-autonomous-platform-complete-v1",
    "e10 complete",
  );
  check(
    E11_ENTERPRISE_COMPLETE_ID ===
      "enterprise-e11-cloud-runtime-complete-v1",
    "e11 complete",
  );
  console.log("✓ platform v1 constants");
}

function checkLayerRegistry() {
  check(isEnterpriseLayerRegistryComplete(), "registry complete");
  check(ENTERPRISE_LAYER_REGISTRY.length === 3, "3 layers");
  check(
    ENTERPRISE_LAYER_REGISTRY[0]?.primaryId === E09_GLOBAL_NETWORK_PLATFORM_ID,
    "e09 primary",
  );
  check(
    ENTERPRISE_LAYER_REGISTRY[1]?.primaryId === E10_PLATFORM_ID,
    "e10 primary",
  );
  check(
    ENTERPRISE_LAYER_REGISTRY[2]?.primaryId === E11_CLOUD_RUNTIME_ID,
    "e11 primary",
  );
  for (const layer of ENTERPRISE_LAYER_REGISTRY) {
    check(pathExists(layer.rootPath), `layer path ${layer.code}`);
    check(pathExists(layer.signoffPath), `signoff path ${layer.code}`);
  }
  console.log("✓ layer registry");
}

function checkDependencyMap() {
  const chain = validateEnterpriseDependencyChain();
  check(chain.ok, `dependency chain: ${chain.failures.join("; ")}`);
  check(ENTERPRISE_DEPENDENCY_EDGES.length === 3, "3 dependency edges");
  const map = buildEnterpriseDependencyMap();
  check(map.chainOk === true, "dependency map ok");
  console.log("✓ dependency map");
}

function checkCapabilityIndex() {
  check(isCapabilityIndexComplete(), "capability index complete");
  const index = buildCapabilityIndex();
  check(index.byLayer.E09.length >= 7, "e09 capabilities");
  check(index.byLayer.E10.length >= 7, "e10 capabilities");
  check(index.byLayer.E11.length >= 7, "e11 capabilities");
  check(
    index.count === ENTERPRISE_CAPABILITY_CATALOG.length,
    "catalog count",
  );
  for (const entry of ENTERPRISE_CAPABILITY_CATALOG) {
    check(pathExists(entry.modulePath), `capability path ${entry.id}`);
  }
  console.log("✓ capability index");
}

function checkReleaseBaseline() {
  check(isReleaseBaselineAligned(), "baseline aligned");
  const baseline = buildReleaseBaseline();
  check(baseline.entries.length === 4, "4 baseline entries");
  check(
    baseline.entries[0]?.freezeVersion === E09_P8_PLATFORM_FREEZE_VERSION,
    "e09 freeze",
  );
  check(
    baseline.entries[1]?.freezeVersion === E10_P8_PLATFORM_FREEZE_VERSION,
    "e10 freeze",
  );
  check(
    baseline.entries[2]?.freezeVersion === E11_P8_CLOUD_RUNTIME_FREEZE_VERSION,
    "e11 freeze",
  );
  check(
    RELEASE_BASELINE_ENTRIES[3]?.completeId === PLATFORM_V1_BASE,
    "platform complete",
  );
  check(
    baseline.entries[0]?.governanceBase === E09_P8_GOVERNANCE_BASE,
    "e09 gov base",
  );
  check(
    baseline.entries[1]?.governanceBase === E10_P8_GOVERNANCE_BASE,
    "e10 gov base",
  );
  check(
    baseline.entries[2]?.governanceBase === E11_P8_GOVERNANCE_BASE,
    "e11 gov base",
  );
  console.log("✓ release baseline");
}

function testPlatformManifest() {
  const manifest = buildPlatformV1Manifest();
  check(manifest.aligned === true, `manifest: ${manifest.summary}`);
  check(manifest.layers.length === 3, "manifest layers");
  check(manifest.capabilities.count >= 21, "manifest capabilities");
  check(manifest.dependency.chainOk === true, "manifest chain");
  check(manifest.baseline.aligned === true, "manifest baseline");
  assertPlatformV1Aligned(manifest);
  console.log("✓ platform manifest");
}

function testReleaseGate() {
  const gate = checkPlatformV1ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");

  const layerGateIds = [
    "PV1-E09-GATE",
    "PV1-E10-GATE",
    "PV1-E11-GATE",
  ];
  for (const id of layerGateIds) {
    const item = gate.checks.find((c) => c.id === id);
    check(Boolean(item?.ok), `${id} PASS`);
  }

  assertPlatformV1ReleaseGatePass(gate);
  console.log("✓ alignment release gate (E09/E10/E11 P8 PASS)");
}

function main() {
  console.log("Enterprise Platform v1 Alignment verify");
  checkModules();
  checkConstants();
  checkLayerRegistry();
  checkDependencyMap();
  checkCapabilityIndex();
  checkReleaseBaseline();
  testPlatformManifest();
  testReleaseGate();
  console.log("ALL PASS");
}

main();
