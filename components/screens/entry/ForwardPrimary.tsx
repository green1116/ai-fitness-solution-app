import Link from "next/link";

type ForwardPrimaryProps = Readonly<{
  label: string;
  href: "/workspace";
  actionId: "ACT-02-03" | "ACT-03-03";
}>;

/**
 * CMP-FORWARD-PRIMARY — advance along PD-4.2 allowed edge only.
 */
export function ForwardPrimary({ label, href, actionId }: ForwardPrimaryProps) {
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
