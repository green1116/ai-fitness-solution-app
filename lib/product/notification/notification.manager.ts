/**
 * Product Notification — Notification Foundation Manager
 */

import {
  clearNotificationChannels,
  getNotificationChannel,
  listNotificationChannels,
  registerNotificationChannel,
  updateNotificationChannelStatus,
} from "./channel/channel.registry";
import type {
  NotificationChannel,
  RegisterNotificationChannelInput,
  UpdateNotificationChannelStatusInput,
} from "./channel/channel.types";
import {
  clearNotificationDeliveries,
  getNotificationDelivery,
  listNotificationDeliveries,
  queueNotificationDelivery,
  updateNotificationDeliveryStatus,
} from "./delivery/delivery.registry";
import type {
  NotificationDelivery,
  QueueNotificationDeliveryInput,
  UpdateNotificationDeliveryStatusInput,
} from "./delivery/delivery.types";
import {
  PRODUCT_NOTIFICATION_FOUNDATION_BASE,
  PRODUCT_NOTIFICATION_FOUNDATION_FREEZE_VERSION,
  PRODUCT_NOTIFICATION_FOUNDATION_ID,
  PRODUCT_NOTIFICATION_FOUNDATION_VERSION,
} from "./foundation/foundation.constants";
import {
  assertNotificationFoundationReadinessReady,
  evaluateNotificationFoundationReadiness,
} from "./foundation/foundation.readiness";
import type {
  NotificationManagerStatus,
  NotificationReadinessResult,
  NotificationRegistryManifest,
} from "./foundation/foundation.types";
import {
  clearNotificationMessages,
  composeNotificationMessage,
  getNotificationMessage,
  listNotificationMessages,
} from "./message/message.registry";
import type {
  ComposeNotificationMessageInput,
  NotificationMessage,
} from "./message/message.types";
import {
  clearNotificationTemplates,
  getNotificationTemplate,
  listNotificationTemplates,
  registerNotificationTemplate,
} from "./template/template.registry";
import type {
  NotificationTemplate,
  RegisterNotificationTemplateInput,
} from "./template/template.types";

export type NotificationManagerSnapshot = {
  managerId: string;
  status: NotificationManagerStatus;
  layerId: typeof PRODUCT_NOTIFICATION_FOUNDATION_ID;
  version: typeof PRODUCT_NOTIFICATION_FOUNDATION_VERSION;
  channelCount: number;
  templateCount: number;
  messageCount: number;
  deliveryCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type NotificationManager = {
  initialize: () => NotificationManagerSnapshot;
  start: () => NotificationManagerSnapshot;
  stop: () => NotificationManagerSnapshot;
  status: () => NotificationManagerSnapshot;
  registerChannel: (
    input: RegisterNotificationChannelInput,
  ) => NotificationChannel;
  updateChannelStatus: (
    input: UpdateNotificationChannelStatusInput,
  ) => NotificationChannel;
  registerTemplate: (
    input: RegisterNotificationTemplateInput,
  ) => NotificationTemplate;
  composeMessage: (
    input: ComposeNotificationMessageInput,
  ) => NotificationMessage;
  queueDelivery: (
    input: QueueNotificationDeliveryInput,
  ) => NotificationDelivery;
  updateDeliveryStatus: (
    input: UpdateNotificationDeliveryStatusInput,
  ) => NotificationDelivery;
  evaluateReadiness: () => NotificationReadinessResult;
  manifest: () => NotificationRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getNotificationRegistryManifest(): NotificationRegistryManifest {
  return {
    foundationId: PRODUCT_NOTIFICATION_FOUNDATION_ID,
    version: PRODUCT_NOTIFICATION_FOUNDATION_VERSION,
    freezeVersion: PRODUCT_NOTIFICATION_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_NOTIFICATION_FOUNDATION_BASE,
    channelCount: listNotificationChannels().length,
    templateCount: listNotificationTemplates().length,
    messageCount: listNotificationMessages().length,
    deliveryCount: listNotificationDeliveries().length,
  };
}

export function clearNotificationFoundationLayer(): void {
  clearNotificationDeliveries();
  clearNotificationMessages();
  clearNotificationTemplates();
  clearNotificationChannels();
}

export function createNotificationManager(options?: {
  managerId?: string;
}): NotificationManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-ntf-mgr");
  let state: NotificationManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): NotificationManagerSnapshot {
    const reg = getNotificationRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_NOTIFICATION_FOUNDATION_ID,
      version: PRODUCT_NOTIFICATION_FOUNDATION_VERSION,
      channelCount: reg.channelCount,
      templateCount: reg.templateCount,
      messageCount: reg.messageCount,
      deliveryCount: reg.deliveryCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): NotificationManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearNotificationFoundationLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): NotificationManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): NotificationManagerSnapshot {
    if (state !== "RUNNING") {
      throw new Error(`stop requires RUNNING (current=${state})`);
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
    registerChannel: (input) => {
      assertRunning("registerChannel");
      return registerNotificationChannel(input);
    },
    updateChannelStatus: (input) => {
      assertRunning("updateChannelStatus");
      return updateNotificationChannelStatus(input);
    },
    registerTemplate: (input) => {
      assertRunning("registerTemplate");
      return registerNotificationTemplate(input);
    },
    composeMessage: (input) => {
      assertRunning("composeMessage");
      return composeNotificationMessage(input);
    },
    queueDelivery: (input) => {
      assertRunning("queueDelivery");
      return queueNotificationDelivery(input);
    },
    updateDeliveryStatus: (input) => {
      assertRunning("updateDeliveryStatus");
      return updateNotificationDeliveryStatus(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateNotificationFoundationReadiness();
    },
    manifest: getNotificationRegistryManifest,
  };
}

export {
  assertNotificationFoundationReadinessReady,
  getNotificationChannel,
  getNotificationDelivery,
  getNotificationMessage,
  getNotificationTemplate,
  listNotificationChannels,
  listNotificationDeliveries,
  listNotificationMessages,
  listNotificationTemplates,
};
