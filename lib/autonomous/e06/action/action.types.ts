/**
 * E06-P2 — Business Action Runtime types
 * Action execution layer above E06 Autonomous Operation Foundation
 */

import {
  E06_ACTION_BASE,
  E06_ACTION_FREEZE_VERSION,
  E06_ACTION_RUNTIME_ID,
  E06_ACTION_VERSION,
  ACTION_INSTANCE_PHASES,
  ACTION_KINDS,
} from "./action.constants";

export type ActionInstancePhase = (typeof ACTION_INSTANCE_PHASES)[number];
export type ActionKind = (typeof ACTION_KINDS)[number];

export type ActionDefinition = {
  id: string;
  kind: ActionKind;
  name: string;
  description: string;
  /** Bound E06 operation id */
  operationId: string;
  /** Declarative effect emitted when the operation succeeds */
  effect: string;
  optional: boolean;
  readOnly: true;
};

export type ActionEffectRecord = {
  actionId: string;
  kind: ActionKind;
  effect: string;
  operationId: string;
  policyEffect: string;
  at: string;
  readOnly: true;
};

export type ActionExecutionResult = {
  success: boolean;
  actionId: string;
  kind: ActionKind;
  operationId: string;
  intelligenceId: string;
  instanceId: string;
  taskId: string;
  traceId: string;
  effect?: ActionEffectRecord;
  operationOutput: Readonly<Record<string, unknown>>;
  output: Readonly<Record<string, unknown>>;
  duration: number;
  status: "result" | "blocked" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type ActionRegistryManifest = {
  runtimeId: typeof E06_ACTION_RUNTIME_ID;
  version: typeof E06_ACTION_VERSION;
  freezeVersion: typeof E06_ACTION_FREEZE_VERSION;
  base: typeof E06_ACTION_BASE;
  actionCount: number;
  kinds: ActionKind[];
  actions: ActionDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};
