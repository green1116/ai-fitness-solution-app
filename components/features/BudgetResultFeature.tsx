import type { ReactNode } from "react";

import { ArtifactActions } from "@/components/screens/result/ArtifactActions";
import { BudgetOverview } from "@/components/screens/result/BudgetOverview";
import { ForwardGroup } from "@/components/screens/result/ForwardGroup";
import { ResultSummary } from "@/components/screens/result/ResultSummary";

type ResultSlots = Readonly<{
  summary: ReactNode;
  body: ReactNode;
  artifacts: ReactNode;
  forward: ReactNode;
}>;

const BUDGET_ARTIFACTS = [
  {
    id: "download",
    label: "Download budget",
    actionId: "ACT-06-02",
    intId: "INT-ARTIFACT-DOWNLOAD" as const,
  },
] as const;

const BUDGET_FORWARD = [
  {
    id: "FWD-WORKSPACE",
    label: "Adjust requirements",
    href: "/workspace" as const,
    actionId: "ACT-06-03",
  },
  {
    id: "FWD-DOCUMENTS",
    label: "Open documents",
    href: "/documents" as const,
    actionId: "ACT-06-04",
  },
  {
    id: "FWD-SOLUTION",
    label: "Return to solution",
    href: "/solution" as const,
    actionId: "ACT-06-05",
  },
] as const;

/** FEATCMP-BUDGET-RESULT — SUMMARY + BUDGET-OVERVIEW + ARTIFACT + FORWARD */
export function getBudgetResultComposition(projectId = ""): ResultSlots {
  return {
    summary: (
      <div data-featcmp="FEATCMP-BUDGET-RESULT" data-featcmp-slot="summary">
        <ResultSummary
          title="Budget result"
          description="Review the investment estimate, category breakdown, and available options."
          actionIds={["ACT-06-01"]}
        />
      </div>
    ),
    body: (
      <div data-featcmp="FEATCMP-BUDGET-RESULT" data-featcmp-slot="body">
        <BudgetOverview />
      </div>
    ),
    artifacts: (
      <div data-featcmp="FEATCMP-BUDGET-RESULT" data-featcmp-slot="artifacts">
        <ArtifactActions actions={BUDGET_ARTIFACTS} />
      </div>
    ),
    forward: (
      <div data-featcmp="FEATCMP-BUDGET-RESULT" data-featcmp-slot="forward">
        <ForwardGroup links={BUDGET_FORWARD} projectId={projectId} />
      </div>
    ),
  };
}
