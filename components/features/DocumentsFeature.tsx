import type { ReactNode } from "react";

import { ArtifactActions } from "@/components/screens/result/ArtifactActions";
import { ForwardGroup } from "@/components/screens/result/ForwardGroup";
import { DocCategories } from "@/components/screens/library/DocCategories";
import { DocItems } from "@/components/screens/library/DocItems";
import type { DocumentCategoryId } from "@/lib/frontend/navigation";

type LibrarySlots = Readonly<{
  categories: ReactNode;
  items: ReactNode;
  artifacts: ReactNode;
  forward: ReactNode;
}>;

const DOCUMENT_ARTIFACTS = [
  {
    id: "preview",
    label: "Preview document",
    actionId: "ACT-08-02",
    intId: "INT-ARTIFACT-PREVIEW" as const,
  },
  {
    id: "download",
    label: "Download document",
    actionId: "ACT-08-03",
    intId: "INT-ARTIFACT-DOWNLOAD" as const,
  },
  {
    id: "share",
    label: "Share document",
    actionId: "ACT-08-04",
    intId: "INT-ARTIFACT-SHARE" as const,
  },
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

/** FEATCMP-DOCUMENTS — CATEGORIES + ITEM + ARTIFACT + FORWARD */
export function getDocumentsComposition(input?: {
  projectId?: string;
  category?: DocumentCategoryId | "";
}): LibrarySlots {
  const projectId = input?.projectId ?? "";
  const category = input?.category ?? "";

  return {
    categories: (
      <div data-featcmp="FEATCMP-DOCUMENTS" data-featcmp-slot="categories">
        <DocCategories projectId={projectId} activeCategory={category} />
      </div>
    ),
    items: (
      <div data-featcmp="FEATCMP-DOCUMENTS" data-featcmp-slot="items">
        <DocItems category={category} />
      </div>
    ),
    artifacts: (
      <div data-featcmp="FEATCMP-DOCUMENTS" data-featcmp-slot="artifacts">
        <ArtifactActions actions={DOCUMENT_ARTIFACTS} />
      </div>
    ),
    forward: (
      <div data-featcmp="FEATCMP-DOCUMENTS" data-featcmp-slot="forward">
        <ForwardGroup links={DOCUMENT_FORWARD} projectId={projectId} />
      </div>
    ),
  };
}
