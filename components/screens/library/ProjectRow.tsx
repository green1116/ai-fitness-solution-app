import Link from "next/link";

import {
  buildContinuityHref,
  CONTINUITY_ENTRY_POINTS,
} from "@/lib/frontend/navigation";

export type ProjectRowData = Readonly<{
  id: string;
  name: string;
  status: string;
  createdDate: string;
}>;

type ProjectRowProps = Readonly<{
  project: ProjectRowData;
}>;

/**
 * CMP-PROJECT-ROW — one project row with Continue / Documents actions.
 */
export function ProjectRow({ project }: ProjectRowProps) {
  const continueEntry = CONTINUITY_ENTRY_POINTS[0];
  const documentsEntry = CONTINUITY_ENTRY_POINTS[1];

  return (
    <li
      data-cmp="CMP-PROJECT-ROW"
      data-project-id={project.id}
      className="border-b border-slate-200 py-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-slate-950">{project.name}</p>
          <p className="mt-1 text-sm text-slate-600">
            Status: {project.status}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Created: {project.createdDate}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link
            href={buildContinuityHref(continueEntry.path, project.id)}
            data-action-id={continueEntry.actionId}
            data-nav-id={continueEntry.id}
            className="font-semibold text-slate-950 underline underline-offset-4"
          >
            {continueEntry.label}
          </Link>
          <Link
            href={buildContinuityHref(documentsEntry.path, project.id)}
            data-action-id={documentsEntry.actionId}
            data-nav-id={documentsEntry.id}
            className="font-semibold text-slate-950 underline underline-offset-4"
          >
            {documentsEntry.label}
          </Link>
        </div>
      </div>
    </li>
  );
}
