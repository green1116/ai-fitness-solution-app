import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { recordEnterpriseConsultationAsLead } from "@/lib/crm/crm.product-bridge";
import { listOrganizationsForUser } from "@/lib/organization/organization.service";
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

/** Server-trusted tenant only — never from client body/note/bare planId. */
async function resolveTrustedTenantPayload(planId: string): Promise<{
  organizationId?: string;
  projectId?: string;
}> {
  const user = await getCurrentUser();
  if (!user) return {};

  const organizationId = (await listOrganizationsForUser(user.id))[0]?.organization
    .id;
  if (!organizationId) return {};

  const pid = planId.trim();
  if (!pid || pid === "product-tender") {
    return { organizationId };
  }

  const project = await prisma.project.findUnique({
    where: { id: pid },
    select: { id: true, organizationId: true },
  });
  if (project?.organizationId === organizationId) {
    return { organizationId, projectId: project.id };
  }

  return { organizationId };
}

function withTrustedTenant(
  payload: Record<string, unknown>,
  tenant: { organizationId?: string; projectId?: string },
): Prisma.InputJsonObject {
  const next: Record<string, unknown> = { ...payload };
  if (!tenant.organizationId) return next as Prisma.InputJsonObject;
  next.organizationId = tenant.organizationId;
  if (tenant.projectId) next.projectId = tenant.projectId;
  else delete next.projectId;
  return next as Prisma.InputJsonObject;
}

function isSyncedConsultLead(payload: Record<string, unknown>): boolean {
  return payload.crmBridge === "synced";
}

function isBridgeInFlight(payload: Record<string, unknown>): boolean {
  return payload.crmBridge === "pending";
}

const CRM_BRIDGE_PENDING_STALE_MS = 5_000;

function isStalePendingBridge(payload: Record<string, unknown>): boolean {
  if (!isBridgeInFlight(payload)) return false;
  const pendingAt = payload.crmBridgePendingAt;
  if (typeof pendingAt !== "string" || !pendingAt) return true;
  return Date.now() - new Date(pendingAt).getTime() > CRM_BRIDGE_PENDING_STALE_MS;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  | { action: "wait"; leadId: string }
  | { action: "run"; leadId: string; priorPayload: Record<string, unknown> }
> {
  const lockKey = consultLeadLockKey(input.planId, input.email);
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;

    const current = await findExistingConsultLead(input.planId, input.email, tx);
    if (!current) throw new Error("Lead missing after consult resolution");

    const payload = readLeadPayload(current.payload);
    if (isSyncedConsultLead(payload)) {
      return { action: "skip", leadId: current.id };
    }
    if (await crmBridgeAlreadyRecorded(current.id, tx)) {
      return { action: "skip", leadId: current.id };
    }
    if (isBridgeInFlight(payload) && !isStalePendingBridge(payload)) {
      return { action: "wait", leadId: current.id };
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

async function markLeadCrmBridgeFailed(
  leadId: string,
  priorPayload: Record<string, unknown>,
) {
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      payload: {
        ...priorPayload,
        crmBridge: "failed",
        crmBridgeFailedAt: new Date().toISOString(),
      },
    },
  });
}

async function reconcileSkippedBridge(planId: string, email: string, leadId: string) {
  const latest = await findExistingConsultLead(planId, email);
  if (!latest || latest.id !== leadId) return false;

  const latestPayload = readLeadPayload(latest.payload);
  if (isSyncedConsultLead(latestPayload)) return true;
  if (!(await crmBridgeAlreadyRecorded(latest.id))) return false;

  await markLeadCrmBridgeSynced(latest.id, latestPayload);
  return true;
}

async function waitForBridgeCompletion(planId: string, email: string, leadId: string) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (await reconcileSkippedBridge(planId, email, leadId)) {
      return true;
    }

    const latest = await findExistingConsultLead(planId, email);
    if (latest?.id === leadId && isSyncedConsultLead(readLeadPayload(latest.payload))) {
      return true;
    }

    await sleep(500);
  }

  return false;
}

