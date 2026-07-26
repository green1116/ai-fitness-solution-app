/**
 * Product Channel — Registry types
 */

import type {
  CHANNEL_KINDS,
  CHANNEL_STATUSES,
} from "../management/management.constants";

export type ChannelKind = (typeof CHANNEL_KINDS)[number];
export type ChannelStatus = (typeof CHANNEL_STATUSES)[number];
export type ChannelMetadata = Record<string, unknown>;

export type NotificationChannel = {
  id: string;
  channelKey: string;
  name: string;
  kind: ChannelKind;
  status: ChannelStatus;
  templateManagementRef: string;
  detail: string;
  metadata: ChannelMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterChannelInput = {
  id?: string;
  channelKey: string;
  name: string;
  kind: ChannelKind;
  templateManagementRef?: string;
  metadata?: ChannelMetadata;
};

export type UpdateChannelStatusInput = {
  channelId: string;
  status: ChannelStatus;
};
