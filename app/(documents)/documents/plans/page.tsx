import { DocumentFilteredList } from "@/components/documents/DocumentPages";

export default function PlansPage() {
  return (
    <DocumentFilteredList
      title="Plans"
      artifactFilter="plan_pdf"
      latestOnly={false}
      emptyTitle="还没有 Plan 文档"
      emptyDescription="完成方案规划后，Plan PDF 将出现在交付中心。"
      emptyActionLabel="去 Workspace"
      emptyActionHref="/dashboard"
    />
  );
}
