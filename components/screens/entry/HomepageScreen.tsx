import { ContinuityFeature } from "@/components/features/ContinuityFeature";
import { AccessFeature } from "@/components/features/AccessFeature";
import { GoalEntryFeature } from "@/components/features/GoalEntryFeature";
import { LayoutHost } from "@/components/layout-host/LayoutHost";

/**
 * SCRCMP-HOME — SCR-01 Homepage.
 * Composes FEATCMP-ACCESS + GOAL-ENTRY + CONTINUITY into LAYCMP-ENTRY.
 */
export function HomepageScreen() {
  return (
    <section
      data-scrcmp="SCRCMP-HOME"
      data-screen="SCR-01"
      data-page="PG-HOME"
      data-layout="LAY-ENTRY"
    >
      <LayoutHost
        screenId="SCR-01"
        access={<AccessFeature />}
        goals={<GoalEntryFeature />}
        continuity={<ContinuityFeature />}
      />
    </section>
  );
}
