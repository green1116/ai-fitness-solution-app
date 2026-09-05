import Link from "next/link";

import {
  productHref,
  type ProductCommercialContext,
} from "@/app/(product)/commercial-context";
import { listCustomers } from "@/lib/crm/customer/customer.service";
import { listWorkspaceReviewSurfaceItemIds } from "@/lib/commercial/action-execution/workspace-review-action";
import { resolveValidatedProductContextForCustomer } from "@/lib/product/commercial-context-bridge";
import { lookupOpsCrmIdentitySeed } from "@/lib/product/runtime-ops-crm-identity-registry";
import { listOpsCrmIdentityLinksByOpsCustomerIds } from "@/lib/product/runtime-ops-crm-identity-store";
import {
  readTenantOpsBacklog,
  type TenantOpsBacklog,
  type TenantOpsBacklogItem,
} from "@/lib/runtime-ops/tenant-ops-backlog";
import { isTenantOpsExecuteEligible } from "@/lib/runtime-ops/tenant-ops-execute";
import {
  readWorkspaceActionSurface,
  type WorkspaceActionSurfaceItem,
} from "@/lib/workflow/experience/workspace-action-surface";
import { WorkspaceReviewActionControl } from "./WorkspaceReviewActionControl";
import { TenantOpsReviewActionControl } from "./TenantOpsReviewActionControl";
import {
  WorkspaceOpsCrmIdentityLinkControl,
  type CrmCustomerOption,
} from "./WorkspaceOpsCrmIdentityLinkControl";
import { submitWorkspaceReviewAction, submitWorkspaceReviewRecoveryAction } from "./submit-workspace-review-action";
import { submitTenantOpsReviewAction } from "./submit-tenant-ops-review-action";

const STATE_LABEL: Readonly<Record<"ATTENTION" | "AVAILABLE" | "DEFERRED", string>> = {
  ATTENTION: "ATTENTION",
  AVAILABLE: "AVAILABLE",
  DEFERRED: "DEFERRED",
};

type ProductRoute = "/quote" | "/budget" | "/tender";

const PRODUCT_ROUTE_LABEL: Record<ProductRoute, string> = {
  "/quote": "方案",
  "/budget": "预算",
  "/tender": "标书",
};

function pickOpsProductRoute(ctx: ProductCommercialContext): ProductRoute | null {
  if (ctx.projectId && ctx.quoteId && ctx.budgetId) return "/tender";
  if (ctx.quoteId && ctx.budgetId) return "/budget";
  if (ctx.quoteId) return "/quote";
  return null;
}

async function loadOpsProductContextByItemId(
  organizationId: string,
  items: readonly WorkspaceActionSurfaceItem[],
): Promise<Map<string, ProductCommercialContext | null>> {
  const linkByOpsId = await listOpsCrmIdentityLinksByOpsCustomerIds(
    organizationId,
    items.map((item) => item.customerId),
  );

  const entries = await Promise.all(
    items.map(async (item) => {
      const opsId = item.customerId.trim();
      const crmCustomerId =
        lookupOpsCrmIdentitySeed(organizationId, opsId) ??
        linkByOpsId.get(opsId) ??
        null;
      if (!crmCustomerId) {
        return [item.id, null] as const;
      }
      const productContext = await resolveValidatedProductContextForCustomer(
        organizationId,
        crmCustomerId,
      );
      return [item.id, productContext] as const;
    }),
  );
  return new Map(entries);
}

async function loadTenantProductContextByItemId(
  organizationId: string,
  items: readonly TenantOpsBacklogItem[],
): Promise<Map<string, ProductCommercialContext | null>> {
  const entries = await Promise.all(
    items.map(async (item) => {
      const productContext = await resolveValidatedProductContextForCustomer(
        organizationId,
        item.customerId,
      );
      return [item.id, productContext] as const;
    }),
  );
  return new Map(entries);
}

