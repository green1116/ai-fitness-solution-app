import Link from "next/link";

import { buildAdminHref, type OpsAreaId } from "@/lib/frontend/navigation";

type OpsAreaProps = Readonly<{
  id: OpsAreaId;
  title: string;
  description: string;
  actionId: string;
  active?: boolean;
}>;

/**
 * CMP-OPS-AREA — one Admin observation area on SCR-09.
 * Observation affordance only; no tenant provisioning or RBAC ownership.
 */
export function OpsArea({
  id,
  title,
  description,
  actionId,
  active = false,
}: OpsAreaProps) {
  return (
    <section
      data-cmp="CMP-OPS-AREA"
      data-int-id="INT-OPS-VIEW"
      data-ops-area={id}
      data-action-id={actionId}
      data-active={active ? "true" : "false"}
      className="border-b border-slate-200 pb-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-slate-950">
          {title}
        </h2>
        <Link
          href={buildAdminHref(id)}
          className="text-sm font-semibold text-slate-600 underline underline-offset-4 hover:text-slate-950"
        >
          Focus
        </Link>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      <p className="mt-3 text-sm text-slate-500">
        Observation surface — metrics and records appear here when available.
      </p>
    </section>
  );
}
