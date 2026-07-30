import { LayoutHost } from "@/components/layout-host/LayoutHost";
import { ArtifactActions } from "@/components/screens/result/ArtifactActions";
import { ForwardGroup } from "@/components/screens/result/ForwardGroup";
import { DocCategories } from "@/components/screens/library/DocCategories";
import { DocItems } from "@/components/screens/library/DocItems";
import type { DocumentCategoryId } from "@/lib/frontend/navigation";

type DocumentsScreenProps = Readonly<{
  projectId?: string;
  category?: DocumentCategoryId | "";
}>;

const DOCUMENT_ARTIFACTS = [
  { id: "preview", label: "Preview document", actionId: "ACT-08-02" },
  { id: "download", label: "Download document", actionId: "ACT-08-03" },
  { id: "share", label: "Share document", actionId: "ACT-08-04" },
] as const;

const DOCUMENT_FORWARD = [
  {
    id: "FWD-PROJECTS",
    label: "Return to My Projects",
    href: "/projects" as const,
    actionId: "ACT-08-05",
  },
  {
    id: "FWD-WORKSPACE",
    label: "Return to AI Workspace",
    href: "/workspace" as const,
    actionId: "ACT-08-06",
  },
] as const;

/**
 * SCRCMP-DOCUMENTS — SCR-08 My Documents (LAY-LIBRARY).
 */
export function DocumentsScreen({
  projectId = "",
  category = "",
}: DocumentsScreenProps) {
  return (
    <section
      data-screen="SCR-08"
      data-page="PG-DOCUMENTS"
      data-layout="LAY-LIBRARY"
    >
      <LayoutHost
        screenId="SCR-08"
        categories={
          <DocCategories projectId={projectId} activeCategory={category} />
        }
        items={<DocItems category={category} />}
        artifacts={<ArtifactActions actions={DOCUMENT_ARTIFACTS} />}
        forward={<ForwardGroup links={DOCUMENT_FORWARD} projectId={projectId} />}
      />
    </section>
  );
}