function OpsActionSurfaceProductLink({
  productContext,
}: {
  productContext: ProductCommercialContext;
}) {
  const route = pickOpsProductRoute(productContext);
  if (!route) return null;

  const href = productHref(route, productContext, { handoff: "crm" });
  return (
    <p className="mt-0.5 text-xs">
      <Link href={href} className="text-sky-500/90 hover:text-sky-400">
        打开{PRODUCT_ROUTE_LABEL[route]}
      </Link>
    </p>
  );
}

function SurfaceItemRow({
  item,
  reviewItemIds,
  productContext,
  organizationId,
  crmCustomers,
}: {
  item: WorkspaceActionSurfaceItem;
  reviewItemIds: ReadonlySet<string>;
  productContext: ProductCommercialContext | null;
  organizationId: string;
  crmCustomers: readonly CrmCustomerOption[];
}) {
  return (
    <li className="rounded-md border border-zinc-800 px-3 py-2 text-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-zinc-200">{item.customerId}</span>
        <span className="text-xs uppercase tracking-wide text-zinc-400">
          {STATE_LABEL[item.state]}
        </span>
      </div>
      <p className="mt-1 text-xs text-zinc-500">{item.reason}</p>
      {productContext ? (
        <OpsActionSurfaceProductLink productContext={productContext} />
      ) : (
        <WorkspaceOpsCrmIdentityLinkControl
          opsCustomerId={item.customerId}
          organizationId={organizationId}
          customers={crmCustomers}
        />
      )}
      {reviewItemIds.has(item.id) ? (
        <WorkspaceReviewActionControl
          surfaceItemId={item.id}
          submitReviewAction={submitWorkspaceReviewAction}
          submitRecoveryAction={submitWorkspaceReviewRecoveryAction}
        />
      ) : null}
    </li>
  );
}

function TenantBacklogItemRow({
  item,
  productContext,
}: {
  item: TenantOpsBacklogItem;
  productContext: ProductCommercialContext | null;
}) {
  return (
    <li className="rounded-md border border-zinc-800 px-3 py-2 text-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-zinc-200">
          {item.customerName || item.customerId}
        </span>
        <span className="text-xs uppercase tracking-wide text-zinc-400">
          {STATE_LABEL[item.state]}
        </span>
      </div>
      <p className="mt-1 text-xs text-zinc-500">{item.reason}</p>
      <p className="mt-0.5 text-xs text-zinc-600">
        {item.action} · {item.stage}
      </p>
      {productContext ? (
        <OpsActionSurfaceProductLink productContext={productContext} />
      ) : null}
      {item.reviewEligible || isTenantOpsExecuteEligible(item.stage) ? (
        <TenantOpsReviewActionControl
          itemId={item.id}
          stage={item.stage}
          submitReviewAction={submitTenantOpsReviewAction}
        />
      ) : null}
    </li>
  );
}

