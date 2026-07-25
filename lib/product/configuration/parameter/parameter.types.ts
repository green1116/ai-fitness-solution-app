/**
 * Product Configuration — Parameter types
 */

import type { CONFIG_PARAMETER_TYPES } from "../management/management.constants";

export type ConfigParameterType = (typeof CONFIG_PARAMETER_TYPES)[number];
export type ParameterMetadata = Record<string, unknown>;

export type ConfigParameter = {
  id: string;
  namespaceId: string;
  key: string;
  type: ConfigParameterType;
  value: string;
  detail: string;
  metadata: ParameterMetadata;
  setAt: string;
};

export type SetConfigParameterInput = {
  id?: string;
  namespaceId: string;
  key: string;
  type: ConfigParameterType;
  value: string;
  metadata?: ParameterMetadata;
};
