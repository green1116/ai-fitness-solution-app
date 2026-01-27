import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    PDF_LICENSE_KEYS: process.env.PDF_LICENSE_KEYS || "NOT_SET",
    PDF_PAYWALL_BYPASS: process.env.PDF_PAYWALL_BYPASS || "NOT_SET",
    PDF_BYPASS_PLAN_IDS: process.env.PDF_BYPASS_PLAN_IDS || "NOT_SET",
  });
}

