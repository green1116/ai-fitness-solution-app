import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET() {
  const token = jwt.sign(
    { planId: "attaguy-plan", scope: "pdf_download" },
    process.env.DOWNLOAD_TOKEN_SECRET!,
    { expiresIn: Number(process.env.DOWNLOAD_TOKEN_EXPIRES_IN_SECONDS || 1800) }
  );
  return NextResponse.json({ token });
}

