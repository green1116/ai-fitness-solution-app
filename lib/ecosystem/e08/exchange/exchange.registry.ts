/**
 * E08-P3 — AI Partner Exchange Registry
 * Validates capability listings against E08 organization networks
 */

import { getNetworkById } from "../network/network.registry";
import {
  EXCHANGE_CATALOG,
  listExchangeableListings,
} from "./exchange.catalog";
import {
  E08_EXCHANGE_BASE,
  E08_EXCHANGE_FREEZE_VERSION,
  E08_EXCHANGE_ID,
  E08_EXCHANGE_VERSION,
  EXCHANGE_CATEGORIES,
  EXCHANGE_LISTING_STATUSES,
} from "./exchange.constants";
import type {
  ExchangeCategory,
  ExchangeListing,
  ExchangeRegistryManifest,
} from "./exchange.types";

export function assertExchangeListing(listing: ExchangeListing): void {
  if (!listing.id.trim()) throw new Error("listing.id is required");
  if (!listing.name.trim()) throw new Error("listing.name is required");
  if (!(EXCHANGE_CATEGORIES as readonly string[]).includes(listing.category)) {
    throw new Error(`invalid exchange category: ${listing.category}`);
  }
  if (
    !(EXCHANGE_LISTING_STATUSES as readonly string[]).includes(
      listing.listingStatus,
    )
  ) {
    throw new Error(`invalid listing status: ${listing.listingStatus}`);
  }
  if (listing.readOnly !== true) throw new Error("readOnly must be true");
  if (listing.tags.length === 0) {
    throw new Error(`listing ${listing.id} requires tags`);
  }

  if (!getNetworkById(listing.networkId)) {
    throw new Error(`missing E08 network: ${listing.networkId}`);
  }
}

export function getListingById(id: string): ExchangeListing | undefined {
  return EXCHANGE_CATALOG.find((l) => l.id === id);
}

export function getListingByCategory(
  category: ExchangeCategory,
): ExchangeListing | undefined {
  return EXCHANGE_CATALOG.find((l) => l.category === category);
}

export function listListingsForNetwork(networkId: string): ExchangeListing[] {
  return EXCHANGE_CATALOG.filter((l) => l.networkId === networkId);
}

export function buildExchangeRegistryManifest(
  listings: ExchangeListing[] = EXCHANGE_CATALOG,
): ExchangeRegistryManifest {
  for (const listing of listings) {
    assertExchangeListing(listing);
  }

  const categories = [...new Set(listings.map((l) => l.category))];
  const catalogComplete = EXCHANGE_CATEGORIES.every((c) =>
    categories.includes(c),
  );
  if (!catalogComplete) {
    throw new Error("Exchange catalog incomplete: missing categories");
  }

  const exchangeable = listExchangeableListings(listings);
  if (exchangeable.length === 0) {
    throw new Error("Exchange catalog has no exchangeable listings");
  }

  return {
    exchangeId: E08_EXCHANGE_ID,
    version: E08_EXCHANGE_VERSION,
    freezeVersion: E08_EXCHANGE_FREEZE_VERSION,
    base: E08_EXCHANGE_BASE,
    listingCount: listings.length,
    categories,
    listings,
    catalogComplete: true,
    readOnly: true,
  };
}

export {
  EXCHANGE_CATALOG,
  listExchangeableListings,
  listListingsByTag,
} from "./exchange.catalog";
