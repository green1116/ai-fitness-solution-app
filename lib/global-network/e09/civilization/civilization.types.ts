/**
 * E09-P7 — Enterprise Civilization OS types
 * Civilization layer composing e09 regional / market / federation / economy / agent
 */

import type { GlobalNodeMetadata } from "../core/global.types";
import type { GlobalAgent } from "../agent/agent.types";
import type { EconomicNode } from "../economy/economy.types";
import type { FederatedIdentity } from "../federation/federation.types";
import type { Market } from "../market/market.types";
import type { Region } from "../regional/regional.types";
import {
  E09_CIVILIZATION_BASE,
  E09_CIVILIZATION_FREEZE_VERSION,
  E09_CIVILIZATION_ID,
  E09_CIVILIZATION_VERSION,
  CIVILIZATION_STAGES,
  CIVILIZATION_STATUSES,
  ORCHESTRATION_MODES,
} from "./civilization.constants";

export type CivilizationStage = (typeof CIVILIZATION_STAGES)[number];
export type CivilizationStatus = (typeof CIVILIZATION_STATUSES)[number];
export type OrchestrationMode = (typeof ORCHESTRATION_MODES)[number];

/** Re-exports for civilization consumers */
export type {
  GlobalAgent,
  EconomicNode,
  FederatedIdentity,
  Market,
  Region,
};

export type Civilization = {
  id: string;
  name: string;
  code: string;
  stage: CivilizationStage;
  status: CivilizationStatus;
  regionIds: Region["id"][];
  marketIds: Market["id"][];
  federationIds: FederatedIdentity["id"][];
  economicNodeIds: EconomicNode["id"][];
  agentIds: GlobalAgent["id"][];
  score: number;
  metadata: GlobalNodeMetadata;
};

export type RegisterCivilizationInput = {
  id: string;
  name: string;
  code: string;
  stage?: CivilizationStage;
  status?: CivilizationStatus;
  regionIds?: Region["id"][];
  marketIds?: Market["id"][];
  federationIds?: FederatedIdentity["id"][];
  economicNodeIds?: EconomicNode["id"][];
  agentIds?: GlobalAgent["id"][];
  score?: number;
  metadata?: GlobalNodeMetadata;
};

export type OrchestrationPlan = {
  id: string;
  civilizationId: Civilization["id"];
  mode: OrchestrationMode;
  layerCounts: {
    regions: number;
    markets: number;
    federations: number;
    economicNodes: number;
    agents: number;
  };
  steps: string[];
  createdAt: string;
};

export type SynchronizationReport = {
  id: string;
  civilizationId: Civilization["id"];
  aligned: boolean;
  missing: {
    regions: string[];
    markets: string[];
    federations: string[];
    economicNodes: string[];
    agents: string[];
  };
  syncedAt: string;
  summary: string;
};

export type CivilizationEvaluation = {
  id: string;
  civilizationId: Civilization["id"];
  score: number;
  stage: CivilizationStage;
  status: CivilizationStatus;
  findings: string[];
  recommendations: string[];
  evaluatedAt: string;
};

export type CivilizationRegistryManifest = {
  civilizationId: typeof E09_CIVILIZATION_ID;
  version: typeof E09_CIVILIZATION_VERSION;
  freezeVersion: typeof E09_CIVILIZATION_FREEZE_VERSION;
  base: typeof E09_CIVILIZATION_BASE;
  civilizationCount: number;
  civilizations: Civilization[];
};
