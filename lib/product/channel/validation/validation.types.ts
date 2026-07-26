/**
 * Product Channel — Validation types
 */

import type { CHANNEL_VALIDATION_VERDICTS } from "../management/management.constants";

export type ChannelValidationVerdict =
  (typeof CHANNEL_VALIDATION_VERDICTS)[number];
export type ValidationMetadata = Record<string, unknown>;

export type ChannelValidation = {
  id: string;
  channelId: string;
  verdict: ChannelValidationVerdict;
  reasons: string[];
  detail: string;
  metadata: ValidationMetadata;
  createdAt: string;
};

export type ValidateChannelInput = {
  id?: string;
  channelId: string;
  metadata?: ValidationMetadata;
};
