/**
 * E08-P3 — AI Partner Exchange Catalog
 * Declarative capability listings bound to E08 organization networks
 */

import type { ExchangeListing } from "./exchange.types";

export const EXCHANGE_CATALOG: ExchangeListing[] = [
  {
    id: "e08.exchange.supply-capability",
    name: "Supply Capability Offer",
    category: "supply",
    title: "AI Supply Chain Exchange",
    description:
      "Exchange listing for the supply-chain multi-organization network",
    networkId: "e08.network.supply-chain",
    listingStatus: "exchangeable",
    tags: ["supply", "logistics", "fulfillment"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e08.exchange.distribution-capability",
    name: "Distribution Capability Offer",
    category: "distribution",
    title: "AI Go-To-Market Exchange",
    description:
      "Exchange listing for the go-to-market multi-organization network",
    networkId: "e08.network.go-to-market",
    listingStatus: "exchangeable",
    tags: ["channel", "distribution", "alliance"],
    optional: false,
    readOnly: true,
  },
  {
    id: "e08.exchange.governance-capability",
    name: "Governance Capability Offer",
    category: "governance",
    title: "AI Compliance Hub Exchange",
    description:
      "Exchange listing for the compliance multi-organization network",
    networkId: "e08.network.compliance",
    listingStatus: "exchangeable",
    tags: ["compliance", "regulator", "hub"],
    optional: false,
    readOnly: true,
  },
];

export function listListingsByTag(tag: string): ExchangeListing[] {
  return EXCHANGE_CATALOG.filter((listing) => listing.tags.includes(tag));
}

export function listExchangeableListings(
  listings: ExchangeListing[] = EXCHANGE_CATALOG,
): ExchangeListing[] {
  return listings.filter(
    (listing) => listing.listingStatus === "exchangeable",
  );
}
