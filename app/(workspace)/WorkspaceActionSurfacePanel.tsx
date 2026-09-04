import Link from "next/link";

import {
  productHref,
  type ProductCommercialContext,
} from "@/app/(product)/commercial-context";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { listOrganizationsForUser } from "@/lib/organization/organization.service";
import { listWorkspaceReviewSurfaceItemIds } from "@/lib/commercial/action-execution/workspace-review-action";
import { resolveValidatedProductContextForOpsCustomer } from "@/lib/product/runtime-ops-product-context-adapter";
import {
  readWorkspaceActionSurface,
  type WorkspaceActionSurfaceItem,
} from "@/lib/workflow/experience/workspace-action-surface";
import { WorkspaceReviewActionControl } from "./WorkspaceReviewActionControl";
import { WorkspaceOpsCrmIdentityLinkControl } from "./WorkspaceOpsCrmIdentityLinkControl";
import { submitWorkspaceReviewAction, submitWorkspaceReviewRecoveryAction } from "./submit-workspace-review-action";

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

async function loadWorkspaceOrganizationId(): Promise<string | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;
    const orgs = await listOrganizationsForUser(user.id);
    return orgs[0]?.organization.id ?? null;
  } catch {
    return null;
  }
}

async function loadOpsProductContextByItemId(
  organizationId: string,
  items: readonly WorkspaceActionSurfaceItem[],
): Promise<Map<string, ProductCommercialContext | null>> {
  const entries = await Promise.all(
    items.map(async (item) => {
      const productContext = await resolveValidatedProductContextForOpsCustomer(
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
}: {
  item: WorkspaceActionSurfaceItem;
  reviewItemIds: ReadonlySet<string>;
  productContext: ProductCommercialContext | null;
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
        <WorkspaceOpsCrmIdentityLinkControl opsCustomerId={item.customerId} />
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

export async function WorkspaceActionSurfacePanel() {
  const surface = readWorkspaceActionSurface();
  const reviewItemIds = new Set(listWorkspaceReviewSurfaceItemIds());
  const organizationId = await loadWorkspaceOrganizationId();
  const productContextByItemId =
    organizationId
      ? await loadOpsProductContextByItemId(organizationId, surface.items)
      : new Map<string, ProductCommercialContext | null>();
  const attentionItems = surface.items.filter((item) => item.state === "ATTENTION");
  const tailItems = surface.items.filter((item) => item.state !== "ATTENTION");

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
