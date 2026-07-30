import { LayoutHost } from "@/components/layout-host/LayoutHost";
import { ForwardPrimary } from "@/components/screens/entry/ForwardPrimary";
import { GuidePanel } from "@/components/screens/entry/GuidePanel";
import { ProcessStatus } from "@/components/screens/entry/ProcessStatus";
import { TenderUpload } from "@/components/screens/entry/TenderUpload";

/**
 * SCRCMP-TENDER — SCR-03 Tender Intelligence Entry (LAY-INTAKE).
 */
export function TenderEntryScreen() {
  return (
    <section data-screen="SCR-03" data-page="PG-TENDER" data-layout="LAY-INTAKE">
      <LayoutHost
        screenId="SCR-03"
        guide={
          <GuidePanel
            title="Start tender workflow"
            description="Upload a tender source, observe processing status, then proceed to requirement review."
          />
        }
        capture={
          <div className="flex flex-col gap-8">
            <TenderUpload />
            <ProcessStatus />
          </div>
        }
        forward={
          <ForwardPrimary
            label="Proceed to AI Workspace"
            href="/workspace"
            actionId="ACT-03-03"
          />
        }
      />
    </section>
  );
}
