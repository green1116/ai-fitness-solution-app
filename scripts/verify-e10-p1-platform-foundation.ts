/**
 * E10-P1 — Platform Foundation verification
 * Platform kernel above E09 Global Autonomous Enterprise Network
 */
import fs from "node:fs";
import path from "node:path";

import {
  E10_PLATFORM_BASE,
  E10_PLATFORM_FREEZE_VERSION,
  E10_PLATFORM_ID,
  E10_PLATFORM_VERSION,
  PLATFORM_LIFECYCLE_STAGES,
  PLATFORM_MODULE_KINDS,
  PLATFORM_RUNTIME_STATUSES,
} from "../lib/platform/e10/core/platform.constants";
import {
  activateModule,
  buildPlatformFoundation,
  canAdvancePlatformLifecycle,
  clearLifecycles,
  createModule,
  getModuleLifecycle,
  getPlatformInfo,
  registerCreatedModule,
  removeCreatedModule,
  suspendModule,
} from "../lib/platform/e10/core/platform.lifecycle";
import {
  clearModules,
  getModule,
  listModules,
} from "../lib/platform/e10/core/platform.registry";
import { createPlatformRuntime } from "../lib/platform/e10/core/platform.runtime";
import {
  E10_P1_FREEZE_LOCK,
  E10_P1_PLATFORM_FREEZE_VERSION,
} from "../lib/platform/e10/signoff/freeze.lock";
import { checkE10P1ReleaseGate } from "../lib/platform/e10/signoff/release.gate";
import {
  assertE10P1FreezePass,
  buildE10P1FreezeManifest,
} from "../lib/platform/e10/signoff/signoff.manifest";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModules() {
  const required = [
    "lib/platform/e10/core/platform.constants.ts",
    "lib/platform/e10/core/platform.types.ts",
    "lib/platform/e10/core/platform.registry.ts",
    "lib/platform/e10/core/platform.lifecycle.ts",
    "lib/platform/e10/core/platform.runtime.ts",
    "lib/platform/e10/signoff/freeze.lock.ts",
    "lib/platform/e10/signoff/release.gate.ts",
    "lib/platform/e10/signoff/signoff.manifest.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(
    E10_PLATFORM_ID === "enterprise-e10-platform-kernel-v1",
    "platform id",
  );
  check(E10_PLATFORM_VERSION === "e10-platform-1", "platform version");
  check(
    E10_PLATFORM_FREEZE_VERSION === "e10-platform-freeze-1",
    "platform freeze version",
  );
  check(
    E10_PLATFORM_BASE ===
      "enterprise-e09-global-autonomous-enterprise-network-freeze-v1",
    "platform base",
  );
  check(
    E10_P1_PLATFORM_FREEZE_VERSION ===
      "e10-p1-platform-foundation-freeze-1",
    "p1 freeze version",
  );
  check(E10_P1_FREEZE_LOCK.base === E10_PLATFORM_BASE, "freeze lock base");
  check(PLATFORM_MODULE_KINDS.length === 4, "module kinds");
  check(PLATFORM_LIFECYCLE_STAGES.length === 5, "lifecycle stages");
  check(PLATFORM_RUNTIME_STATUSES.length === 4, "runtime statuses");
  console.log("✓ version constants");
}

function testFoundationRegistryLifecycle() {
  clearLifecycles();
  clearModules();

  const info = getPlatformInfo();
  check(info.platformId === E10_PLATFORM_ID, "platform info id");
  check(info.base === E10_PLATFORM_BASE, "platform info base");

  const foundation = buildPlatformFoundation();
  check(foundation.ready === true, "foundation ready");
  check(foundation.base === E10_PLATFORM_BASE, "foundation base");

  const created = createModule({
    id: "e10.verify.core",
    name: "Verify Core",
    kind: "CORE",
  });
  check(
    getModuleLifecycle(created.id)?.current === "created",
    "created stage",
  );

  const registered = registerCreatedModule(created);
  check(registered.status === "REGISTERED", "registered status");
  check(
    getModuleLifecycle(registered.id)?.current === "registered",
    "registered stage",
  );
  check(!!getModule(registered.id), "module in registry");

  const activated = activateModule(registered.id);
  check(activated.status === "ACTIVE", "activated status");
  check(
    canAdvancePlatformLifecycle("activated", "suspended"),
    "can suspend",
  );

  const suspended = suspendModule(registered.id);
  check(suspended.status === "SUSPENDED", "suspended status");

  activateModule(registered.id);
  check(listModules({ status: "ACTIVE" }).length === 1, "list active");

  check(removeCreatedModule(registered.id) === true, "removed");
  check(!getModule(registered.id), "gone from registry");
  check(
    getModuleLifecycle(registered.id)?.current === "removed",
    "removed stage",
  );

  clearLifecycles();
  clearModules();
  console.log("✓ foundation / registry / lifecycle");
}

function testRuntimeStub() {
  clearLifecycles();
  clearModules();

  const runtime = createPlatformRuntime({ runtimeId: "e10-p1-verify" });
  check(runtime.initialize().status === "READY", "runtime ready");
  check(runtime.start().status === "RUNNING", "runtime running");
  check(runtime.status().moduleCount === 0, "runtime empty modules");
  check(runtime.stop().status === "STOPPED", "runtime stopped");

  clearLifecycles();
  clearModules();
  console.log("✓ runtime stub");
}

function testSignoff() {
  const gate = checkE10P1ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");

  const manifest = buildE10P1FreezeManifest({
    deploymentId: "e10-p1-verify",
  });
  check(manifest.freezeState.frozen === true, "manifest frozen");
  check(manifest.base === E10_PLATFORM_BASE, "manifest base");
  assertE10P1FreezePass(manifest);
  console.log("✓ freeze gate / signoff manifest");
}

function main() {
  console.log("E10-P1 Platform Foundation verify");
  checkModules();
  checkConstants();
  testFoundationRegistryLifecycle();
  testRuntimeStub();
  testSignoff();
  console.log("ALL PASS");
}

main();