async function renderTenantOpsBacklogPanel(organizationId: string) {
  const backlog: TenantOpsBacklog = await readTenantOpsBacklog(organizationId);
  const productContextByItemId = await loadTenantProductContextByItemId(
    organizationId,
    backlog.items,
  );

  const attentionItems = backlog.items.filter((item) => item.state === "ATTENTION");
  const tailItems = backlog.items.filter((item) => item.state !== "ATTENTION");

  return (
    <section className="mx-auto mt-4 max-w-5xl rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-xs text-zinc-600">只读 · readTenantOpsBacklog()</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs text-zinc-500">Attention</p>
          <p className="mt-1 text-lg font-semibold">{backlog.attentionCount}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Available</p>
          <p className="mt-1 text-lg font-semibold">{backlog.availableCount}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Deferred</p>
          <p className="mt-1 text-lg font-semibold">{backlog.deferredCount}</p>
        </div>
      </div>
      {backlog.items.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">No tenant ops backlog</p>
      ) : (
        <>
          {attentionItems.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {attentionItems.map((item) => (
                <TenantBacklogItemRow
                  key={item.id}
                  item={item}
                  productContext={productContextByItemId.get(item.id) ?? null}
                />
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">No ATTENTION tenant ops items</p>
          )}
          {tailItems.length > 0 ? (
            <details className="mt-4">
              <summary className="cursor-pointer text-xs text-zinc-500">
                + {tailItems.length} more tenant ops items · Available{" "}
                {backlog.availableCount} · Deferred {backlog.deferredCount}
              </summary>
              <ul className="mt-2 space-y-2">
                {tailItems.map((item) => (
                  <TenantBacklogItemRow
                    key={item.id}
                    item={item}
                    productContext={productContextByItemId.get(item.id) ?? null}
                  />
                ))}
              </ul>
            </details>
          ) : null}
        </>
      )}
    </section>
  );
}

/** Frozen EWAS path — verify/fallback only when org prefers tenant backlog. */
async function renderFrozenEwasPanel(organizationId: string | null) {
  const surface = readWorkspaceActionSurface();
  const reviewItemIds = new Set(listWorkspaceReviewSurfaceItemIds());
  const productContextByItemId =
    organizationId
      ? await loadOpsProductContextByItemId(organizationId, surface.items)
      : new Map<string, ProductCommercialContext | null>();

  const needsIdentityLink =
    Boolean(organizationId) &&
    surface.items.some((item) => !(productContextByItemId.get(item.id) ?? null));

  let crmCustomers: CrmCustomerOption[] = [];
  if (organizationId && needsIdentityLink) {
    try {
      const rows = await listCustomers(organizationId);
      crmCustomers = rows
        .map((row) => ({
          id: typeof row.id === "string" ? row.id.trim() : "",
          name: typeof row.name === "string" ? row.name.trim() : "",
        }))
        .filter((row) => row.id.length > 0);
    } catch {
      crmCustomers = [];
    }
  }

  const attentionItems = surface.items.filter((item) => item.state === "ATTENTION");
  const tailItems = surface.items.filter((item) => item.state !== "ATTENTION");
  const orgId = organizationId ?? "";

  return (
    <section className="mx-auto mt-4 max-w-5xl rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-xs text-zinc-600">只读 · readWorkspaceActionSurface()</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs text-zinc-500">Attention</p>
          <p className="mt-1 text-lg font-semibold">{surface.attentionCount}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Available</p>
          <p className="mt-1 text-lg font-semibold">{surface.availableCount}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Deferred</p>
          <p className="mt-1 text-lg font-semibold">{surface.deferredCount}</p>
        </div>
      </div>
      {surface.items.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">No workspace actions</p>
      ) : (
        <>
          {attentionItems.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {attentionItems.map((item) => (
                <SurfaceItemRow
                  key={item.id}
                  item={item}
                  reviewItemIds={reviewItemIds}
                  productContext={productContextByItemId.get(item.id) ?? null}
                  organizationId={orgId}
                  crmCustomers={crmCustomers}
                />
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">No ATTENTION workspace actions</p>
          )}
          {tailItems.length > 0 ? (
            <details className="mt-4">
              <summary className="cursor-pointer text-xs text-zinc-500">
                + {tailItems.length} more workspace actions · Available{" "}
                {surface.availableCount} · Deferred {surface.deferredCount}
              </summary>
              <ul className="mt-2 space-y-2">
                {tailItems.map((item) => (
                  <SurfaceItemRow
                    key={item.id}
                    item={item}
                    reviewItemIds={reviewItemIds}
                    productContext={productContextByItemId.get(item.id) ?? null}
                    organizationId={orgId}
                    crmCustomers={crmCustomers}
                  />
                ))}
              </ul>
            </details>
          ) : null}
        </>
      )}
    </section>
  );
}

export async function WorkspaceActionSurfacePanel({
  organizationId,
}: {
  organizationId: string | null;
}) {
  if (organizationId) {
    try {
      return await renderTenantOpsBacklogPanel(organizationId);
    } catch {
      // Tenant read failed — fall back to frozen EWAS for verify/ops continuity.
      return renderFrozenEwasPanel(organizationId);
    }
  }

  return renderFrozenEwasPanel(null);
}
