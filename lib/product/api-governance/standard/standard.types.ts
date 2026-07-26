/**
 * Product API Governance — standard types
 */

import type { GOVERNANCE_STANDARD_LEVELS } from "../management/management.constants";

export type GovernanceStandardLevel =
  (typeof GOVERNANCE_STANDARD_LEVELS)[number];
export type GovernanceStandardMetadata = Record<string, unknown>;

export type GovernanceStandard = {
  id: string;
  policyId: string;
  standardKey: string;
  level: GovernanceStandardLevel;
  ruleRef: string;
  detail: string;
  metadata: GovernanceStandardMetadata;
  createdAt: string;
};

export type RegisterGovernanceStandardInput = {
  id?: string;
  policyId: string;
  standardKey: string;
  level: GovernanceStandardLevel;
  ruleRef: string;
  metadata?: GovernanceStandardMetadata;
};
