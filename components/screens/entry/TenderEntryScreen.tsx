import { getTenderIntakeComposition } from "@/components/features/TenderIntakeFeature";
import { LayoutHost } from "@/components/layout-host/LayoutHost";

/**
 * SCRCMP-TENDER — SCR-03.
 * Composes FEATCMP-TENDER-INTAKE into LAYCMP-INTAKE.
 */
export function TenderEntryScreen() {
  const intake = getTenderIntakeComposition();

  return (
    <section
      data-scrcmp="SCRCMP-TENDER"
      data-screen="SCR-03"
      data-page="PG-TENDER"
      data-layout="LAY-INTAKE"
    >
      <LayoutHost
        screenId="SCR-03"
        guide={intake.guide}
        capture={intake.capture}
        forward={intake.forward}
      />
    </section>
  );
}
