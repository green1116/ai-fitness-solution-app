import { NextRequest, NextResponse } from "next/server";

import { generateTenderFromTemplate, recommendTemplates } from "@/lib/tender-market/tender-market.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const templateId = String(body?.templateId ?? "").trim();
    const companyName = String(body?.companyName ?? "体验企业").trim();

    if (!templateId) {
      return NextResponse.json({ ok: false, message: "templateId required" }, { status: 400 });
    }

    const result = generateTenderFromTemplate({ templateId, companyName, companySize: body?.companySize });
    const recommendations = recommendTemplates({
      currentTemplateId: templateId,
      preferPaid: true,
    });

    return NextResponse.json({ ok: true, result, recommendations });
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: err instanceof Error ? err.message : "generate failed" },
      { status: 400 },
    );
  }
}
