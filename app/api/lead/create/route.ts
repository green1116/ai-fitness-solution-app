import { NextRequest, NextResponse } from "next/server";
import { recordEnterpriseConsultationAsLead } from "@/lib/crm/crm.product-bridge";
import { prisma } from "@/lib/prisma";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function readLeadPayload(payload: unknown): Record<string, unknown> {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return payload as Record<string, unknown>;
  }
  return {};
}

function isFailedConsultLead(payload: Record<string, unknown>): boolean {
  return payload.crmBridge === "failed";
}

async function findExistingConsultLead(planId: string, email: string) {
  return prisma.lead.findFirst({
    where: {
      planId,
      email,
      intent: "consult",
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const planId = String(body?.planId || "").trim();
    const company = String(body?.company || "").trim();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "")
      .trim()
      .toLowerCase();
    const note = String(body?.note || "").trim();

    if (!planId || !company || !name || !email) {
      return NextResponse.json(
        { ok: false, message: "缺少必填字段" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, message: "邮箱格式不正确" },
        { status: 400 }
      );
    }

    let lead = await findExistingConsultLead(planId, email);
    const existingPayload = lead ? readLeadPayload(lead.payload) : {};

    if (lead && !isFailedConsultLead(existingPayload)) {
      return NextResponse.json({
        ok: true,
        leadId: lead.id,
      });
    }

    if (!lead) {
      lead = await prisma.lead.create({
        data: {
          planId,
          email,
          company,
          name,
          note: note || null,
          intent: "consult",
          source: "download",
          status: "new",
          score: 0,
          payload: {
            from: "lead_create_api",
            createdAt: new Date().toISOString(),
          },
        },
      });
    } else {
      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: {
          company,
          name,
          note: note || null,
        },
      });
    }

    const crmBridge = await recordEnterpriseConsultationAsLead({
      marketingLeadId: lead.id,
      planId,
      company,
      email,
    });

    const priorPayload = readLeadPayload(lead.payload);

    if (!crmBridge) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          payload: {
            ...priorPayload,
            crmBridge: "failed",
            crmBridgeFailedAt: new Date().toISOString(),
          },
        },
      });
      return NextResponse.json(
        {
          ok: false,
          leadId: lead.id,
          message: "咨询已记录，但销售系统暂不可用，请稍后重试",
        },
        { status: 503 },
      );
    }

    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        payload: {
          ...priorPayload,
          crmBridge: "synced",
          crmBridgeSyncedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      ok: true,
      leadId: lead.id,
    });
  } catch (err: unknown) {
    console.error("[lead/create]", err);
    return NextResponse.json(
      {
        ok: false,
        message: "系统繁忙，请稍后重试",
      },
      { status: 500 }
    );
  }
}
