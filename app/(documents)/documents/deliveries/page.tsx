import { DocumentFilteredList } from "@/components/documents/DocumentPages";

export default function DeliveriesPage() {
  return (
    <DocumentFilteredList
      title="Delivery Center"
      latestOnly={false}
      emptyTitle="还没有交付记录"
      emptyDescription="Quote、Tender 或 Export 生成后，将在此统一展示版本与下载入口。"
      emptyActionLabel="返回概览"
      emptyActionHref="/documents"
    />
  );
}
