import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const created = await prisma.licenseKey.create({
      data: {
        keyHash: "test-key-" + Date.now(),
        planLevel: "pro",
        maxDownloads: 5,
      },
    });

    const list = await prisma.licenseKey.findMany();

    return NextResponse.json({
      created,
      total: list.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}