import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { blockDebugInProduction } from "@/lib/http/productionRouteGuard";

export async function GET() {
  const blocked = blockDebugInProduction();
  if (blocked) return blocked;

  const token = jwt.sign(
    { planId: "attaguy-plan", scope: "pdf_download" },
    process.env.DOWNLOAD_TOKEN_SECRET!,
    { expiresIn: Number(process.env.DOWNLOAD_TOKEN_EXPIRES_IN_SECONDS || 1800) }
  );
  return NextResponse.json({ token });
}

