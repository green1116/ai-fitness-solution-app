import {
  bindQuotePortalRoute,
} from "@/lib/quote-product/portal/quote-product-route";
import { QuoteProductPageLoader } from "@/lib/quote-product/portal/quote-product-loader";

export default async function SaasProductWorkspaceQuotesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  bindQuotePortalRoute(id);

  return <QuoteProductPageLoader workspaceId={id} />;
}
