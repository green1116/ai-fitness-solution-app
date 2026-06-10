import type { CUSTOMER_SUCCESS_VERSION } from "../shared/types";

export const SUCCESS_PLAYBOOK_RUNTIME_VERSION = "v16.0-success-playbook-1" as const;

export const PLAYBOOK_TYPES = ["onboarding", "adoption", "renewal", "expansion"] as const;
export type PlaybookType = (typeof PLAYBOOK_TYPES)[number];

export interface SuccessPlaybook {
  playbookId: string;
  type: PlaybookType;
  title: string;
  steps: string[];
  targetSegment: string;
  estimatedDays: number;
}

export interface SuccessPlaybookRuntimePayload {
  version: typeof SUCCESS_PLAYBOOK_RUNTIME_VERSION;
  successVersion: typeof CUSTOMER_SUCCESS_VERSION;
  playbooks: SuccessPlaybook[];
  summary: string;
}
