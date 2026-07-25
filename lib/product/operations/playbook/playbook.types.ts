/**
 * Product Operations — Playbook types
 */

import type { OPS_PLAYBOOK_KINDS } from "../console/console.constants";

export type OpsPlaybookKind = (typeof OPS_PLAYBOOK_KINDS)[number];
export type PlaybookMetadata = Record<string, unknown>;

export type OpsPlaybook = {
  id: string;
  surfaceId: string;
  code: string;
  kind: OpsPlaybookKind;
  steps: number;
  detail: string;
  metadata: PlaybookMetadata;
  registeredAt: string;
};

export type RegisterOpsPlaybookInput = {
  id?: string;
  surfaceId: string;
  code: string;
  kind: OpsPlaybookKind;
  steps: number;
  metadata?: PlaybookMetadata;
};
