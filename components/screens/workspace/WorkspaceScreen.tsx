import { getWorkspaceComposition } from "@/components/features/WorkspaceFeature";
import { LayoutHost } from "@/components/layout-host/LayoutHost";

type WorkspaceScreenProps = Readonly<{
  projectId?: string;
}>;

/**
 * SCRCMP-WORKSPACE — SCR-04.
 * Composes FEATCMP-WORKSPACE into LAYCMP-SPLIT-3.
 */
export function WorkspaceScreen({ projectId = "" }: WorkspaceScreenProps) {
  const workspace = getWorkspaceComposition(projectId);

  return (
    <section
      data-scrcmp="SCRCMP-WORKSPACE"
      data-screen="SCR-04"
      data-page="PG-WORKSPACE"
      data-layout="LAY-SPLIT-3"
    >
      <LayoutHost
        screenId="SCR-04"
        conversation={workspace.conversation}
        task={workspace.task}
        context={workspace.context}
        outcomes={workspace.outcomes}
      />
    </section>
  );
}
