import { buildSalesPortalView } from "@/lib/commercial-products/access-layer";
import { PRODUCT_SKU, type ProductSku } from "@/lib/commercial-products/shared/constants";
import { QuotePageClient } from "./QuotePageClient";

export const dynamic = "force-dynamic";

type QuotePageProps = {
  searchParams: Promise<{ sku?: string }>;
};

export default async function CommercialV47QuotePage({ searchParams }: QuotePageProps) {
  const portal = buildSalesPortalView();
  const params = await searchParams;
  const skuParam = params.sku?.trim();
  const initialSku =
    skuParam && PRODUCT_SKU.includes(skuParam as ProductSku)
      ? (skuParam as ProductSku)
      : undefined;

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <p className="text-sm text-amber-400/90">V47 · Quote Builder</p>
          <h1 className="text-3xl font-bold">获取报价</h1>
          <p className="text-sm text-zinc-400">提交项目参数，调用 {portal.quoteApiPath}</p>
        </header>

        <QuotePageClient portal={portal} initialSku={initialSku} />
      </div>
    </main>
  );
}
