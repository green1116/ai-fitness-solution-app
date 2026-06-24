import { DocumentFilteredList } from "@/components/documents/DocumentPages";

export default function BudgetsPage() {
  return (
    <DocumentFilteredList
      title="Budgets"
      artifactFilter="budget_pdf"
      emptyTitle="还没有 Budget 文档"
      emptyDescription="为项目计算预算后，Budget PDF 将同步到交付中心。"
      emptyActionLabel="计算预算"
      emptyActionHref="/budget"
    />
  );
}
