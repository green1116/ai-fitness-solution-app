/**
 * E09-P3 — Market Registry
 * Registers markets bound to e09/regional Region ids
 */

import { getRegion } from "../regional/regional.registry";
import {
  E09_MARKET_BASE,
  E09_MARKET_FREEZE_VERSION,
  E09_MARKET_ID,
  E09_MARKET_VERSION,
  MARKET_STATUSES,
  MARKET_TYPES,
} from "./market.constants";
import type {
  Market,
  MarketRegistryManifest,
  MarketStatus,
  MarketType,
  RegisterMarketInput,
} from "./market.types";

const markets = new Map<string, Market>();
const codeIndex = new Map<string, string>();

function cloneMarket(market: Market): Market {
  return {
    ...market,
    metadata: { ...market.metadata },
  };
}

function assertMarketType(type: string): asserts type is MarketType {
  if (!(MARKET_TYPES as readonly string[]).includes(type)) {
    throw new Error(`invalid market type: ${type}`);
  }
}

function assertMarketStatus(status: string): asserts status is MarketStatus {
  if (!(MARKET_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid market status: ${status}`);
  }
}

function assertRegionId(regionId: string): void {
  const id = regionId.trim();
  if (!id) throw new Error("market.regionId is required");
  if (!getRegion(id)) {
    throw new Error(`region not found: ${id}`);
  }
}

export function registerMarket(input: RegisterMarketInput): Market {
  const id = input.id.trim();
  const name = input.name.trim();
  const code = input.code.trim().toUpperCase();
  const regionId = input.regionId.trim();

  if (!id) throw new Error("market.id is required");
  if (!name) throw new Error("market.name is required");
  if (!code) throw new Error("market.code is required");
  assertRegionId(regionId);
  assertMarketType(input.type);

  const status = input.status ?? "CONNECTED";
  assertMarketStatus(status);

  if (markets.has(id)) {
    throw new Error(`market already registered: ${id}`);
  }
  if (codeIndex.has(code)) {
    throw new Error(`market code already registered: ${code}`);
  }

  const market: Market = {
    id,
    name,
    code,
    regionId,
    type: input.type,
    status,
    metadata: { ...(input.metadata ?? {}) },
  };

  markets.set(id, market);
  codeIndex.set(code, id);
  return cloneMarket(market);
}

export function getMarket(
  idOrCode: string,
  options?: { by?: "id" | "code" },
): Market | undefined {
  const key = idOrCode.trim();
  const by = options?.by ?? "id";

  if (by === "code") {
    const id = codeIndex.get(key.toUpperCase());
    if (!id) return undefined;
    const market = markets.get(id);
    return market ? cloneMarket(market) : undefined;
  }

  const market = markets.get(key);
  return market ? cloneMarket(market) : undefined;
}

export function listMarkets(filter?: {
  status?: MarketStatus;
  type?: MarketType;
  regionId?: string;
}): Market[] {
  let result = [...markets.values()];
  if (filter?.status) {
    result = result.filter((m) => m.status === filter.status);
  }
  if (filter?.type) {
    result = result.filter((m) => m.type === filter.type);
  }
  if (filter?.regionId) {
    const regionId = filter.regionId.trim();
    result = result.filter((m) => m.regionId === regionId);
  }
  return result.map(cloneMarket);
}

export function removeMarket(id: string): boolean {
  const market = markets.get(id.trim());
  if (!market) return false;
  markets.delete(market.id);
  codeIndex.delete(market.code);
  return true;
}

export function buildMarketRegistryManifest(): MarketRegistryManifest {
  const list = listMarkets();
  return {
    marketId: E09_MARKET_ID,
    version: E09_MARKET_VERSION,
    freezeVersion: E09_MARKET_FREEZE_VERSION,
    base: E09_MARKET_BASE,
    marketCount: list.length,
    markets: list,
  };
}

export function clearMarkets(): void {
  markets.clear();
  codeIndex.clear();
}
