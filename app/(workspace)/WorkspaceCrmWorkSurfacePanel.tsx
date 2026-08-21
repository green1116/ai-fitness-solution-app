import { getCurrentUser } from "@/lib/auth/currentUser";
import { listOrganizationsForUser } from "@/lib/organization/organization.service";
import { assembleCrmWorkSurface, type CrmWorkSurface } from "@/lib/crm/crm.workspace-surface";
import { WorkspaceCrmActionControl } from "./WorkspaceCrmActionControl";
import { submitWorkspaceCrmAction } from "./submit-workspace-crm-action";

const ENTITY_BADGE: Record<string, string> = {
  lead: "text-sky-400 border-sky-800",
  opportunity: "text-amber-400 border-amber-800",
  deal: "text-emerald-400 border-emerald-800",
};

const OPPORTUNITY_ADVANCE_LABEL: Record<string, string> = {
  INIT: "ADVANCE · INIT → PROPOSAL",
  PROPOSAL: "ADVANCE · PROPOSAL → NEGOTIATION",
  NEGOTIATION: "ADVANCE · NEGOTIATION → WON",
};

async function loadCrmWork(): Promise<CrmWorkSurface | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;
    const orgs = await listOrganizationsForUser(user.id);
    const organizationId = orgs[0]?.organization.id;
    if (!organizationId) return null;
    return await assembleCrmWorkSurface(organizationId);
  } catch {
    return null;
  }
}

export async function WorkspaceCrmWorkSurfacePanel() {
  const crmWork = await loadCrmWork();
  if (!crmWork) return null;
  if (crmWork.items.length === 0 && crmWork.outcomes.length === 0) return null;

  return (
    <section className="mx-auto mb-6 max-w-5xl rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-xs text-zinc-600">只读 · CRM Work Surface</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs text-zinc-500">Qualified Leads</p>
          <p className="mt-1 text-lg font-semibold text-sky-400">{crmWork.qualifiedLeads}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Active Opportunities</p>
          <p className="mt-1 text-lg font-semibold text-amber-400">{crmWork.activeOpportunities}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Open Deals</p>
          <p className="mt-1 text-lg font-semibold text-emerald-400">{crmWork.openDeals}</p>
        </div>
      </div>
      {crmWork.outcomes.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs text-zinc-500">Latest outcomes</p>
          <ul className="mt-2 space-y-1">
            {crmWork.outcomes.map((outcome) => (
              <li key={outcome.id} className="text-xs text-zinc-400">
                {outcome.timestamp.toISOString()} · {outcome.customerName} ·{" "}
                {outcome.entity}
                {outcome.entityId ? ` ${outcome.entityId}` : ""} · {outcome.event}
                {outcome.from && outcome.to ? ` · ${outcome.from} → ${outcome.to}` : ""}
                {outcome.userId ? ` · ${outcome.userId}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <ul className="mt-4 space-y-2">
        {crmWork.items.map((item) => (
          <li
            key={item.id}
            className="rounded-md border border-zinc-800 px-3 py-2 text-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium text-zinc-200">{item.customerName}</span>
              <span
                className={`rounded border px-1.5 py-0.5 text-xs uppercase tracking-wide ${ENTITY_BADGE[item.entity] ?? "text-zinc-400 border-zinc-700"}`}
              >
                {item.entity} · {item.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">{item.label}</p>
            {item.entity === "lead" && item.status === "QUALIFIED" ? (
              <WorkspaceCrmActionControl
                crmItemId={item.id}
                action="promote"
                label="PROMOTE · QUALIFIED → Opportunity INIT"
                submitCrmAction={submitWorkspaceCrmAction}
              />
            ) : item.entity === "opportunity" ? (
              <div className="mt-2 space-y-1">
                <WorkspaceCrmActionControl
                  crmItemId={item.id}
                  action="advance"
                  label={
                    OPPORTUNITY_ADVANCE_LABEL[
                      (item.stage ?? item.status).toUpperCase()
                    ] ?? "ADVANCE"
                  }
                  hiddenFields={{ currentStage: item.stage ?? item.status }}
                  submitCrmAction={submitWorkspaceCrmAction}
                />
                {(item.stage ?? item.status).toUpperCase() === "NEGOTIATION" ? (
                  <WorkspaceCrmActionControl
                    crmItemId={item.id}
                    action="open_deal"
                    label="OPEN DEAL · NEGOTIATION → Deal OPEN"
                    hiddenFields={{ currentStage: item.stage ?? item.status }}
                    submitCrmAction={submitWorkspaceCrmAction}
                  />
                ) : null}
              </div>
            ) : item.entity === "deal" && item.status === "OPEN" ? (
              <WorkspaceCrmActionControl
                crmItemId={item.id}
                action="close_won"
                label="CLOSE WON · OPEN → CLOSED_WON"
                hiddenFields={{ currentStatus: item.status }}
                submitCrmAction={submitWorkspaceCrmAction}
              />
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
