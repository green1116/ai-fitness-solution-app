/**
 * Launch L4 — Scenario types
 */

import type { SCENARIO_KINDS } from "./scenario.constants";

export type ScenarioKind = (typeof SCENARIO_KINDS)[number];
export type ScenarioMetadata = Record<string, unknown>;

export type DeliveryScenario = {
  id: string;
  name: string;
  kind: ScenarioKind;
  owner: string;
  objective: string;
  detail: string;
  metadata: ScenarioMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterScenarioInput = {
  id?: string;
  name: string;
  kind: ScenarioKind;
  owner: string;
  objective?: string;
  metadata?: ScenarioMetadata;
};
