import Link from "next/link";
import { tenderEnterpriseUpgradeLabel } from "./tender-entitlement";

export function TenderEnterpriseUpgradeCta({
  href,
  label,
}: {
  href: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-emerald-400"
    >
      {label ?? tenderEnterpriseUpgradeLabel()}
    </Link>
  );
}
