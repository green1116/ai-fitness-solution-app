import { getDocumentsComposition } from "@/components/features/DocumentsFeature";
import { LayoutHost } from "@/components/layout-host/LayoutHost";
import type { DocumentCategoryId } from "@/lib/frontend/navigation";

type DocumentsScreenProps = Readonly<{
  projectId?: string;
  category?: DocumentCategoryId | "";
}>;

/**
 * SCRCMP-DOCUMENTS — SCR-08.
 * Composes FEATCMP-DOCUMENTS into LAYCMP-LIBRARY.
 */
export function DocumentsScreen({
  projectId = "",
  category = "",
}: DocumentsScreenProps) {
  const library = getDocumentsComposition({ projectId, category });

  return (
    <section
      data-scrcmp="SCRCMP-DOCUMENTS"
      data-screen="SCR-08"
      data-page="PG-DOCUMENTS"
      data-layout="LAY-LIBRARY"
    >
      <LayoutHost
        screenId="SCR-08"
        categories={library.categories}
        items={library.items}
        artifacts={library.artifacts}
        forward={library.forward}
      />
    </section>
  );
}
