import { LayoutHost } from "@/components/layout-host/LayoutHost";
import { ContextPanel } from "@/components/screens/workspace/ContextPanel";
import { ConversationPanel } from "@/components/screens/workspace/ConversationPanel";
import { OutcomeLinks } from "@/components/screens/workspace/OutcomeLinks";
import { TaskPanel } from "@/components/screens/workspace/TaskPanel";

type WorkspaceScreenProps = Readonly<{
  projectId?: string;
}>;

/**
 * SCRCMP-WORKSPACE — SCR-04 AI Workspace (LAY-SPLIT-3).
 * Reuses FE-1 LayoutHost; presentation composition only.
 */
export function WorkspaceScreen({ projectId = "" }: WorkspaceScreenProps) {
  return (
    <section
      data-screen="SCR-04"
      data-page="PG-WORKSPACE"
      data-layout="LAY-SPLIT-3"
    >
      <LayoutHost
        screenId="SCR-04"
        conversation={<ConversationPanel />}
        task={<TaskPanel />}
        context={<ContextPanel projectId={projectId} />}
        outcomes={<OutcomeLinks projectId={projectId} />}
      />
    </section>
  );
}
