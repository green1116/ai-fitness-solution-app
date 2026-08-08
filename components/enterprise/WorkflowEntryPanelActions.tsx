"use client";

import Link from "next/link";

import {
  getWorkflowProductionUiForHost,
  type WorkflowProductionHost,
  type WorkflowProductionUiAction,
} from "@/lib/enterprise/workflow-production-ui";

type Props = {
  host: WorkflowProductionHost;
  /** Optional prebuilt actions (server pages / tests). */
  actions?: readonly WorkflowProductionUiAction[];
};

function actionLabel(scenario: WorkflowProductionUiAction["scenario"]): string {
  switch (scenario) {
    case "INTAKE":
      return "Intake";
    case "EXECUTION":
      return "Execution";
    case "REVIEW":
      return "Review";
    case "HANDOFF":
      return "Handoff";
    default:
      return scenario;
  }
}

/**
 * EP-4 / WP-9 — surfaces WP-8 WorkflowEntryPanel actions on production hosts.
 * Links reuse existing routes; labels map to existing APIs / handlers / UI.
 */
export function WorkflowEntryPanelActions({ host, actions }: Props) {
  const rows = actions ?? getWorkflowProductionUiForHost(host);

  if (rows.length === 0) {
    return null;
  }

  return (
    <section
      className="rounded-2xl border border-emerald-900/40 bg-emerald-950/10 p-5"
      aria-label="Workflow entry actions"
      data-ep4-wp9="workflow-entry-panel-actions"
      data-host={host}
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-300/90">
          Workflow actions
        </h2>
        <p className="font-mono text-[10px] text-zinc-600">EP-4 / WP-9 · production</p>
      </div>
      <ul className="space-y-2">
        {rows.map((row) => (
          <li
            key={`${row.workflowId}|${row.scenario}`}
            className="rounded-xl border border-zinc-800 bg-black/40 px-3 py-2"
            data-workflow-action={row.scenario}
            data-mocked={row.mocked ? "true" : "false"}
            data-action-visible={row.actionVisible ? "true" : "false"}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-white">
                  {actionLabel(row.scenario)}
                  <span className="ml-2 text-xs font-normal text-zinc-500">
                    → {row.uiComponent}
                  </span>
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-zinc-500">
                  {row.handler} · {row.endpoint}
                </p>
              </div>
              <Link
                href={row.route}
                className="rounded-lg border border-zinc-700 px-2.5 py-1 text-xs text-sky-300 hover:bg-zinc-900"
              >
                {row.route}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
