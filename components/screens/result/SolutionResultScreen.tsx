import { getSolutionResultComposition } from "@/components/features/SolutionResultFeature";
import { LayoutHost } from "@/components/layout-host/LayoutHost";

type SolutionResultScreenProps = Readonly<{
  projectId?: string;
}>;

/**
 * SCRCMP-SOLUTION — SCR-05.
 * Composes FEATCMP-SOLUTION-RESULT into LAYCMP-RESULT.
 */
export function SolutionResultScreen({
  projectId = "",
}: SolutionResultScreenProps) {
  const result = getSolutionResultComposition(projectId);

  return (
    <section
      data-scrcmp="SCRCMP-SOLUTION"
      data-screen="SCR-05"
      data-page="PG-SOLUTION"
      data-layout="LAY-RESULT"
    >
      <LayoutHost
        screenId="SCR-05"
        summary={result.summary}
        body={result.body}
        artifacts={result.artifacts}
        forward={result.forward}
      />
    </section>
  );
}
