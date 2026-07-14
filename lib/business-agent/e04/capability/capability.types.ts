/**
 * E04-P1 — Business Capability types
 */

import type { BusinessCapabilityKind } from "../core/business-agent.types";

export type BusinessCapabilityDefinition = {
  id: string;
  kind: BusinessCapabilityKind;
  name: string;
  description: string;
  inputHints: string[];
  outputHints: string[];
  readOnly: true;
};

export type BusinessCapabilityRegistryManifest = {
  capabilityCount: number;
  capabilities: BusinessCapabilityDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};
