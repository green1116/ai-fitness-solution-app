import { LayoutHost } from "@/components/layout-host/LayoutHost";
import { ArtifactActions } from "@/components/screens/result/ArtifactActions";
import { ForwardGroup } from "@/components/screens/result/ForwardGroup";
import { ResultBlocks } from "@/components/screens/result/ResultBlocks";
import { ResultSummary } from "@/components/screens/result/ResultSummary";

type SolutionResultScreenProps = Readonly<{
  projectId?: string;
}>;

const SOLUTION_ARTIFACTS = [
  { id: "download", label: "Download solution materials", actionId: "ACT-05-03" },
  { id: "share", label: "Share solution", actionId: "ACT-05-04" },
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

/**
 * SCRCMP-SOLUTION — SCR-05 Solution Result (LAY-RESULT).
 */
export function SolutionResultScreen({
  projectId = "",
}: SolutionResultScreenProps) {
  return (
    <section
      data-screen="SCR-05"
      data-page="PG-SOLUTION"
      data-layout="LAY-RESULT"
    >
      <LayoutHost
        screenId="SCR-05"
        summary={
          <ResultSummary
            title="Solution result"
            description="Review the planning solution, proposal, or package overview for this project."
            actionIds={["ACT-05-01", "ACT-05-02"]}
          />
        }
        body={<ResultBlocks />}
        artifacts={<ArtifactActions actions={SOLUTION_ARTIFACTS} />}
        forward={<ForwardGroup links={SOLUTION_FORWARD} projectId={projectId} />}
      />
    </section>
  );
}
