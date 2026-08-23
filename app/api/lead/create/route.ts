import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
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

function isSyncedConsultLead(payload: Record<string, unknown>): boolean {
  return payload.crmBridge === "synced";
}

function isBridgeInFlight(payload: Record<string, unknown>): boolean {
  return payload.crmBridge === "pending";
}

function needsCrmBridge(payload: Record<string, unknown>): boolean {
  return isFailedConsultLead(payload) || payload.crmBridge === undefined;
}

function isUniqueViolation(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

function consultLeadLockKey(planId: string, email: string): string {
  return `${planId}|${email}|consult`;
}

async function findExistingConsultLead(
  planId: string,
  email: string,
  tx: Prisma.TransactionClient = prisma,
) {
  return tx.lead.findFirst({
    where: {
      planId,
      email,
      intent: "consult",
    },
    orderBy: { createdAt: "desc" },
  });
}

async function crmBridgeAlreadyRecorded(
  marketingLeadId: string,
  tx: Prisma.TransactionClient = prisma,
) {
  const existing = await tx.cRMActivity.findFirst({
    where: {
      type: "lead.created",
      meta: {
        path: ["marketingLeadId"],
        equals: marketingLeadId,
      },
    },
    select: { id: true },
  });
  return Boolean(existing);
}

async function claimCrmBridge(input: {
  planId: string;
  email: string;
}): Promise<
  | { action: "skip"; leadId: string }
  | { action: "run"; leadId: string; priorPayload: Record<string, unknown> }
> {
  const lockKey = consultLeadLockKey(input.planId, input.email);
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;

    const current = await findExistingConsultLead(input.planId, input.email, tx);
    if (!current) throw new Error("Lead missing after consult resolution");

    const payload = readLeadPayload(current.payload);
    if (isSyncedConsultLead(payload) || isBridgeInFlight(payload)) {
      return { action: "skip", leadId: current.id };
    }
    if (await crmBridgeAlreadyRecorded(current.id, tx)) {
      return { action: "skip", leadId: current.id };
    }

    await tx.lead.update({
      where: { id: current.id },
      data: {
        payload: {
          ...payload,
          crmBridge: "pending",
          crmBridgePendingAt: new Date().toISOString(),
        },
      },
    });

    return {
      action: "run",
      leadId: current.id,
      priorPayload: payload,
    };
  });
}

async function markLeadCrmBridgeSynced(
  leadId: string,
  priorPayload: Record<string, unknown>,
) {
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      payload: {
        ...priorPayload,
        crmBridge: "synced",
        crmBridgeSyncedAt: new Date().toISOString(),
      },
    },
  });
}

async function resolveConsultLead(input: {
  planId: string;
  email: string;
  company: string;
  name: string;
  note: string;
  tx: Prisma.TransactionClient;
}) {
  let lead = await findExistingConsultLead(input.planId, input.email, input.tx);
  const existingPayload = lead ? readLeadPayload(lead.payload) : {};

  if (lead && !needsCrmBridge(existingPayload)) {
    return { kind: "existing_success" as const, lead };
  }

  if (!lead) {
    try {
      lead = await input.tx.lead.create({
        data: {
          planId: input.planId,
          email: input.email,
          company: input.company,
          name: input.name,
          note: input.note || null,
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
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
      lead = await findExistingConsultLead(input.planId, input.email, input.tx);
      if (!lead) throw err;
      const payload = readLeadPayload(lead.payload);
      if (!needsCrmBridge(payload)) {
        return { kind: "existing_success" as const, lead };
      }
    }
  } else {
    lead = await input.tx.lead.update({
      where: { id: lead.id },
      data: {
        company: input.company,
        name: input.name,
        note: input.note || null,
      },
    });
  }

  return { kind: "needs_bridge" as const, lead };
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

    const lockKey = consultLeadLockKey(planId, email);
    const resolved = await prisma.$transaction(
      async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;
        return resolveConsultLead({
          planId,
          email,
          company,
          name,
          note,
          tx,
        });
      },
      { maxWait: 10_000, timeout: 15_000 },
    );

    if (resolved.kind === "existing_success") {
      return NextResponse.json(
        { ok: true, leadId: resolved.lead.id },
        { status: 200 },
      );
    }

    const lead = resolved.lead;
    const claim = await claimCrmBridge({ planId, email });

    if (claim.action === "skip") {
      const latest = await findExistingConsultLead(planId, email);
      const latestPayload = readLeadPayload(latest?.payload);
      if (
        latest &&
        (isSyncedConsultLead(latestPayload) ||
          (await crmBridgeAlreadyRecorded(latest.id)))
      ) {
        if (!isSyncedConsultLead(latestPayload)) {
          await markLeadCrmBridgeSynced(latest.id, latestPayload);
        }
      }
      return NextResponse.json({ ok: true, leadId: claim.leadId }, { status: 200 });
    }

    const priorPayload = claim.priorPayload;
    const crmBridge = await recordEnterpriseConsultationAsLead({
      marketingLeadId: claim.leadId,
      planId,
      company,
      email,
    });

    if (!crmBridge) {
      await prisma.lead.update({
        where: { id: claim.leadId },
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
          leadId: claim.leadId,
          message: "咨询已记录，但销售系统暂不可用，请稍后重试",
        },
        { status: 503 },
      );
    }

    await markLeadCrmBridgeSynced(claim.leadId, priorPayload);
    return NextResponse.json({ ok: true, leadId: claim.leadId }, { status: 200 });
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
