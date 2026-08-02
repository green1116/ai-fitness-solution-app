import Link from "next/link";

import { ContinueToWorkspaceControl } from "@/components/screens/entry/ContinueToWorkspaceControl";

type ForwardPrimaryProps = Readonly<{
  label: string;
  href: "/workspace";
  actionId: "ACT-02-03" | "ACT-03-03";
}>;

/**
 * CMP-FORWARD-PRIMARY — advance along PD-4.2 allowed edge only.
 * ACT-02-03 (FEAT-12) is gated on planning inputs accepted.
 */
export function ForwardPrimary({ label, href, actionId }: ForwardPrimaryProps) {
  if (actionId === "ACT-02-03") {
    return <ContinueToWorkspaceControl label={label} />;
  }

  return (
    <div data-cmp="CMP-FORWARD-PRIMARY">
      <Link
        href={href}
        data-int-id="INT-FORWARD-PRIMARY"
        data-action-id={actionId}
        className="inline-flex text-sm font-semibold text-slate-950 underline underline-offset-4"
      >
        {label}
      </Link>
    </div>
  );
}
