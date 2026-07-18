/**
 * E08-P3 — AI Partner Exchange constants
 * BASE: enterprise-e08-p2-multi-organization-network-v1
 */

export const E08_EXCHANGE_ID =
  "enterprise-e08-ai-partner-exchange-v1" as const;

export const E08_EXCHANGE_VERSION = "e08-exchange-1" as const;
export const E08_EXCHANGE_FREEZE_VERSION =
  "e08-exchange-freeze-1" as const;

export const E08_EXCHANGE_BASE =
  "enterprise-e08-p2-multi-organization-network-v1" as const;

export const EXCHANGE_CATEGORIES = [
  "supply",
  "distribution",
  "governance",
] as const;

export const EXCHANGE_LISTING_STATUSES = [
  "listed",
  "exchangeable",
  "retired",
] as const;

/** Match lifecycle: QUERIED -> MATCHED -> EXCHANGING -> RESULT */
export const EXCHANGE_MATCH_PHASES = [
  "QUERIED",
  "MATCHED",
  "EXCHANGING",
  "RESULT",
] as const;

export const EXCHANGE_MATCH_TRANSITIONS: ReadonlyArray<
  readonly [string, string]
> = [
  ["QUERIED", "MATCHED"],
  ["MATCHED", "EXCHANGING"],
  ["EXCHANGING", "RESULT"],
] as const;

export const EXCHANGE_TRACE_EVENT_KINDS = [
  "ready",
  "query",
  "match",
  "exchange",
  "result",
  "error",
] as const;
