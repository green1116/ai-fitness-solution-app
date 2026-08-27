import { getCurrentUser } from "@/lib/auth/currentUser";
import { listOrganizationsForUser } from "@/lib/organization/organization.service";
import {
  aggregateRevenueIntelligenceSnapshot,
  type RevenueIntelligenceSnapshot,
} from "@/lib/crm/crm.metrics";
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

async function loadCrmWorkSurface(): Promise<{
  crmWork: CrmWorkSurface;
  intelligence: RevenueIntelligenceSnapshot;
} | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;
    const orgs = await listOrganizationsForUser(user.id);
    const organizationId = orgs[0]?.organization.id;
    if (!organizationId) return null;
    const [crmWork, intelligence] = await Promise.all([
      assembleCrmWorkSurface(organizationId),
      aggregateRevenueIntelligenceSnapshot(organizationId),
    ]);
    return { crmWork, intelligence };
  } catch {
    return null;
  }
}

export async function WorkspaceCrmWorkSurfacePanel() {
  const loaded = await loadCrmWorkSurface();
  if (!loaded) return null;
  const { crmWork, intelligence } = loaded;
  const hasIntelligence =
    intelligence.openPipeline.count > 0 ||
    intelligence.consultFunnel.consult > 0 ||
    intelligence.consultFunnel.opportunity > 0 ||
    intelligence.consultFunnel.won > 0;
  if (
    crmWork.items.length === 0 &&
    crmWork.outcomes.length === 0 &&
    crmWork.consultQueue.length === 0 &&
    crmWork.consultInitQueue.length === 0 &&
    !hasIntelligence
  ) {
    return null;
  }

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
      {hasIntelligence ? (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-zinc-500">Revenue Intelligence</p>
          <div>
            <p className="text-xs text-zinc-600">Open Pipeline</p>
            <p className="mt-1 text-sm text-zinc-300">
              {intelligence.openPipeline.count} opportunities · ¥
              {intelligence.openPipeline.totalValue}
            </p>
            {intelligence.openPipelineByStage.length > 0 ? (
              <ul className="mt-1 space-y-0.5">
                {intelligence.openPipelineByStage.map((row) => (
                  <li key={row.stage} className="text-xs text-zinc-500">
                    {row.stage} · {row.count} · ¥{row.totalValue}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div>
            <p className="text-xs text-zinc-600">Consult Funnel</p>
            <p className="mt-1 text-xs text-zinc-400">
              consult {intelligence.consultFunnel.consult} → opportunity{" "}
              {intelligence.consultFunnel.opportunity} → won{" "}
              {intelligence.consultFunnel.won}
            </p>
          </div>
        </div>
      ) : null}
      {crmWork.consultInitQueue.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs text-zinc-500">
            Consult INIT queue · ADVANCE INIT → PROPOSAL
          </p>
          <ul className="mt-2 space-y-2">
            {crmWork.consultInitQueue.map((item) => (
              <li
                key={item.id}
                className="rounded-md border border-amber-900/60 px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-zinc-200">
                    {item.customerName}
                  </span>
                  <span className="rounded border border-amber-800 px-1.5 py-0.5 text-xs uppercase tracking-wide text-amber-400">
                    opportunity · INIT
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  score {item.leadScore} · {item.createdAt.toISOString()}
                </p>
                {item.contactEmail ? (
                  <p className="mt-0.5 text-xs text-zinc-500">{item.contactEmail}</p>
                ) : null}
                {item.contactPhone ? (
                  <p className="mt-0.5 text-xs text-zinc-500">
                    phone {item.contactPhone}
                  </p>
                ) : null}
                {item.sourceLabel ? (
                  <p className="mt-0.5 text-xs text-zinc-600">{item.sourceLabel}</p>
                ) : null}
                <WorkspaceCrmActionControl
                  crmItemId={item.id}
                  action="advance"
                  label="ADVANCE · INIT → PROPOSAL"
                  hiddenFields={{ currentStage: "INIT" }}
                  submitCrmAction={submitWorkspaceCrmAction}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {crmWork.consultQueue.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs text-zinc-500">Marketing consult queue</p>
          <ul className="mt-2 space-y-2">
            {crmWork.consultQueue.map((lead) => (
              <li
                key={lead.id}
                className="rounded-md border border-zinc-800 px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-zinc-200">
                    {lead.company || lead.name || lead.email}
                  </span>
                  <span className="rounded border border-zinc-700 px-1.5 py-0.5 text-xs uppercase tracking-wide text-zinc-400">
                    consult · {lead.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  {[lead.name, lead.email].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-0.5 text-xs text-zinc-600">
                  {lead.createdAt.toISOString()}
                  {lead.projectId ? ` · project ${lead.projectId}` : ""}
                </p>
                {lead.phone || lead.title ? (
                  <p className="mt-0.5 text-xs text-zinc-600">
                    {[
                      lead.phone ? `phone ${lead.phone}` : null,
                      lead.title ? `title ${lead.title}` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
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
            {item.contactEmail ? (
              <p className="mt-1 text-xs text-zinc-400">{item.contactEmail}</p>
            ) : null}
            {item.sourceLabel ? (
              <p className="mt-0.5 text-xs text-zinc-500">{item.sourceLabel}</p>
            ) : null}
            {item.projectId || item.quoteId || item.budgetId ? (
              <p className="mt-0.5 text-xs text-zinc-600">
                {[
                  item.projectId ? `project ${item.projectId}` : null,
                  item.quoteId ? `quote ${item.quoteId}` : null,
                  item.budgetId ? `budget ${item.budgetId}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            ) : null}
            {item.entity === "lead" && item.status === "QUALIFIED" ? (
              <WorkspaceCrmActionControl
                crmItemId={item.id}
                action="promote"
                label="PROMOTE · QUALIFIED → Opportunity INIT"
                submitCrmAction={submitWorkspaceCrmAction}
              />
            ) : item.entity === "opportunity" ? (
              <div className="mt-2 space-y-1">
                {(item.stage ?? item.status).toUpperCase() !== "NEGOTIATION" ? (
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
                ) : null}
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
