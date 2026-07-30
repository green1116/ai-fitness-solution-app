import { DocumentsScreen } from "@/components/screens/library/DocumentsScreen";
import {
  DOCUMENT_CATEGORY_IDS,
  type DocumentCategoryId,
} from "@/lib/frontend/navigation";

type DocumentsPageProps = Readonly<{
  searchParams: Promise<{
    projectId?: string | string[];
    category?: string | string[];
  }>;
}>;

function readParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }
  return value?.trim() ?? "";
}

function readCategory(value: string | string[] | undefined): DocumentCategoryId | "" {
  const raw = readParam(value).toLowerCase();
  if ((DOCUMENT_CATEGORY_IDS as readonly string[]).includes(raw)) {
    return raw as DocumentCategoryId;
  }
  return "";
}

/**
 * PG-DOCUMENTS → SCR-08 My Documents (PD-4.2 RT-DOCUMENTS).
 * Forwards opaque `projectId` / `category` cues only.
 */
export default async function DocumentsPage({
  searchParams,
}: DocumentsPageProps) {
  const params = await searchParams;
  return (
    <DocumentsScreen
      projectId={readParam(params.projectId)}
      category={readCategory(params.category)}
    />
  );
}
