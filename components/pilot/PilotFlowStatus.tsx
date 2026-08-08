"use client";

import {
  PILOT_FLOW_STATUS_STEPS,
  type PilotFlowStatus,
} from "./pilot-workflow.config";

type PilotFlowStatusProps = {
  status: PilotFlowStatus;
};

const STATUS_ORDER: PilotFlowStatus[] = [
  "not_uploaded",
  "parsed",
  "generated",
  "downloadable",
  "delivered",
];

export function PilotFlowStatus({ status }: PilotFlowStatusProps) {
  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-black/40 p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-zinc-500">
        流程状态
      </p>
      <ol className="flex flex-wrap gap-2">
        {PILOT_FLOW_STATUS_STEPS.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <li
              key={step.id}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                active
                  ? "bg-sky-600 text-white"
                  : done
                    ? "bg-emerald-950 text-emerald-300"
                    : "border border-zinc-800 text-zinc-500"
              }`}
            >
              {step.label}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
