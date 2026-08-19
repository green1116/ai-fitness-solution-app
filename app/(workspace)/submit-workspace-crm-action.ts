"use server";

import { getCurrentUser } from "@/lib/auth/currentUser";
import { closeDealWon } from "@/lib/crm/deal/deal.service";
import { promoteLeadToOpportunity } from "@/lib/crm/lead/lead.service";
import { updateOpportunityStage } from "@/lib/crm/opportunity/opportunity.service";
import type { OpportunityStageName } from "@/lib/crm/opportunity/opportunity.stage";
import {
  ensureOrganizationForUser,
  listOrganizationsForUser,
} from "@/lib/organization/organization.service";
import {
  runWithTenantContext,
  type TenantContext,
} from "@/lib/tenancy/tenant.context";
import { revalidatePath } from "next/cache";

export type CrmActionResult = {
  result: "SUCCESS" | "BLOCKED" | "FAILED";
  entity: string | null;
  entityId: string | null;
  opportunityId: string | null;
  message: string | null;
};

function logWorkspaceCrmAction(
  checkpoint: string,
  details: Record<string, unknown>,
) {
  console.info("[workspace.crm.action]", checkpoint, details);
}

function blockedResult(input: {
  entity: string | null;
  entityId: string | null;
  opportunityId?: string | null;
  message: string;
}): CrmActionResult {
  return {
    result: "BLOCKED",
    entity: input.entity,
    entityId: input.entityId,
    opportunityId: input.opportunityId ?? null,
    message: input.message,
  };
}

function successResult(input: {
  entity: string;
  entityId: string;
  opportunityId: string | null;
  message: string;
}): CrmActionResult {
  revalidatePath("/projects");
  return {
    result: "SUCCESS",
    entity: input.entity,
    entityId: input.entityId,
    opportunityId: input.opportunityId,
    message: input.message,
  };
}

function failedResult(input: {
  entity: string | null;
  entityId: string | null;
  opportunityId?: string | null;
  message: string;
}): CrmActionResult {
  return {
    result: "FAILED",
    entity: input.entity,
    entityId: input.entityId,
    opportunityId: input.opportunityId ?? null,
    message: input.message,
  };
}

function describeActionError(err: unknown, fallback: string): string {
  if (!(err instanceof Error)) return fallback;
  if (err.message.startsWith("Invalid stage transition:")) {
    return `Invalid transition: ${err.message.replace("Invalid stage transition: ", "")}`;
  }
  if (err.message === "Opportunity not found") {
    return "Service error: opportunity not found";
  }
  if (err.message === "Deal not found") {
    return "Service error: deal not found";
  }
  return `Service error: ${err.message}`;
}

function parseCrmItemId(raw: string): { entity: string; id: string } | null {
  const match = raw.match(/^crm:(lead|opp|deal):(.+)$/);
  if (!match) return null;
  return { entity: match[1], id: match[2] };
}

async function resolveUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const existing = await listOrganizationsForUser(user.id);
  if (!existing[0]) {
    await ensureOrganizationForUser({ userId: user.id, name: user.name ?? undefined });
  }
  return user.id;
}

async function tenantFromSession(): Promise<TenantContext | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const existing = await listOrganizationsForUser(user.id);
  const organization =
    existing[0]?.organization ??
    (await ensureOrganizationForUser({
      userId: user.id,
      name: user.name ?? undefined,
    }));
  return {
    organizationId: organization.id,
    userId: user.id,
    traceId: "workspace-crm-action",
  };
}

function nextOpportunityStage(
  currentStage: string,
): OpportunityStageName | null {
  switch (currentStage.toUpperCase()) {
    case "INIT":
      return "PROPOSAL";
    case "PROPOSAL":
      return "NEGOTIATION";
    case "NEGOTIATION":
      return "WON";
    case "WON":
    case "LOST":
      return null;
    default:
      return null;
  }
}

