/**
 * E09-P3 — Market Foundation types
 * Market layer above E09 Regional Foundation
 */

import type { GlobalNodeMetadata } from "../core/global.types";
import type { Region } from "../regional/regional.types";
import {
  E09_MARKET_BASE,
  E09_MARKET_FREEZE_VERSION,
  E09_MARKET_ID,
  E09_MARKET_VERSION,
  MARKET_STATUSES,
  MARKET_TYPES,
} from "./market.constants";

export type MarketType = (typeof MARKET_TYPES)[number];
export type MarketStatus = (typeof MARKET_STATUSES)[number];

/** Re-export regional Region for market consumers */
export type { Region };

export type Market = {
  id: string;
  name: string;
  code: string;
  /** Owning region from e09/regional Region model */
  regionId: Region["id"];
  type: MarketType;
  status: MarketStatus;
  metadata: GlobalNodeMetadata;
};

export type RegisterMarketInput = {
  id: string;
  name: string;
  code: string;
  regionId: Region["id"];
  type: MarketType;
  status?: MarketStatus;
  metadata?: GlobalNodeMetadata;
};

export type MarketRegistryManifest = {
  marketId: typeof E09_MARKET_ID;
  version: typeof E09_MARKET_VERSION;
  freezeVersion: typeof E09_MARKET_FREEZE_VERSION;
  base: typeof E09_MARKET_BASE;
  marketCount: number;
  markets: Market[];
};
