import {
  ProjectRow,
  type ProjectRowData,
} from "@/components/screens/library/ProjectRow";

/**
 * Presentation placeholders only — no project inventory API ownership.
 */
export const PRESENTATION_PROJECT_ROWS: readonly ProjectRowData[] = [
  {
    id: "proj-alpha",
    name: "Enterprise Campus Fitness",
    status: "In progress",
    createdDate: "2026-01-12",
  },
  {
    id: "proj-beta",
    name: "Tender Response Pack",
    status: "Ready for review",
    createdDate: "2026-02-03",
  },
  {
    id: "proj-gamma",
    name: "Sales Opportunity Workspace",
    status: "Draft",
    createdDate: "2026-03-18",
  },
] as const;

/**
 * CMP-PROJECT-LIST — SCR-07 list zone (ACT-07-01).
 */
export function ProjectList() {
  return (
    <div data-cmp="CMP-PROJECT-LIST" data-action-id="ACT-07-01">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        My projects
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        Projects
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
        Continue prior work in the AI Workspace or open project documents.
      </p>
      <ul className="mt-8">
        {PRESENTATION_PROJECT_ROWS.map((project) => (
          <ProjectRow key={project.id} project={project} />
        ))}
      </ul>
    </div>
  );
}
