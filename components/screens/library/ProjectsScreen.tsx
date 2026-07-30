import { LayoutHost } from "@/components/layout-host/LayoutHost";
import { ProjectList } from "@/components/screens/library/ProjectList";

/**
 * SCRCMP-PROJECTS — SCR-07 My Projects (LAY-LIST).
 */
export function ProjectsScreen() {
  return (
    <section
      data-screen="SCR-07"
      data-page="PG-PROJECTS"
      data-layout="LAY-LIST"
    >
      <LayoutHost screenId="SCR-07" list={<ProjectList />} />
    </section>
  );
}
