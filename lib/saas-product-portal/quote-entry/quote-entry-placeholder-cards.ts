import type { QuoteEntryPlaceholderCard } from "../shared/portal-types";

export const QUOTE_ENTRY_PLACEHOLDER_CARDS: QuoteEntryPlaceholderCard[] = [
  {
    key: "quote-list",
    title: "Quote List",
    description: "Future workspace-scoped quote inventory will appear here.",
    status: "coming-soon",
  },
  {
    key: "quote-draft",
    title: "Draft Quotes",
    description: "Placeholder for draft quote surfaces without pricing logic.",
    status: "coming-soon",
  },
  {
    key: "quote-metadata",
    title: "Quote Metadata",
    description: "Read-only metadata preview reserved for a future quote runtime.",
    status: "coming-soon",
  },
];

export function listQuoteEntryPlaceholderCards(): QuoteEntryPlaceholderCard[] {
  return QUOTE_ENTRY_PLACEHOLDER_CARDS;
}
