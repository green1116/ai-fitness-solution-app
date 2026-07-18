/**
 * E08-P8 — Ecosystem Platform layer version lock (read-only)
 */

import {
  E08_ECOSYSTEM_FREEZE_VERSION,
  E08_ECOSYSTEM_VERSION,
} from "../core/ecosystem.constants";
import {
  E08_NETWORK_FREEZE_VERSION,
  E08_NETWORK_VERSION,
} from "../network/network.constants";
import {
  E08_EXCHANGE_FREEZE_VERSION,
  E08_EXCHANGE_VERSION,
} from "../exchange/exchange.constants";
import {
  E08_WORKFLOW_FREEZE_VERSION,
  E08_WORKFLOW_VERSION,
} from "../workflow/workflow.constants";
import {
  E08_INTELLIGENCE_FREEZE_VERSION,
  E08_INTELLIGENCE_VERSION,
} from "../intelligence/intelligence.constants";
import {
  E08_MARKET_FREEZE_VERSION,
  E08_MARKET_VERSION,
} from "../market/market.constants";
import {
  E08_NETWORK_OS_FREEZE_VERSION,
  E08_NETWORK_OS_VERSION,
} from "../network-os/networkos.constants";

import type { LockVersion } from "./signoff.types";
import {
  E08_ECOSYSTEM_PLATFORM_FREEZE_VERSION,
  E08_ECOSYSTEM_SIGNOFF_VERSION,
} from "./signoff.types";

export const E08_ECOSYSTEM_LAYER_VERSION_LOCK: LockVersion = {
  ecosystem: E08_ECOSYSTEM_VERSION,
  network: E08_NETWORK_VERSION,
  exchange: E08_EXCHANGE_VERSION,
  workflow: E08_WORKFLOW_VERSION,
  intelligence: E08_INTELLIGENCE_VERSION,
  market: E08_MARKET_VERSION,
  networkOs: E08_NETWORK_OS_VERSION,
  ecosystemFreeze: E08_ECOSYSTEM_FREEZE_VERSION,
  networkFreeze: E08_NETWORK_FREEZE_VERSION,
  exchangeFreeze: E08_EXCHANGE_FREEZE_VERSION,
  workflowFreeze: E08_WORKFLOW_FREEZE_VERSION,
  intelligenceFreeze: E08_INTELLIGENCE_FREEZE_VERSION,
  marketFreeze: E08_MARKET_FREEZE_VERSION,
  networkOsFreeze: E08_NETWORK_OS_FREEZE_VERSION,
  signoff: E08_ECOSYSTEM_SIGNOFF_VERSION,
  freeze: E08_ECOSYSTEM_PLATFORM_FREEZE_VERSION,
};

export const EXPECTED_ECOSYSTEM_LAYER_VERSIONS: LockVersion =
  E08_ECOSYSTEM_LAYER_VERSION_LOCK;

export function isEcosystemLayerVersionLockIntact(): boolean {
  const lock = E08_ECOSYSTEM_LAYER_VERSION_LOCK;
  return Object.values(lock).every(
    (v) => typeof v === "string" && v.length > 0,
  );
}

export function ecosystemVersionLockMatchesExpected(): boolean {
  const lock = E08_ECOSYSTEM_LAYER_VERSION_LOCK;
  const expected = EXPECTED_ECOSYSTEM_LAYER_VERSIONS;
  return (Object.keys(lock) as Array<keyof LockVersion>).every(
    (key) => lock[key] === expected[key],
  );
}
