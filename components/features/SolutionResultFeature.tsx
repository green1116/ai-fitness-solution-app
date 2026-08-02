import type { ReactNode } from "react";

import { ArtifactActions } from "@/components/screens/result/ArtifactActions";
import { ForwardGroup } from "@/components/screens/result/ForwardGroup";
import { ResultBlocks } from "@/components/screens/result/ResultBlocks";
import { ReviewSolutionPanel } from "@/components/screens/result/ReviewSolutionPanel";

type ResultSlots = Readonly<{
  summary: ReactNode;
  body: ReactNode;
  artifacts: ReactNode;
  forward: ReactNode;
}>;

const SOLUTION_ARTIFACTS = [
  {
    id: "download",
    label: "Download solution materials",
    actionId: "ACT-05-03",
    intId: "INT-ARTIFACT-DOWNLOAD" as const,
  },
  {
    id: "share",
    label: "Share solution",
    actionId: "ACT-05-04",
    intId: "INT-ARTIFACT-SHARE" as const,
  },
] as const;

const SOLUTION_FORWARD = [
  {
    id: "FWD-BUDGET",
    label: "Continue to budget",
    href: "/budget" as const,
    actionId: "ACT-05-05",
  },
  {
    id: "FWD-DOCUMENTS",
    label: "Open documents",
    href: "/documents" as const,
    actionId: "ACT-05-06",
  },
  {
    id: "FWD-WORKSPACE",
    label: "Return to AI Workspace",
    href: "/workspace" as const,
    actionId: "ACT-05-07",
  },
] as const;

/** FEATCMP-SOLUTION-RESULT — SUMMARY + BLOCKS + ARTIFACT + FORWARD */
export function getSolutionResultComposition(projectId = ""): ResultSlots {
  return {
    summary: (
      <div data-featcmp="FEATCMP-SOLUTION-RESULT" data-featcmp-slot="summary">
        <ReviewSolutionPanel
          projectId={projectId}
          title="Solution result"
          description="Review the planning solution, proposal, or package overview for this project."
        />
      </div>
    ),
    body: (
      <div data-featcmp="FEATCMP-SOLUTION-RESULT" data-featcmp-slot="body">
        <ResultBlocks />
      </div>
    ),
    artifacts: (
      <div data-featcmp="FEATCMP-SOLUTION-RESULT" data-featcmp-slot="artifacts">
        <ArtifactActions actions={SOLUTION_ARTIFACTS} />
      </div>
    ),
    forward: (
      <div data-featcmp="FEATCMP-SOLUTION-RESULT" data-featcmp-slot="forward">
        <ForwardGroup links={SOLUTION_FORWARD} projectId={projectId} />
      </div>
    ),
  };
}
