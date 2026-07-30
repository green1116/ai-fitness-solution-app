import { LayoutHost } from "@/components/layout-host/LayoutHost";
import { ArtifactActions } from "@/components/screens/result/ArtifactActions";
import { BudgetOverview } from "@/components/screens/result/BudgetOverview";
import { ForwardGroup } from "@/components/screens/result/ForwardGroup";
import { ResultSummary } from "@/components/screens/result/ResultSummary";

type BudgetResultScreenProps = Readonly<{
  projectId?: string;
}>;

const BUDGET_ARTIFACTS = [
  { id: "download", label: "Download budget", actionId: "ACT-06-02" },
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

/**
 * SCRCMP-BUDGET — SCR-06 Budget Result (LAY-RESULT).
 */
export function BudgetResultScreen({
  projectId = "",
}: BudgetResultScreenProps) {
  return (
    <section
      data-screen="SCR-06"
      data-page="PG-BUDGET"
      data-layout="LAY-RESULT"
    >
      <LayoutHost
        screenId="SCR-06"
        summary={
          <ResultSummary
            title="Budget result"
            description="Review the investment estimate, category breakdown, and available options."
            actionIds={["ACT-06-01"]}
          />
        }
        body={<BudgetOverview />}
        artifacts={<ArtifactActions actions={BUDGET_ARTIFACTS} />}
        forward={<ForwardGroup links={BUDGET_FORWARD} projectId={projectId} />}
      />
    </section>
  );
}
