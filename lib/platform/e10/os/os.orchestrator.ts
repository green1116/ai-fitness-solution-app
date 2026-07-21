/**
 * E10-P7 — OS Orchestrator
 * Component startup ordering + runtime coordination (P1–P6)
 * No new subsystem — only wires existing managers
 */

import { E10_PLATFORM_ID } from "../core/platform.constants";
import { buildPlatformFoundation } from "../core/platform.lifecycle";
import { E10_EVENT_ID } from "../event/event.constants";
import {
  createEventManager,
  type EventManager,
} from "../event/event.manager";
import { E10_GATEWAY_ID } from "../gateway/gateway.constants";
import {
  createGatewayManager,
  type GatewayManager,
} from "../gateway/gateway.manager";
import { E10_MARKETPLACE_ID } from "../marketplace/marketplace.constants";
import {
  createMarketplaceManager,
  type MarketplaceManager,
} from "../marketplace/marketplace.manager";
import { E10_RESOURCE_ID } from "../resource/resource.constants";
import {
  createResourceManager,
  type ResourceManager,
} from "../resource/resource.manager";
import { E10_RUNTIME_ID } from "../runtime/runtime.constants";
import {
  createRuntimeManager,
  type RuntimeManager,
} from "../runtime/runtime.manager";
import { OS_BOOT_ORDER } from "./os.constants";
import {
  beginBoot,
  beginShutdown,
  getKernelStatus,
  markReady,
  markRunning,
  markStopped,
} from "./os.kernel";
import {
  getComponentByKind,
  listComponents,
  registerComponent,
  setComponentStatus,
} from "./os.registry";
import type {
  BootResult,
  OsComponentKind,
  ShutdownResult,
} from "./os.types";

export type LayerHandles = {
  runtime?: RuntimeManager;
  resource?: ResourceManager;
  event?: EventManager;
  gateway?: GatewayManager;
  marketplace?: MarketplaceManager;
};

function nowIso(): string {
  return new Date().toISOString();
}

/** Register the six built-in platform components if missing. */
export function ensureDefaultComponents(): void {
  const defs: Array<{
    id: string;
    name: string;
    kind: OsComponentKind;
    layerId: string;
  }> = [
    {
      id: "e10.os.foundation",
      name: "Platform Foundation",
      kind: "FOUNDATION",
      layerId: E10_PLATFORM_ID,
    },
    {
      id: "e10.os.runtime",
      name: "Platform Runtime",
      kind: "RUNTIME",
      layerId: E10_RUNTIME_ID,
    },
    {
      id: "e10.os.resource",
      name: "Platform Resource",
      kind: "RESOURCE",
      layerId: E10_RESOURCE_ID,
    },
    {
      id: "e10.os.event",
      name: "Platform Event Bus",
      kind: "EVENT",
      layerId: E10_EVENT_ID,
    },
    {
      id: "e10.os.gateway",
      name: "Platform API Gateway",
      kind: "GATEWAY",
      layerId: E10_GATEWAY_ID,
    },
    {
      id: "e10.os.marketplace",
      name: "Platform Marketplace",
      kind: "MARKETPLACE",
      layerId: E10_MARKETPLACE_ID,
    },
  ];

  for (const def of defs) {
    if (!getComponentByKind(def.kind)) {
      registerComponent(def);
    }
  }
}

function startLayer(
  kind: OsComponentKind,
  handles: LayerHandles,
): void {
  switch (kind) {
    case "FOUNDATION": {
      const foundation = buildPlatformFoundation();
      if (!foundation.ready) {
        throw new Error("foundation not ready");
      }
      break;
    }
    case "RUNTIME": {
      const mgr = createRuntimeManager({ runtimeId: "e10-os-runtime" });
      mgr.initialize();
      mgr.start();
      handles.runtime = mgr;
      break;
    }
    case "RESOURCE": {
      const mgr = createResourceManager({ managerId: "e10-os-resource" });
      mgr.initialize();
      mgr.start();
      handles.resource = mgr;
      break;
    }
    case "EVENT": {
      const mgr = createEventManager({ managerId: "e10-os-event" });
      mgr.initialize();
      mgr.start();
      handles.event = mgr;
      break;
    }
    case "GATEWAY": {
      const mgr = createGatewayManager({ managerId: "e10-os-gateway" });
      mgr.initialize();
      mgr.start();
      handles.gateway = mgr;
      break;
    }
    case "MARKETPLACE": {
      const mgr = createMarketplaceManager({
        managerId: "e10-os-marketplace",
      });
      mgr.initialize();
      mgr.start();
      handles.marketplace = mgr;
      break;
    }
    default:
      throw new Error(`unknown component kind: ${kind as string}`);
  }
}

