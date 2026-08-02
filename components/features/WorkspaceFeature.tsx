import type { ReactNode } from "react";

import { ContextPanel } from "@/components/screens/workspace/ContextPanel";
import { ConversationPanel } from "@/components/screens/workspace/ConversationPanel";
import { OutcomeLinks } from "@/components/screens/workspace/OutcomeLinks";
import { TaskPanel } from "@/components/screens/workspace/TaskPanel";

type WorkspaceSlots = Readonly<{
  conversation: ReactNode;
  task: ReactNode;
  context: ReactNode;
  outcomes: ReactNode;
}>;

/** FEATCMP-WORKSPACE — CONV + TASK + CONTEXT + OUTCOME */
export function getWorkspaceComposition(projectId = ""): WorkspaceSlots {
  return {
    conversation: (
      <div data-featcmp="FEATCMP-WORKSPACE" data-featcmp-slot="conversation">
        <ConversationPanel projectId={projectId} />
      </div>
    ),
    task: (
      <div data-featcmp="FEATCMP-WORKSPACE" data-featcmp-slot="task">
        <TaskPanel />
      </div>
    ),
    context: (
      <div data-featcmp="FEATCMP-WORKSPACE" data-featcmp-slot="context">
        <ContextPanel projectId={projectId} />
      </div>
    ),
    outcomes: (
      <div data-featcmp="FEATCMP-WORKSPACE" data-featcmp-slot="outcomes">
        <OutcomeLinks projectId={projectId} />
      </div>
    ),
  };
}
