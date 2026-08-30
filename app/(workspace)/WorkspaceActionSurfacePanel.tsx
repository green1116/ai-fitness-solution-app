import { listWorkspaceReviewSurfaceItemIds } from "@/lib/commercial/action-execution/workspace-review-action";
import {
  readWorkspaceActionSurface,
  type WorkspaceActionSurfaceItem,
} from "@/lib/workflow/experience/workspace-action-surface";
import { WorkspaceReviewActionControl } from "./WorkspaceReviewActionControl";
import { submitWorkspaceReviewAction, submitWorkspaceReviewRecoveryAction } from "./submit-workspace-review-action";

const STATE_LABEL: Readonly<Record<"ATTENTION" | "AVAILABLE" | "DEFERRED", string>> = {
  ATTENTION: "ATTENTION",
  AVAILABLE: "AVAILABLE",
  DEFERRED: "DEFERRED",
};

function SurfaceItemRow({
  item,
  reviewItemIds,
}: {
  item: WorkspaceActionSurfaceItem;
  reviewItemIds: ReadonlySet<string>;
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