function stopLayer(kind: OsComponentKind, handles: LayerHandles): void {
  switch (kind) {
    case "FOUNDATION":
      // Foundation is stateless probe — nothing to stop
      break;
    case "RUNTIME":
      if (handles.runtime?.status().status === "RUNNING") {
        handles.runtime.stop();
      }
      handles.runtime = undefined;
      break;
    case "RESOURCE":
      if (handles.resource?.status().status === "RUNNING") {
        handles.resource.stop();
      }
      handles.resource = undefined;
      break;
    case "EVENT":
      if (handles.event?.status().status === "RUNNING") {
        handles.event.stop();
      }
      handles.event = undefined;
      break;
    case "GATEWAY":
      if (handles.gateway?.status().status === "RUNNING") {
        handles.gateway.stop();
      }
      handles.gateway = undefined;
      break;
    case "MARKETPLACE":
      if (handles.marketplace?.status().status === "RUNNING") {
        handles.marketplace.stop();
      }
      handles.marketplace = undefined;
      break;
    default:
      throw new Error(`unknown component kind: ${kind as string}`);
  }
}

/** Boot all registered components in OS_BOOT_ORDER. */
export function bootPlatform(handles: LayerHandles): BootResult {
  ensureDefaultComponents();
  beginBoot();

  const started: string[] = [];
  const failed: string[] = [];
  const order = [...OS_BOOT_ORDER];

  for (const kind of order) {
    const component = getComponentByKind(kind);
    if (!component) {
      failed.push(kind);
      continue;
    }
    try {
      setComponentStatus(component.id, "STARTING");
      startLayer(kind, handles);
      setComponentStatus(component.id, "RUNNING");
      started.push(component.id);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "boot failed";
      setComponentStatus(component.id, "FAILED", msg);
      failed.push(component.id);
    }
  }

  if (failed.length === 0) {
    markReady();
    markRunning();
  } else if (started.length > 0) {
    // Partial boot — still mark running but leave FAILED components
    markReady();
    markRunning();
  }

  return {
    kernelStatus: getKernelStatus(),
    started,
    failed,
    order,
    bootedAt: nowIso(),
  };
}

/** Shutdown components in reverse boot order. */
export function shutdownPlatform(handles: LayerHandles): ShutdownResult {
  beginShutdown();

  const stopped: string[] = [];
  const failed: string[] = [];
  const order = [...OS_BOOT_ORDER].reverse();

  for (const kind of order) {
    const component = getComponentByKind(kind);
    if (!component) continue;
    if (
      component.status !== "RUNNING" &&
      component.status !== "FAILED" &&
      component.status !== "STARTING"
    ) {
      continue;
    }
    try {
      setComponentStatus(component.id, "STOPPING");
      stopLayer(kind, handles);
      setComponentStatus(component.id, "STOPPED");
      stopped.push(component.id);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "shutdown failed";
      setComponentStatus(component.id, "FAILED", msg);
      failed.push(component.id);
    }
  }

  markStopped();

  return {
    kernelStatus: getKernelStatus(),
    stopped,
    failed,
    order,
    stoppedAt: nowIso(),
  };
}

export function getBootOrder(): OsComponentKind[] {
  return [...OS_BOOT_ORDER];
}

export function listOrderedComponents() {
  return listComponents().sort(
    (a, b) => a.bootOrder - b.bootOrder || a.id.localeCompare(b.id),
  );
}
