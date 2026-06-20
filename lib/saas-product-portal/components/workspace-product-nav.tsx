"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  resolveActiveWorkspaceNavKey,
  WORKSPACE_PRODUCT_NAV_ITEMS,
} from "../workspace-capability/workspace-product-navigation";

interface WorkspaceProductNavProps {
  workspaceId: string;
}

export function WorkspaceProductNav({ workspaceId }: WorkspaceProductNavProps) {
  const pathname = usePathname();
  const activeKey = resolveActiveWorkspaceNavKey(pathname, workspaceId);

  return (
    <nav className="flex flex-wrap gap-2 border-b border-zinc-800 pb-4">
      {WORKSPACE_PRODUCT_NAV_ITEMS.map((item) => {
        const active = item.key === activeKey;
        return (
          <Link
            key={item.key}
            href={item.href(workspaceId)}
            className={`rounded-lg px-3 py-2 text-sm transition ${
              active
                ? "bg-amber-950/50 text-amber-100 ring-1 ring-amber-800/60"
                : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
