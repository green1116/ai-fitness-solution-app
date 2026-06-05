import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isBlockedProductionApiPath, productionBlockedResponse } from "@/lib/http/productionRouteGuard";

/**
 * V9.2-RC2：production 封禁诊断/测试 API；staging/preview（非 production）不受影响。
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (isBlockedProductionApiPath(pathname)) {
    return productionBlockedResponse();
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/debug",
    "/api/debug/:path*",
    "/api/test-db",
    "/api/license/dev-issue",
    "/api/upgrade/mock-checkout",
    "/api/pay/fake-success",
  ],
};
