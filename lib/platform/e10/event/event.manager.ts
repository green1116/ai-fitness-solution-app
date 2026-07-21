/**
 * E10-P4 — Event Manager
 * Orchestrates registry, listeners, bus publish, and dispatch
 */

import {
  E10_EVENT_ID,
  E10_EVENT_VERSION,
  EVENT_MANAGER_STATUSES,
} from "./event.constants";
import {
  clearEventBus,
  getBusSnapshot,
  getEvent,
  listEvents,
  publishEvent,
} from "./event.bus";
import { dispatchEvent, replayEvents } from "./event.dispatcher";
import {
  activateListener,
  clearListeners,
  getListener,
  listListeners,
  pauseListener,
  registerListener,
  removeListener,
} from "./event.listener";
import {
  buildEventRegistryManifest,
  clearEventTypes,
  getEventType,
  listEventTypes,
  registerEventType,
  removeEventType,
} from "./event.registry";
import type {
  DispatchResult,
  EventManagerStatus,
  EventTypeDefinition,
  PlatformEvent,
  PublishEventInput,
  RegisterEventTypeInput,
  RegisterListenerInput,
  ReplayResult,
  EventListener,
} from "./event.types";

export type EventManagerSnapshot = {
  managerId: string;
  status: EventManagerStatus;
  layerId: typeof E10_EVENT_ID;
  version: typeof E10_EVENT_VERSION;
  typeCount: number;
  listenerCount: number;
  activeListenerCount: number;
  historyCount: number;
  lastSequence: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type EventManager = {
  initialize: () => EventManagerSnapshot;
  start: () => EventManagerSnapshot;
  stop: () => EventManagerSnapshot;
  status: () => EventManagerSnapshot;
  registerEventType: (input: RegisterEventTypeInput) => EventTypeDefinition;
  getEventType: typeof getEventType;
  listEventTypes: typeof listEventTypes;
  removeEventType: (type: string) => boolean;
  registerListener: (input: RegisterListenerInput) => EventListener;
  activateListener: (id: string) => EventListener;
  pauseListener: (id: string) => EventListener;
  removeListener: (id: string) => boolean;
  getListener: typeof getListener;
  listListeners: typeof listListeners;
  publish: (input: PublishEventInput) => PlatformEvent;
  /** Publish then immediately dispatch */
  publishAndDispatch: (input: PublishEventInput) => {
    event: PlatformEvent;
    dispatch: DispatchResult;
  };
  dispatch: (eventId: string) => DispatchResult;
  replay: (input: {
    fromSequence: number;
    toSequence?: number;
    type?: string;
  }) => ReplayResult;
  getEvent: typeof getEvent;
  listEvents: typeof listEvents;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function createEventManager(options?: {
  managerId?: string;
}): EventManager {
  const managerId =
    options?.managerId?.trim() || createId("e10-evt-mgr");
  let state: EventManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): EventManagerSnapshot {
    const bus = getBusSnapshot({
      typeCount: listEventTypes().length,
      listenerCount: listListeners().length,
      activeListenerCount: listListeners({ status: "ACTIVE" }).length,
    });
    return {
      managerId,
      status: state,
      layerId: E10_EVENT_ID,
      version: E10_EVENT_VERSION,
      typeCount: bus.typeCount,
      listenerCount: bus.listenerCount,
      activeListenerCount: bus.activeListenerCount,
      historyCount: bus.historyCount,
      lastSequence: bus.lastSequence,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): EventManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearEventBus();
    clearListeners();
    clearEventTypes();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): EventManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(
        `start requires READY or STOPPED (current=${state})`,
      );
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): EventManagerSnapshot {
    if (state !== "RUNNING") {
      throw new Error(`stop requires RUNNING (current=${state})`);
    }
    // Pause active listeners on shutdown
    for (const listener of listListeners({ status: "ACTIVE" })) {
      pauseListener(listener.id);
    }
    state = "STOPPED";
    stoppedAt = nowIso();
    return snapshot();
  }

  return {
    initialize,
    start,
    stop,
    status: snapshot,
    registerEventType: (input) => {
      assertRunning("registerEventType");
      return registerEventType(input);
    },
    getEventType,
    listEventTypes,
    removeEventType: (type) => {
      assertRunning("removeEventType");
      return removeEventType(type);
    },
    registerListener: (input) => {
      assertRunning("registerListener");
      return registerListener(input);
    },
    activateListener: (id) => {
      assertRunning("activateListener");
      return activateListener(id);
    },
    pauseListener: (id) => {
      assertRunning("pauseListener");
      return pauseListener(id);
    },
    removeListener: (id) => {
      assertRunning("removeListener");
      return removeListener(id);
    },
    getListener,
    listListeners,
    publish: (input) => {
      assertRunning("publish");
      return publishEvent(input);
    },
    publishAndDispatch: (input) => {
      assertRunning("publishAndDispatch");
      const event = publishEvent(input);
      const dispatch = dispatchEvent(event);
      return { event, dispatch };
    },
    dispatch: (eventId) => {
      assertRunning("dispatch");
      const event = getEvent(eventId);
      if (!event) throw new Error(`event not found: ${eventId}`);
      return dispatchEvent(event);
    },
    replay: (input) => {
      assertRunning("replay");
      return replayEvents(input);
    },
    getEvent,
    listEvents,
  };
}

export function getEventRegistryManifest() {
  return buildEventRegistryManifest(listListeners().length);
}

export { EVENT_MANAGER_STATUSES };
