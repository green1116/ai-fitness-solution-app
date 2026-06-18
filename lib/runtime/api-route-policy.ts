/**
 * Standard Node.js API route policy — keeps heavy modules out of static build analysis.
 */
export const runtime = "nodejs" as const;
export const dynamic = "force-dynamic" as const;

export const NODE_RUNTIME_ROUTE_CONFIG = {
  runtime,
  dynamic,
} as const;

export const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
} as const;
