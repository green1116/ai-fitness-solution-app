/**
 * E06-P1 — Autonomous Operation Foundation types
 * Abstraction above E05 Intelligence Layer
 */

import {
  E06_OPERATION_BASE,
  E06_OPERATION_FREEZE_VERSION,
  E06_OPERATION_PLATFORM_ID,
  E06_OPERATION_VERSION,
  OPERATION_DOMAINS,
  OPERATION_LIFECYCLE_STAGES,
  OPERATION_POLICY_EFFECTS,
  OPERATION_POLICY_KINDS,
  OPERATION_POLICY_OPS,
  OPERATION_STATUSES,
} from "./operation.constants";

export type OperationDomain = (typeof OPERATION_DOMAINS)[number];
export type OperationStatus = (typeof OPERATION_STATUSES)[number];
export type OperationLifecycleStage =
  (typeof OPERATION_LIFECYCLE_STAGES)[number];
export type OperationPolicyKind = (typeof OPERATION_POLICY_KINDS)[number];
export type OperationPolicyOp = (typeof OPERATION_POLICY_OPS)[number];
export type OperationPolicyEffect =
  (typeof OPERATION_POLICY_EFFECTS)[number];

export type OperationPolicyCondition = {
  field: string;
  op: OperationPolicyOp;
  value?: unknown;
  readOnly: true;
};

export type OperationPolicyDefinition = {
  id: string;
  kind: OperationPolicyKind;
  name: string;
  description: string;
  conditions: OperationPolicyCondition[];
  onMatch: OperationPolicyEffect;
  priority: number;
  readOnly: true;
};

export type OperationDefinition = {
  id: string;
  name: string;
  domain: OperationDomain;
  description: string;
  /** Bound E05 intelligence module id */
  intelligenceId: string;
  insightId?: string;
  policyIds: string[];
  dependsOn: string[];
  optional: boolean;
  readOnly: true;
};

export type OperationLifecycleTransition = {
  from: OperationLifecycleStage;
  to: OperationLifecycleStage;
  at: string;
  note?: string;
  readOnly: true;
};

export type OperationLifecycle = {
  current: OperationLifecycleStage;
  stages: OperationLifecycleStage[];
  transitions: OperationLifecycleTransition[];
  complete: boolean;
  readOnly: true;
};

export type OperationRegistryManifest = {
  platformId: typeof E06_OPERATION_PLATFORM_ID;
  version: typeof E06_OPERATION_VERSION;
  freezeVersion: typeof E06_OPERATION_FREEZE_VERSION;
  base: typeof E06_OPERATION_BASE;
  operationCount: number;
  domains: OperationDomain[];
  operations: OperationDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};

export type OperationPolicyRegistryManifest = {
  policyCount: number;
  kinds: OperationPolicyKind[];
  policies: OperationPolicyDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};

export type OperationPolicyEvaluation = {
  policyId: string;
  matched: boolean;
  effect?: OperationPolicyEffect;
  failedFields: string[];
  readOnly: true;
};

export type OperationPolicyResult = {
  effect: OperationPolicyEffect;
  matchedPolicyId?: string;
  evaluations: OperationPolicyEvaluation[];
  allowed: boolean;
  readOnly: true;
};

export type OperationFoundationResult = {
  platformId: typeof E06_OPERATION_PLATFORM_ID;
  version: typeof E06_OPERATION_VERSION;
  freezeVersion: typeof E06_OPERATION_FREEZE_VERSION;
  base: typeof E06_OPERATION_BASE;
  registry: OperationRegistryManifest;
  policies: OperationPolicyRegistryManifest;
  lifecycle: OperationLifecycle;
  ready: boolean;
  summary: string;
};
