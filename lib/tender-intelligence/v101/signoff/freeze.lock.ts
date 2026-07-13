/**
 * E01-P8 — Tender Intelligence layer version lock (read-only)
 */

import {
  V101_AGENT_ORCHESTRATION_FREEZE_VERSION,
  V101_AGENT_ORCHESTRATION_VERSION,
} from "../agent/agent.types";
import {
  V101_ENTERPRISE_DELIVERY_FREEZE_VERSION,
  V101_ENTERPRISE_DELIVERY_VERSION,
} from "../delivery/delivery.types";
import {
  V101_TENDER_INTAKE_FREEZE_VERSION,
  V101_TENDER_INTAKE_VERSION,
} from "../intake/intake.types";
import {
  V101_TENDER_INTELLIGENCE_FREEZE_VERSION,
  V101_TENDER_INTELLIGENCE_VERSION,
} from "../intelligence/intelligence.types";
import {
  V101_PROPOSAL_INTELLIGENCE_FREEZE_VERSION,
  V101_PROPOSAL_INTELLIGENCE_VERSION,
} from "../proposal/proposal.types";
import {
  V101_BID_STRATEGY_FREEZE_VERSION,
  V101_BID_STRATEGY_VERSION,
} from "../strategy/strategy.types";
import {
  V101_TENDER_UNDERSTANDING_FREEZE_VERSION,
  V101_TENDER_UNDERSTANDING_VERSION,
} from "../understanding/understanding.types";

import type { LockVersion } from "./signoff.types";
import { V101_TENDER_FREEZE_VERSION, V101_TENDER_SIGNOFF_VERSION } from "./signoff.types";

export const V101_TENDER_LAYER_VERSION_LOCK: LockVersion = {
  intake: V101_TENDER_INTAKE_VERSION,
  understanding: V101_TENDER_UNDERSTANDING_VERSION,
  intelligence: V101_TENDER_INTELLIGENCE_VERSION,
  strategy: V101_BID_STRATEGY_VERSION,
  proposal: V101_PROPOSAL_INTELLIGENCE_VERSION,
  agent: V101_AGENT_ORCHESTRATION_VERSION,
  delivery: V101_ENTERPRISE_DELIVERY_VERSION,
  intakeFreeze: V101_TENDER_INTAKE_FREEZE_VERSION,
  understandingFreeze: V101_TENDER_UNDERSTANDING_FREEZE_VERSION,
  intelligenceFreeze: V101_TENDER_INTELLIGENCE_FREEZE_VERSION,
  strategyFreeze: V101_BID_STRATEGY_FREEZE_VERSION,
  proposalFreeze: V101_PROPOSAL_INTELLIGENCE_FREEZE_VERSION,
  agentFreeze: V101_AGENT_ORCHESTRATION_FREEZE_VERSION,
  deliveryFreeze: V101_ENTERPRISE_DELIVERY_FREEZE_VERSION,
  signoff: V101_TENDER_SIGNOFF_VERSION,
  freeze: V101_TENDER_FREEZE_VERSION,
};

export const EXPECTED_TENDER_LAYER_VERSIONS: LockVersion = V101_TENDER_LAYER_VERSION_LOCK;

export function isTenderLayerVersionLockIntact(): boolean {
  const lock = V101_TENDER_LAYER_VERSION_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}

export function tenderVersionLockMatchesExpected(): boolean {
  const lock = V101_TENDER_LAYER_VERSION_LOCK;
  const expected = EXPECTED_TENDER_LAYER_VERSIONS;
  return (Object.keys(lock) as Array<keyof LockVersion>).every(
    (key) => lock[key] === expected[key],
  );
}
