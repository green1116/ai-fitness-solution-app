/**
 * Product Admin — Setting types
 */

import type { ADMIN_SETTING_SCOPES } from "../foundation/foundation.constants";

export type AdminSettingScope = (typeof ADMIN_SETTING_SCOPES)[number];
export type SettingMetadata = Record<string, unknown>;

export type AdminSetting = {
  id: string;
  key: string;
  scope: AdminSettingScope;
  value: string;
  tenantId?: string;
  detail: string;
  metadata: SettingMetadata;
  createdAt: string;
};

export type RegisterAdminSettingInput = {
  id?: string;
  key: string;
  scope: AdminSettingScope;
  value: string;
  tenantId?: string;
  metadata?: SettingMetadata;
};
