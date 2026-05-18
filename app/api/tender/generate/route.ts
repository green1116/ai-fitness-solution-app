import { NextResponse } from "next/server";
import type { ProjectInput } from "@/lib/domain/tender";
import { generateTenderPackage } from "@/lib/services/tender/generateTenderPackage";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<ProjectInput>;

    if (
      !body.name ||
      !body.siteType ||
      !body.budgetLevel ||
      !body.deliveryMode
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: name, siteType, budgetLevel, deliveryMode",
        },
        { status: 400 },
      );
    }

    const result = await generateTenderPackage({
      name: body.name,
      clientName: body.clientName,
      industry: body.industry,
      siteType: body.siteType,
      areaM2: body.areaM2,
      targetUsers: body.targetUsers,
      city: body.city,
      budgetLevel: body.budgetLevel,
      deliveryMode: body.deliveryMode,
      notes: body.notes,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
