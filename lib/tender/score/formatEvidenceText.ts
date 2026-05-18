export function formatEvidenceText(
  evidence?: Array<{ ref: string; source?: string }>
) {
  if (!evidence?.length) return "";

  const sourceLabelMap: Record<string, string> = {
    note: "说明",
    risk: "风险",
    response: "响应",
    attachment: "附件",
  };

  return evidence
    .map((e) =>
      e.source ? `${e.ref}（${sourceLabelMap[e.source] || e.source}）` : e.ref
    )
    .join("、");
}