async function handleBridgeClaim(input: {
  claim:
    | { action: "skip"; leadId: string }
    | { action: "wait"; leadId: string }
    | { action: "run"; leadId: string; priorPayload: Record<string, unknown> };
  planId: string;
  email: string;
  company: string;
}) {
  if (input.claim.action === "skip") {
    const reconciled = await reconcileSkippedBridge(
      input.planId,
      input.email,
      input.claim.leadId,
    );
    if (!reconciled) {
      throw new Error("CRM bridge skip without reconcilable activity");
    }
    return {
      status: 200 as const,
      body: { ok: true as const, leadId: input.claim.leadId },
    };
  }

  if (input.claim.action === "wait") {
    const completed = await waitForBridgeCompletion(
      input.planId,
      input.email,
      input.claim.leadId,
    );
    if (completed) {
      return {
        status: 200 as const,
        body: { ok: true as const, leadId: input.claim.leadId },
      };
    }

    const retryClaim = await claimCrmBridge({
      planId: input.planId,
      email: input.email,
    });
    return handleBridgeClaim({
      claim: retryClaim,
      planId: input.planId,
      email: input.email,
      company: input.company,
    });
  }

  return runCrmBridge({
    leadId: input.claim.leadId,
    planId: input.planId,
    company: input.company,
    email: input.email,
    priorPayload: input.claim.priorPayload,
  });
}

async function runCrmBridge(input: {
  leadId: string;
  planId: string;
  company: string;
  email: string;
  priorPayload: Record<string, unknown>;
}) {
  const crmBridge = await recordEnterpriseConsultationAsLead({
    marketingLeadId: input.leadId,
    planId: input.planId,
    company: input.company,
    email: input.email,
  });

  if (!crmBridge) {
    await markLeadCrmBridgeFailed(input.leadId, input.priorPayload);
    return {
      status: 503 as const,
      body: {
        ok: false as const,
        leadId: input.leadId,
        message: "咨询已记录，但销售系统暂不可用，请稍后重试",
      },
    };
  }

  await markLeadCrmBridgeSynced(input.leadId, input.priorPayload);
  return {
    status: 200 as const,
    body: { ok: true as const, leadId: input.leadId },
  };
}

async function resetOrphanPending(planId: string, email: string) {
  const lead = await findExistingConsultLead(planId, email);
  if (!lead) return;

  const payload = readLeadPayload(lead.payload);
  if (
    isBridgeInFlight(payload) &&
    !(await crmBridgeAlreadyRecorded(lead.id))
  ) {
    await markLeadCrmBridgeFailed(lead.id, payload);
  }
}

async function resolveConsultLead(input: {
  planId: string;
  email: string;
  company: string;
  name: string;
  note: string;
  tenant: { organizationId?: string; projectId?: string };
  tx: Prisma.TransactionClient;
}) {
  let lead = await findExistingConsultLead(input.planId, input.email, input.tx);
  const existingPayload = lead ? readLeadPayload(lead.payload) : {};

  if (lead && isSyncedConsultLead(existingPayload)) {
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
          payload: withTrustedTenant(
            {
              from: "lead_create_api",
              createdAt: new Date().toISOString(),
            },
            input.tenant,
          ),
        },
      });
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
      lead = await findExistingConsultLead(input.planId, input.email, input.tx);
      if (!lead) throw err;
      const payload = readLeadPayload(lead.payload);
      if (isSyncedConsultLead(payload)) {
        return { kind: "existing_success" as const, lead };
      }
      lead = await input.tx.lead.update({
        where: { id: lead.id },
        data: {
          company: input.company,
          name: input.name,
          note: input.note || null,
          payload: withTrustedTenant(payload, input.tenant),
        },
      });
    }
  } else {
    lead = await input.tx.lead.update({
      where: { id: lead.id },
      data: {
        company: input.company,
        name: input.name,
        note: input.note || null,
        payload: withTrustedTenant(existingPayload, input.tenant),
      },
    });
  }

  return { kind: "needs_bridge" as const, lead };
}

export async function POST(req: NextRequest) {
  let planId = "";
  let email = "";

  try {
    const body = await req.json();
    planId = String(body?.planId || "").trim();
    const company = String(body?.company || "").trim();
    const name = String(body?.name || "").trim();
    email = String(body?.email || "")
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

    const tenant = await resolveTrustedTenantPayload(planId);
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
          tenant,
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

    const claim = await claimCrmBridge({ planId, email });
    const outcome = await handleBridgeClaim({
      claim,
      planId,
      email,
      company,
    });
    return NextResponse.json(outcome.body, { status: outcome.status });
  } catch (err: unknown) {
    console.error("[lead/create]", err);
    if (planId && email) {
      await resetOrphanPending(planId, email).catch(() => {});
    }
    return NextResponse.json(
      {
        ok: false,
        message: "系统繁忙，请稍后重试",
      },
      { status: 500 }
    );
  }
}
