/**
 * Product Integration Governance — standard types
 */

import type { INTEGRATION_GOVERNANCE_STANDARD_LEVELS } from "../management/management.constants";

export type IntegrationGovernanceStandardLevel =
  (typeof INTEGRATION_GOVERNANCE_STANDARD_LEVELS)[number];
export type IntegrationGovernanceStandardMetadata = Record<string, unknown>;

export type IntegrationGovernanceStandard = {
  id: string;
  policyId: string;
  standardKey: string;
  level: IntegrationGovernanceStandardLevel;
  ruleRef: string;
  detail: string;
  metadata: IntegrationGovernanceStandardMetadata;
  createdAt: string;
};

export type RegisterIntegrationGovernanceStandardInput = {
  id?: string;
  policyId: string;
  standardKey: string;
  level: IntegrationGovernanceStandardLevel;
  ruleRef: string;
  metadata?: IntegrationGovernanceStandardMetadata;
};
