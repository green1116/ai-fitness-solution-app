/**
 * Product Configuration — Override types
 */

import type { CONFIG_OVERRIDE_TARGETS } from "../management/management.constants";

export type ConfigOverrideTarget = (typeof CONFIG_OVERRIDE_TARGETS)[number];
export type OverrideMetadata = Record<string, unknown>;

export type ConfigOverride = {
  id: string;
  parameterId: string;
  target: ConfigOverrideTarget;
  targetRef: string;
  value: string;
  userAccountId: string;
  detail: string;
  metadata: OverrideMetadata;
  appliedAt: string;
};

export type ApplyConfigOverrideInput = {
  id?: string;
  parameterId: string;
  target: ConfigOverrideTarget;
  targetRef: string;
  value: string;
  userAccountId: string;
  metadata?: OverrideMetadata;
};