export async function submitWorkspaceCrmAction(
  _prev: CrmActionResult | null,
  formData: FormData,
): Promise<CrmActionResult> {
  const crmItemId = String(formData.get("crmItemId") ?? "").trim();
  const action = String(formData.get("crmAction") ?? "").trim();
  const currentStage = String(formData.get("currentStage") ?? "").trim();
  const currentStatus = String(formData.get("currentStatus") ?? "").trim();
  logWorkspaceCrmAction("entry", { crmItemId, action, currentStage, currentStatus });

  const parsed = parseCrmItemId(crmItemId);
  logWorkspaceCrmAction("parsed", {
    crmItemId,
    parsedEntity: parsed?.entity ?? null,
    parsedId: parsed?.id ?? null,
  });
  if (!parsed) {
    return blockedResult({
      entity: null,
      entityId: null,
      message: `Invalid CRM item ID: ${crmItemId || "(empty)"}`,
    });
  }

  const tenant = await tenantFromSession();
  logWorkspaceCrmAction("tenant", {
    organizationId: tenant?.organizationId ?? null,
    userId: tenant?.userId ?? null,
    traceId: tenant?.traceId ?? null,
  });
  if (!tenant) {
    return blockedResult({
      entity: parsed.entity,
      entityId: parsed.id,
      opportunityId: parsed.entity === "opp" ? parsed.id : null,
      message: "Auth blocked: no active workspace session",
    });
  }

  return runWithTenantContext(tenant, async () => {
    const userId = tenant.userId ?? (await resolveUserId());
    if (!userId) {
      return blockedResult({
        entity: parsed.entity,
        entityId: parsed.id,
        opportunityId: parsed.entity === "opp" ? parsed.id : null,
        message: "Auth blocked: unable to resolve user",
      });
    }

    if (parsed.entity === "lead" && action === "promote") {
      try {
        const { opportunity } = await promoteLeadToOpportunity({
          leadId: parsed.id,
          userId,
        });
        return successResult({
          entity: "lead",
          entityId: parsed.id,
          opportunityId: opportunity.id,
          message: `Promoted -> Opportunity ${opportunity.id}`,
        });
      } catch (err) {
        return failedResult({
          entity: "lead",
          entityId: parsed.id,
          message: describeActionError(err, "Service error: promote failed"),
        });
      }
    }

    if (parsed.entity === "opp" && action === "advance") {
      const nextStage = nextOpportunityStage(currentStage);
      if (!nextStage) {
        return blockedResult({
          entity: "opportunity",
          entityId: parsed.id,
          opportunityId: parsed.id,
          message: `Invalid transition: cannot advance from ${currentStage || "unknown"}`,
        });
      }

      try {
        logWorkspaceCrmAction("before-update-opportunity-stage", {
          opportunityId: parsed.id,
          currentStage,
          nextStage,
          userId,
        });
        const opportunity = await updateOpportunityStage({
          opportunityId: parsed.id,
          stage: nextStage,
          userId,
        });
        logWorkspaceCrmAction("after-update-opportunity-stage", {
          opportunityId: opportunity.id,
          stage: opportunity.stage,
        });
        return successResult({
          entity: "opportunity",
          entityId: parsed.id,
          opportunityId: opportunity.id,
          message: `Advanced -> ${opportunity.stage}`,
        });
      } catch (err) {
        logWorkspaceCrmAction("catch", {
          crmItemId,
          action,
          currentStage,
          errorMessage: err instanceof Error ? err.message : String(err),
          errorStack: err instanceof Error ? err.stack ?? null : null,
        });
        return failedResult({
          entity: "opportunity",
          entityId: parsed.id,
          opportunityId: parsed.id,
          message: describeActionError(err, "Service error: advance failed"),
        });
      }
    }

    if (parsed.entity === "deal" && action === "close_won") {
      if (currentStatus.toUpperCase() !== "OPEN") {
        return blockedResult({
          entity: "deal",
          entityId: parsed.id,
          message: `Invalid transition: deal must be OPEN, got ${currentStatus || "unknown"}`,
        });
      }

      try {
        logWorkspaceCrmAction("before-close-deal-won", {
          dealId: parsed.id,
          currentStatus,
          userId,
        });
        const deal = await closeDealWon({ dealId: parsed.id, userId });
        logWorkspaceCrmAction("after-close-deal-won", {
          dealId: deal.id,
          status: deal.status,
          opportunityId: deal.opportunityId,
        });
        return successResult({
          entity: "deal",
          entityId: parsed.id,
          opportunityId: deal.opportunityId,
          message: `Closed -> ${deal.status}`,
        });
      } catch (err) {
        logWorkspaceCrmAction("catch", {
          crmItemId,
          action,
          currentStatus,
          errorMessage: err instanceof Error ? err.message : String(err),
          errorStack: err instanceof Error ? err.stack ?? null : null,
        });
        return failedResult({
          entity: "deal",
          entityId: parsed.id,
          message: describeActionError(err, "Service error: close_won failed"),
        });
      }
    }

    return blockedResult({
      entity: parsed.entity,
      entityId: parsed.id,
      opportunityId: parsed.entity === "opp" ? parsed.id : null,
      message: `Invalid action dispatch: ${parsed.entity}.${action || "(empty)"}`,
    });
  });
}
