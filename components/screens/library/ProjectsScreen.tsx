import { ProjectsFeature } from "@/components/features/ProjectsFeature";
import { LayoutHost } from "@/components/layout-host/LayoutHost";

/**
 * SCRCMP-PROJECTS — SCR-07.
 * Composes FEATCMP-PROJECTS into LAYCMP-LIST.
 */
export function ProjectsScreen() {
  return (
    <section
      data-scrcmp="SCRCMP-PROJECTS"
      data-screen="SCR-07"
      data-page="PG-PROJECTS"
      data-layout="LAY-LIST"
    >
      <LayoutHost screenId="SCR-07" list={<ProjectsFeature />} />
    </section>
  );
}
