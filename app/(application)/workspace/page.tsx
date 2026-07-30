import { WorkspaceScreen } from "@/components/screens/workspace/WorkspaceScreen";

type WorkspacePageProps = Readonly<{
  searchParams: Promise<{ projectId?: string | string[] }>;
}>;

function readProjectId(
  value: string | string[] | undefined,
): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }
  return value?.trim() ?? "";
}

/**
 * PG-WORKSPACE → SCR-04 AI Workspace (PD-4.2 RT-WORKSPACE).
 * Forwards opaque `projectId` cue only — no Domain project resolution.
 */
export default async function WorkspacePage({
  searchParams,
}: WorkspacePageProps) {
  const params = await searchParams;
  return <WorkspaceScreen projectId={readProjectId(params.projectId)} />;
}
