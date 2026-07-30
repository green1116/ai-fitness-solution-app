import { LayoutHost } from "@/components/layout-host/LayoutHost";
import { ForwardPrimary } from "@/components/screens/entry/ForwardPrimary";
import { GuidePanel } from "@/components/screens/entry/GuidePanel";
import { PlanningInputs } from "@/components/screens/entry/PlanningInputs";

/**
 * SCRCMP-BUILDER — SCR-02 Enterprise Builder Entry (LAY-INTAKE).
 */
export function BuilderEntryScreen() {
  return (
    <section
      data-screen="SCR-02"
      data-page="PG-BUILDER"
      data-layout="LAY-INTAKE"
    >
      <LayoutHost
        screenId="SCR-02"
        guide={
          <GuidePanel
            title="Start enterprise fitness planning"
            description="Provide planning inputs, then continue to the AI Workspace."
            actionId="ACT-02-01"
          />
        }
        capture={<PlanningInputs />}
        forward={
          <ForwardPrimary
            label="Continue to AI Workspace"
            href="/workspace"
            actionId="ACT-02-03"
          />
        }
      />
    </section>
  );
}
