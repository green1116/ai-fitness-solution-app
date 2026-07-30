import type { ReactNode } from "react";

import { ForwardPrimary } from "@/components/screens/entry/ForwardPrimary";
import { GuidePanel } from "@/components/screens/entry/GuidePanel";
import { PlanningInputs } from "@/components/screens/entry/PlanningInputs";

type IntakeSlots = Readonly<{
  guide: ReactNode;
  capture: ReactNode;
  forward: ReactNode;
}>;

/** FEATCMP-BUILDER-INTAKE — GUIDE + INPUT-PLANNING + FORWARD-PRIMARY */
export function getBuilderIntakeComposition(): IntakeSlots {
  return {
    guide: (
      <div data-featcmp="FEATCMP-BUILDER-INTAKE" data-featcmp-slot="guide">
        <GuidePanel
          title="Start enterprise fitness planning"
          description="Provide planning inputs, then continue to the AI Workspace."
          actionId="ACT-02-01"
        />
      </div>
    ),
    capture: (
      <div data-featcmp="FEATCMP-BUILDER-INTAKE" data-featcmp-slot="capture">
        <PlanningInputs />
      </div>
    ),
    forward: (
      <div data-featcmp="FEATCMP-BUILDER-INTAKE" data-featcmp-slot="forward">
        <ForwardPrimary
          label="Continue to AI Workspace"
          href="/workspace"
          actionId="ACT-02-03"
        />
      </div>
    ),
  };
}
