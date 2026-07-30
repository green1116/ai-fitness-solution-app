import Link from "next/link";

import { buildProjectScopedHref } from "@/lib/frontend/navigation";
import type { PresentationRoutePath } from "@/lib/frontend/presentation-routes";

type ForwardLink = Readonly<{
  id: string;
  label: string;
  href: PresentationRoutePath;
  actionId: string;
}>;

type ForwardGroupProps = Readonly<{
  links: readonly ForwardLink[];
  projectId?: string;
}>;

/**
 * CMP-FORWARD-GROUP — allowed next-screen links from Results.
 * Targets only PD-4.2 allowed edges; no Domain decisions.
 */
export function ForwardGroup({ links, projectId = "" }: ForwardGroupProps) {
  return (
    <div data-cmp="CMP-FORWARD-GROUP">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Forward
      </p>
      <ul className="mt-4 flex flex-wrap gap-4 text-sm">
        {links.map((link) => (
          <li key={link.id}>
            <Link
              href={buildProjectScopedHref(link.href, projectId)}
              data-action-id={link.actionId}
              data-nav-id={link.id}
              className="font-semibold text-slate-950 underline underline-offset-4"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
