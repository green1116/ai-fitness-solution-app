/**
 * E10-P4 — Event Dispatcher + Replay Stub
 */

import { listEvents } from "./event.bus";
import {
  bumpReceivedCount,
  getActiveListenersInternal,
} from "./event.listener";
import type {
  DispatchResult,
  PlatformEvent,
  ReplayResult,
} from "./event.types";

function nowIso(): string {
  return new Date().toISOString();
}

/** Dispatch a published event to all ACTIVE listeners of its type. */
export function dispatchEvent(event: PlatformEvent): DispatchResult {
  const listeners = getActiveListenersInternal(event.type);
  const listenerIds: string[] = [];
  const errors: string[] = [];
  let deliveredCount = 0;
  let failedCount = 0;

  if (listeners.length === 0) {
    return {
      eventId: event.id,
      status: "SKIPPED",
      listenerIds: [],
      deliveredCount: 0,
      failedCount: 0,
      errors: ["no active listeners"],
      dispatchedAt: nowIso(),
    };
  }

  for (const listener of listeners) {
    listenerIds.push(listener.id);
    try {
      if (listener.handler) {
        listener.handler({
          ...event,
          payload: { ...event.payload },
        });
      }
      bumpReceivedCount(listener.id);
      deliveredCount += 1;
    } catch (error) {
      failedCount += 1;
      errors.push(
        `${listener.id}: ${error instanceof Error ? error.message : "handler failed"}`,
      );
    }
  }

  let status: DispatchResult["status"] = "DELIVERED";
  if (failedCount === listeners.length) status = "FAILED";
  else if (failedCount > 0) status = "PARTIAL";

  return {
    eventId: event.id,
    status,
    listenerIds,
    deliveredCount,
    failedCount,
    errors,
    dispatchedAt: nowIso(),
  };
}

/**
 * Replay stub: re-dispatch events in a sequence window.
 * In-memory only — no durable broker replay.
 */
export function replayEvents(input: {
  fromSequence: number;
  toSequence?: number;
  type?: string;
}): ReplayResult {
  const fromSequence = input.fromSequence;
  if (!Number.isFinite(fromSequence) || fromSequence < 1) {
    throw new Error("fromSequence must be a finite number >= 1");
  }

  const events = listEvents({
    type: input.type,
    fromSequence,
    toSequence: input.toSequence,
  });

  const results = events.map((event) => dispatchEvent(event));

  return {
    fromSequence,
    toSequence: input.toSequence ?? events[events.length - 1]?.sequence ?? fromSequence,
    replayedCount: events.length,
    results,
    replayedAt: nowIso(),
  };
}
