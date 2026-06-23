import { DocumentFilteredList } from "@/components/documents/DocumentPages";

export default function QuoteDocumentsPage() {
  return (
    <DocumentFilteredList
      title="Quote Documents"
      artifactFilter="quote_pdf"
      emptyTitle="还没有 Quote 交付物"
      emptyDescription="生成 Quote 后，可在此查看 PDF 交付与版本历史。"
      emptyActionLabel="生成 Quote"
      emptyActionHref="/quote"
    />
  );
}
