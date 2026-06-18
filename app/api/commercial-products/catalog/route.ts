import { NextResponse } from "next/server";
import { NO_STORE_HEADERS, runtime, dynamic } from "@/lib/runtime/api-route-policy";
import { buildProductCatalog } from "@/lib/commercial-products/access-layer/light";

export { runtime, dynamic };

export async function GET() {
  const catalog = buildProductCatalog();
  return NextResponse.json(
    {
      ok: true,
      catalog,
    },
    { headers: NO_STORE_HEADERS },
  );
}
