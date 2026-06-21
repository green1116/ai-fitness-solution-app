import { buildQuoteEntrySurface } from "../entry/quote-entry.controller";
import { QuoteEntryPortalPage } from "./quote-entry-portal-page";

export function renderQuoteEntryPortalPage(workspaceId: string) {
  return buildQuoteEntrySurface(workspaceId);
}

export function QuoteEntryPortalPageLoader({ workspaceId }: { workspaceId: string }) {
  const surface = buildQuoteEntrySurface(workspaceId);
  return <QuoteEntryPortalPage surface={surface} />;
}
