/**
 * E10-P4 — Platform Event Bus verification
 * Event layer above E10-P3 Platform Resource Manager
 */
import fs from "node:fs";
import path from "node:path";

import { E10_PLATFORM_ID } from "../lib/platform/e10/core/platform.constants";
import { buildPlatformFoundation } from "../lib/platform/e10/core/platform.lifecycle";
import { clearEventBus } from "../lib/platform/e10/event/event.bus";
import {
  E10_EVENT_BASE,
  E10_EVENT_FREEZE_VERSION,
  E10_EVENT_ID,
  E10_EVENT_VERSION,
  DISPATCH_STATUSES,
  EVENT_KINDS,
  EVENT_MANAGER_STATUSES,
  EVENT_PRIORITIES,
  LISTENER_STATUSES,
} from "../lib/platform/e10/event/event.constants";
import { clearListeners } from "../lib/platform/e10/event/event.listener";
import {
  createEventManager,
  getEventRegistryManifest,
} from "../lib/platform/e10/event/event.manager";
import { clearEventTypes } from "../lib/platform/e10/event/event.registry";
import {
  E10_RESOURCE_BASE,
  E10_RESOURCE_ID,
} from "../lib/platform/e10/resource/resource.constants";
import { clearAllocations } from "../lib/platform/e10/resource/resource.allocation";
import { clearPools } from "../lib/platform/e10/resource/resource.pool";
import { clearQuotas } from "../lib/platform/e10/resource/resource.quota";
import {
  E10_RUNTIME_ID,
} from "../lib/platform/e10/runtime/runtime.constants";
import { createRuntimeManager } from "../lib/platform/e10/runtime/runtime.manager";
import { clearServices } from "../lib/platform/e10/runtime/runtime.registry";
import {
  assertE10P4ReleaseGatePass,
  checkE10P4ReleaseGate,
  E10_P4_EVENT_FREEZE_VERSION,
} from "../lib/platform/e10/signoff/event.release.gate";

const ROOT = path.resolve(__dirname, "..");

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function cleanup() {
  clearEventBus();
  clearListeners();
  clearEventTypes();
  clearAllocations();
  clearQuotas();
  clearPools();
  clearServices();
}

function checkModules() {
  const required = [
    "lib/platform/e10/event/event.constants.ts",
    "lib/platform/e10/event/event.types.ts",
    "lib/platform/e10/event/event.bus.ts",
    "lib/platform/e10/event/event.registry.ts",
    "lib/platform/e10/event/event.dispatcher.ts",
    "lib/platform/e10/event/event.listener.ts",
    "lib/platform/e10/event/event.manager.ts",
    "lib/platform/e10/signoff/event.release.gate.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ module structure");
}

function checkConstants() {
  check(E10_EVENT_ID === "enterprise-e10-platform-event-v1", "event id");
  check(E10_EVENT_VERSION === "e10-event-1", "event version");
  check(E10_EVENT_FREEZE_VERSION === "e10-event-freeze-1", "event freeze");
  check(
    E10_EVENT_BASE === "enterprise-e10-p3-platform-resource-v1",
    "event base",
  );
  check(
    E10_P4_EVENT_FREEZE_VERSION === "e10-p4-platform-event-freeze-1",
    "p4 freeze version",
  );
  check(EVENT_KINDS.length === 5, "event kinds");
  check(EVENT_PRIORITIES.length === 4, "priorities");
  check(LISTENER_STATUSES.length === 4, "listener statuses");
  check(EVENT_MANAGER_STATUSES.length === 4, "manager statuses");
  check(DISPATCH_STATUSES.length === 4, "dispatch statuses");
  console.log("✓ version constants");
}

