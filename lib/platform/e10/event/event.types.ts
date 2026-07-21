/**
 * E10-P4 — Platform Event Bus types
 * Event layer above E10 Platform Resource Manager
 */

import type { PlatformMetadata } from "../core/platform.types";
import {
  DISPATCH_STATUSES,
  E10_EVENT_BASE,
  E10_EVENT_FREEZE_VERSION,
  E10_EVENT_ID,
  E10_EVENT_VERSION,
  EVENT_KINDS,
  EVENT_MANAGER_STATUSES,
  EVENT_PRIORITIES,
  LISTENER_STATUSES,
} from "./event.constants";

export type EventKind = (typeof EVENT_KINDS)[number];
export type EventPriority = (typeof EVENT_PRIORITIES)[number];
export type ListenerStatus = (typeof LISTENER_STATUSES)[number];
export type EventManagerStatus = (typeof EVENT_MANAGER_STATUSES)[number];
export type DispatchStatus = (typeof DISPATCH_STATUSES)[number];

export type { PlatformMetadata };

export type EventTypeDefinition = {
  type: string;
  kind: EventKind;
  description: string;
  version: string;
  metadata: PlatformMetadata;
};

export type RegisterEventTypeInput = {
  type: string;
  kind: EventKind;
  description: string;
  version?: string;
  metadata?: PlatformMetadata;
};

export type PlatformEvent = {
  id: string;
  type: string;
  kind: EventKind;
  priority: EventPriority;
  source: string;
  payload: PlatformMetadata;
  createdAt: string;
  /** Sequence number in bus history */
  sequence: number;
};

export type PublishEventInput = {
  id?: string;
  type: string;
  priority?: EventPriority;
  source: string;
  payload?: PlatformMetadata;
};

export type EventListener = {
  id: string;
  name: string;
  eventType: string;
  status: ListenerStatus;
  /** Optional binding to E10-P2 runtime service id */
  serviceId?: string;
  receivedCount: number;
  registeredAt: string;
  metadata: PlatformMetadata;
};

export type RegisterListenerInput = {
  id: string;
  name: string;
  eventType: string;
  serviceId?: string;
  metadata?: PlatformMetadata;
  /** Sync handler invoked on dispatch */
  handler?: (event: PlatformEvent) => void;
};

export type DispatchResult = {
  eventId: string;
  status: DispatchStatus;
  listenerIds: string[];
  deliveredCount: number;
  failedCount: number;
  errors: string[];
  dispatchedAt: string;
};

export type ReplayResult = {
  fromSequence: number;
  toSequence: number;
  replayedCount: number;
  results: DispatchResult[];
  replayedAt: string;
};

export type EventBusSnapshot = {
  typeCount: number;
  listenerCount: number;
  activeListenerCount: number;
  historyCount: number;
  lastSequence: number;
};

export type EventRegistryManifest = {
  eventId: typeof E10_EVENT_ID;
  version: typeof E10_EVENT_VERSION;
  freezeVersion: typeof E10_EVENT_FREEZE_VERSION;
  base: typeof E10_EVENT_BASE;
  typeCount: number;
  listenerCount: number;
  types: EventTypeDefinition[];
};
