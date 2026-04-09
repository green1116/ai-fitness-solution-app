export function formatResponseRefs(refIds?: string[]) {
  if (!refIds?.length) return "";
  return refIds.join("、");
}

export function formatScoreRefs(scoreIds?: string[]) {
  if (!scoreIds?.length) return "";
  return scoreIds.join("、");
}

export function withRefPrefix(refId: string | undefined, text: string | undefined) {
  const body = String(text || "").trim() || "-";
  return refId ? `${refId}  ${body}` : body;
}

