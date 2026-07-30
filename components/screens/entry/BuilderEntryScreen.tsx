import { getBuilderIntakeComposition } from "@/components/features/BuilderIntakeFeature";
import { LayoutHost } from "@/components/layout-host/LayoutHost";

/**
 * SCRCMP-BUILDER — SCR-02.
 * Composes FEATCMP-BUILDER-INTAKE into LAYCMP-INTAKE.
 */
export function BuilderEntryScreen() {
  const intake = getBuilderIntakeComposition();

  return (
    <section
      data-scrcmp="SCRCMP-BUILDER"
      data-screen="SCR-02"
      data-page="PG-BUILDER"
      data-layout="LAY-INTAKE"
    >
      <LayoutHost
        screenId="SCR-02"
        guide={intake.guide}
        capture={intake.capture}
        forward={intake.forward}
      />
    </section>
  );
}
