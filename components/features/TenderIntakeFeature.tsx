import type { ReactNode } from "react";

import { ForwardPrimary } from "@/components/screens/entry/ForwardPrimary";
import { GuidePanel } from "@/components/screens/entry/GuidePanel";
import { ProcessStatus } from "@/components/screens/entry/ProcessStatus";
import { TenderUpload } from "@/components/screens/entry/TenderUpload";

type IntakeSlots = Readonly<{
  guide: ReactNode;
  capture: ReactNode;
  forward: ReactNode;
}>;

/** FEATCMP-TENDER-INTAKE — GUIDE + UPLOAD + STATUS + FORWARD-PRIMARY */
export function getTenderIntakeComposition(): IntakeSlots {
  return {
    guide: (
      <div data-featcmp="FEATCMP-TENDER-INTAKE" data-featcmp-slot="guide">
        <GuidePanel
          title="Start tender workflow"
          description="Upload a tender source, observe processing status, then proceed to requirement review."
        />
      </div>
    ),
    capture: (
      <div
        data-featcmp="FEATCMP-TENDER-INTAKE"
        data-featcmp-slot="capture"
        className="flex flex-col gap-8"
      >
        <TenderUpload />
        <ProcessStatus />
      </div>
    ),
    forward: (
      <div data-featcmp="FEATCMP-TENDER-INTAKE" data-featcmp-slot="forward">
        <ForwardPrimary
          label="Proceed to AI Workspace"
          href="/workspace"
          actionId="ACT-03-03"
        />
      </div>
    ),
  };
}
