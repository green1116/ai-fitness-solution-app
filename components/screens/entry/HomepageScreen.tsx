import { LayoutHost } from "@/components/layout-host/LayoutHost";
import { AccessControls } from "@/components/screens/entry/AccessControls";
import { ContinuityLink } from "@/components/screens/entry/ContinuityLink";
import { GoalCards } from "@/components/screens/entry/GoalCards";

/**
 * SCRCMP-HOME — SCR-01 Homepage (LAY-ENTRY).
 * Reuses FE-1 LayoutHost; presentation composition only.
 */
export function HomepageScreen() {
  return (
    <section data-screen="SCR-01" data-page="PG-HOME" data-layout="LAY-ENTRY">
      <LayoutHost
        screenId="SCR-01"
        access={<AccessControls />}
        goals={<GoalCards />}
        continuity={<ContinuityLink />}
      />
    </section>
  );
}
