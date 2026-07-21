/**
 * E10-P4 — Event Release Gate
 * Checks platform event bus modules → PASS / FAIL
 */

import {
  E10_EVENT_BASE,
  E10_EVENT_ID,
  E10_EVENT_VERSION,
  EVENT_KINDS,
  EVENT_MANAGER_STATUSES,
} from "../event/event.constants";
import { clearEventBus } from "../event/event.bus";
import { clearListeners } from "../event/event.listener";
import {
  createEventManager,
  getEventRegistryManifest,
} from "../event/event.manager";
import { clearEventTypes } from "../event/event.registry";
import { clearAllocations } from "../resource/resource.allocation";
import { clearPools } from "../resource/resource.pool";
import { clearQuotas } from "../resource/resource.quota";
import { createRuntimeManager } from "../runtime/runtime.manager";
import { clearServices } from "../runtime/runtime.registry";
import type {
  GateCheckItem,
  GateVerdict,
  ReleaseGateResult,
} from "./release.gate";

export type {
  GateCheckItem,
  GateVerdict,
  ReleaseGateResult,
};

export const E10_P4_SIGNOFF_VERSION = "e10-p4-signoff-1" as const;
export const E10_P4_EVENT_FREEZE_VERSION =
  "e10-p4-platform-event-freeze-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanup(): void {
  clearEventBus();
  clearListeners();
  clearEventTypes();
  clearAllocations();
  clearQuotas();
  clearPools();
  clearServices();
}

/** Probe P4 event bus via public APIs (no filesystem dependency). */
export function checkE10P4ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "EV-P4-CONSTANTS",
      "event",
      "Event version constants",
      E10_EVENT_ID === "enterprise-e10-platform-event-v1" &&
        E10_EVENT_VERSION === "e10-event-1" &&
        E10_EVENT_BASE === "enterprise-e10-p3-platform-resource-v1" &&
        EVENT_KINDS.length === 5 &&
        EVENT_MANAGER_STATUSES.length === 4,
      `id=${E10_EVENT_ID} base=${E10_EVENT_BASE}`,
    ),
  );

  // Registry / publish / subscribe / dispatch / replay
  try {
    cleanup();
    const manager = createEventManager({ managerId: "e10-p4-gate" });
    manager.initialize();
    manager.start();

    const type = manager.registerEventType({
      type: "platform.gate.signal",
      kind: "SIGNAL",
      description: "Gate signal event",
    });

    const received: string[] = [];
    const listener = manager.registerListener({
      id: "e10.p4.gate.listener",
      name: "Gate Listener",
      eventType: type.type,
      handler: (event) => {
        received.push(event.id);
      },
    });
    manager.activateListener(listener.id);

    const published = manager.publishAndDispatch({
      id: "e10.p4.gate.evt.1",
      type: type.type,
      source: "e10-p4-gate",
      payload: { ok: true },
    });

    const second = manager.publish({
      id: "e10.p4.gate.evt.2",
      type: type.type,
      source: "e10-p4-gate",
      priority: "HIGH",
    });
    const dispatched = manager.dispatch(second.id);
    const replay = manager.replay({ fromSequence: 1 });
    const snap = manager.status();
    const manifest = getEventRegistryManifest();

    const ok =
      type.kind === "SIGNAL" &&
      listener.status === "REGISTERED" &&
      published.dispatch.status === "DELIVERED" &&
      published.dispatch.deliveredCount === 1 &&
      received.includes(published.event.id) &&
      dispatched.status === "DELIVERED" &&
      replay.replayedCount >= 2 &&
      snap.status === "RUNNING" &&
      snap.historyCount >= 2 &&
      snap.activeListenerCount === 1 &&
      manifest.eventId === E10_EVENT_ID &&
      manifest.base === E10_EVENT_BASE;

    checks.push(
      check(
        "EV-P4-MANAGER",
        "event",
        "Event registry / bus / dispatch / replay",
        ok,
        `delivered=${published.dispatch.deliveredCount} replay=${replay.replayedCount} history=${snap.historyCount}`,
      ),
    );

    // Listener lifecycle pause → skip
    manager.pauseListener(listener.id);
    const skipped = manager.publishAndDispatch({
      type: type.type,
      source: "e10-p4-gate",
    });
    const pauseOk = skipped.dispatch.status === "SKIPPED";
    checks.push(
      check(
        "EV-P4-LISTENER",
        "event",
        "Listener pause skips dispatch",
        pauseOk,
        `status=${skipped.dispatch.status}`,
      ),
    );

    manager.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "EV-P4-MANAGER",
        "event",
        "Event registry / bus / dispatch / replay",
        false,
        error instanceof Error ? error.message : "event probe failed",
      ),
    );
  }

  // P2 compatibility: optional serviceId binding
  try {
    cleanup();
    const runtime = createRuntimeManager({ runtimeId: "e10-p4-compat-rt" });
    runtime.initialize();
    runtime.start();
    const service = runtime.registerService({
      id: "e10.p4.compat.svc",
      name: "Compat Svc",
      kind: "ADAPTER",
    });

    const manager = createEventManager({ managerId: "e10-p4-compat" });
    manager.initialize();
    manager.start();
    manager.registerEventType({
      type: "platform.compat.ping",
      kind: "RUNTIME",
      description: "Compat ping",
    });
    const listener = manager.registerListener({
      id: "e10.p4.compat.listener",
      name: "Compat Listener",
      eventType: "platform.compat.ping",
      serviceId: service.id,
    });
    manager.activateListener(listener.id);
    const result = manager.publishAndDispatch({
      type: "platform.compat.ping",
      source: service.id,
    });

    const compatOk =
      listener.serviceId === service.id &&
      result.dispatch.status === "DELIVERED";

    checks.push(
      check(
        "EV-P4-COMPAT",
        "event",
        "Runtime-compatible service-bound listener",
        compatOk,
        `serviceId=${listener.serviceId} dispatch=${result.dispatch.status}`,
      ),
    );

    manager.stop();
    runtime.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "EV-P4-COMPAT",
        "event",
        "Runtime-compatible service-bound listener",
        false,
        error instanceof Error ? error.message : "compat probe failed",
      ),
    );
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `e10-p4-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertE10P4ReleaseGatePass(
  gate: ReleaseGateResult = checkE10P4ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`E10-P4 release gate failed: ${gate.summary}`);
  }
}
