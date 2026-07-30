import { getBudgetResultComposition } from "@/components/features/BudgetResultFeature";
import { LayoutHost } from "@/components/layout-host/LayoutHost";

type BudgetResultScreenProps = Readonly<{
  projectId?: string;
}>;

/**
 * SCRCMP-BUDGET — SCR-06.
 * Composes FEATCMP-BUDGET-RESULT into LAYCMP-RESULT.
 */
export function BudgetResultScreen({
  projectId = "",
}: BudgetResultScreenProps) {
  const result = getBudgetResultComposition(projectId);

  return (
    <section
      data-scrcmp="SCRCMP-BUDGET"
      data-screen="SCR-06"
      data-page="PG-BUDGET"
      data-layout="LAY-RESULT"
    >
      <LayoutHost
        screenId="SCR-06"
        summary={result.summary}
        body={result.body}
        artifacts={result.artifacts}
        forward={result.forward}
      />
    </section>
  );
}
