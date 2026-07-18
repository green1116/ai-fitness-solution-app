/**
 * E08-P3 — AI Partner Exchange types
 * Capability exchange above E08 Multi Organization Network
 */

import type { NetworkExecutionResult } from "../network/network.types";
import {
  E08_EXCHANGE_BASE,
  E08_EXCHANGE_FREEZE_VERSION,
  E08_EXCHANGE_ID,
  E08_EXCHANGE_VERSION,
  EXCHANGE_CATEGORIES,
  EXCHANGE_LISTING_STATUSES,
  EXCHANGE_MATCH_PHASES,
} from "./exchange.constants";

export type ExchangeCategory = (typeof EXCHANGE_CATEGORIES)[number];
export type ExchangeListingStatus =
  (typeof EXCHANGE_LISTING_STATUSES)[number];
export type ExchangeMatchPhase = (typeof EXCHANGE_MATCH_PHASES)[number];

export type ExchangeListing = {
  id: string;
  name: string;
  category: ExchangeCategory;
  title: string;
  description: string;
  /** Bound E08 multi-organization network id */
  networkId: string;
  listingStatus: ExchangeListingStatus;
  /** Declarative capability tags for exchange matching */
  tags: string[];
  optional: boolean;
  readOnly: true;
};

export type ExchangeMatchQuery = {
  category?: ExchangeCategory;
  tags?: string[];
  networkId?: string;
  requireExchangeable?: boolean;
};

export type ExchangeMatchCandidate = {
  listingId: string;
  category: ExchangeCategory;
  networkId: string;
  score: number;
  matchedTags: string[];
  title: string;
  readOnly: true;
};

export type ExchangeMatchResult = {
  success: boolean;
  query: ExchangeMatchQuery;
  candidates: ExchangeMatchCandidate[];
  best?: ExchangeMatchCandidate;
  matchCount: number;
  readOnly: true;
};

export type PartnerExchangeResult = {
  success: boolean;
  listingId: string;
  category: ExchangeCategory;
  networkId: string;
  instanceId: string;
  taskId: string;
  traceId: string;
  match?: ExchangeMatchResult;
  network?: NetworkExecutionResult;
  output: Readonly<Record<string, unknown>>;
  duration: number;
  status: "result" | "blocked" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type ExchangeRegistryManifest = {
  exchangeId: typeof E08_EXCHANGE_ID;
  version: typeof E08_EXCHANGE_VERSION;
  freezeVersion: typeof E08_EXCHANGE_FREEZE_VERSION;
  base: typeof E08_EXCHANGE_BASE;
  listingCount: number;
  categories: ExchangeCategory[];
  listings: ExchangeListing[];
  catalogComplete: boolean;
  readOnly: true;
};
