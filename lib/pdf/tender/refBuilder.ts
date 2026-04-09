function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function buildTechnicalResponseRefs<T extends Record<string, unknown>>(rows: T[]) {
  return (rows || []).map((row, idx) => ({
    ...row,
    refId: `T-${pad2(idx + 1)}`,
  }));
}

export function buildBusinessResponseRefs<T extends Record<string, unknown>>(rows: T[]) {
  return (rows || []).map((row, idx) => ({
    ...row,
    refId: `B-${pad2(idx + 1)}`,
  }));
}

export function buildScoreRefs<T extends Record<string, unknown>>(rows: T[]) {
  return (rows || []).map((row, idx) => ({
    ...row,
    scoreId: `S-${pad2(idx + 1)}`,
  }));
}

export function isDeviationLikeStatus(status?: string) {
  const s = String(status || "").trim();
  return s === "待确认" || s === "部分满足" || s === "偏离" || s === "无此项";
}

