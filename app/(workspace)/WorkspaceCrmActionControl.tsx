"use client";

import { useActionState } from "react";

type CrmActionResult = {
  result: "SUCCESS" | "BLOCKED" | "FAILED";
  entity: string | null;
  entityId: string | null;
  opportunityId: string | null;
  message: string | null;
};

type SubmitCrmAction = (
  prev: CrmActionResult | null,
  formData: FormData,
) => Promise<CrmActionResult>;

export function WorkspaceCrmActionControl({
  crmItemId,
  action,
  label,
  hiddenFields,
  submitCrmAction,
}: {
  crmItemId: string;
  action: string;
  label: string;
  hiddenFields?: Record<string, string>;
  submitCrmAction: SubmitCrmAction;
}) {
  const [state, formAction] = useActionState(submitCrmAction, null);
  const isSuccess = state?.result === "SUCCESS";
  const isBlocked = state?.result === "BLOCKED";
  const isFailed = state?.result === "FAILED";
  const statusLabel = isSuccess
    ? "SUCCESS"
    : isBlocked
      ? "BLOCKED"
      : isFailed
        ? "FAILED"
        : null;
  const messageToneClass = isSuccess
    ? "text-emerald-500"
    : isBlocked
      ? "text-amber-400"
      : isFailed
        ? "text-red-400"
        : "text-zinc-500";

  return (
    <div className="mt-2 flex flex-col gap-1">
      <form action={formAction} className="flex items-center gap-2">
        <input type="hidden" name="crmItemId" value={crmItemId} />
        <input type="hidden" name="crmAction" value={action} />
        {hiddenFields
          ? Object.entries(hiddenFields).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))
          : null}
        <button
          type="submit"
          disabled={isSuccess}
          className="rounded border border-sky-700 px-2 py-1 text-xs uppercase tracking-wide text-sky-300 hover:border-sky-500 disabled:opacity-40"
        >
          {label}
        </button>
        {statusLabel ? (
          <span className="text-xs uppercase tracking-wide text-zinc-400">
            {statusLabel}
          </span>
        ) : null}
      </form>
      {state?.message ? (
        <p className={`text-xs ${messageToneClass}`}>{state.message}</p>
      ) : null}
    </div>
  );
}