function checkUpstreamCompatible() {
  cleanup();
  const foundation = buildPlatformFoundation();
  check(foundation.ready === true, "P1 foundation still ready");
  check(foundation.platformId === E10_PLATFORM_ID, "P1 platform id");
  check(
    E10_RUNTIME_ID === "enterprise-e10-platform-runtime-v1",
    "P2 runtime id",
  );
  check(
    E10_RESOURCE_ID === "enterprise-e10-platform-resource-v1",
    "P3 resource id",
  );
  check(
    E10_RESOURCE_BASE === "enterprise-e10-p2-platform-runtime-v1",
    "P3 base intact",
  );
  console.log("✓ P1/P2/P3 compatibility");
}

function testEventStack() {
  cleanup();

  const manager = createEventManager({ managerId: "e10-p4-verify" });
  check(manager.initialize().status === "READY", "manager ready");
  check(manager.start().status === "RUNNING", "manager running");

  const type = manager.registerEventType({
    type: "platform.verify.ready",
    kind: "SYSTEM",
    description: "Verify ready event",
  });
  check(type.type === "platform.verify.ready", "event type registered");

  const inbox: string[] = [];
  const listener = manager.registerListener({
    id: "e10.verify.listener",
    name: "Verify Listener",
    eventType: type.type,
    handler: (event) => {
      inbox.push(`${event.type}:${event.sequence}`);
    },
  });
  check(listener.status === "REGISTERED", "listener registered");
  manager.activateListener(listener.id);

  const first = manager.publishAndDispatch({
    type: type.type,
    source: "verify",
    payload: { n: 1 },
  });
  check(first.dispatch.status === "DELIVERED", "first delivered");
  check(inbox.length === 1, "handler invoked");

  manager.publish({ type: type.type, source: "verify", priority: "HIGH" });
  const secondDispatch = manager.dispatch(
    manager.listEvents()[1]!.id,
  );
  check(secondDispatch.status === "DELIVERED", "second delivered");

  const replay = manager.replay({ fromSequence: 1, toSequence: 2 });
  check(replay.replayedCount === 2, "replay count");
  check(inbox.length >= 3, "replay invoked handlers");

  manager.pauseListener(listener.id);
  const skipped = manager.publishAndDispatch({
    type: type.type,
    source: "verify",
  });
  check(skipped.dispatch.status === "SKIPPED", "paused skips");

  const snap = manager.status();
  check(snap.historyCount >= 3, "history count");
  check(snap.lastSequence >= 3, "last sequence");

  const manifest = getEventRegistryManifest();
  check(manifest.base === E10_EVENT_BASE, "manifest base");
  check(manifest.typeCount === 1, "manifest types");

  // Optional runtime binding
  const runtime = createRuntimeManager({ runtimeId: "e10-p4-verify-rt" });
  runtime.initialize();
  runtime.start();
  const svc = runtime.registerService({
    id: "e10.verify.evt.svc",
    name: "Evt Svc",
    kind: "MONITOR",
  });
  manager.registerEventType({
    type: "platform.verify.runtime",
    kind: "RUNTIME",
    description: "Runtime bound",
  });
  const bound = manager.registerListener({
    id: "e10.verify.bound",
    name: "Bound Listener",
    eventType: "platform.verify.runtime",
    serviceId: svc.id,
  });
  check(bound.serviceId === svc.id, "service-bound listener");

  manager.stop();
  check(manager.status().status === "STOPPED", "manager stopped");
  runtime.stop();

  cleanup();
  console.log("✓ registry / bus / listener / dispatch / replay / manager");
}

function testSignoff() {
  const gate = checkE10P4ReleaseGate();
  check(gate.result === "PASS", `gate pass: ${gate.summary}`);
  check(gate.failCount === 0, "gate failCount 0");
  assertE10P4ReleaseGatePass(gate);
  console.log("✓ event release gate");
}

function main() {
  console.log("E10-P4 Platform Event Bus verify");
  checkModules();
  checkConstants();
  checkUpstreamCompatible();
  testEventStack();
  testSignoff();
  console.log("ALL PASS");
}

main();
