const STOP = new Set([
  "的",
  "和",
  "与",
  "或",
  "及",
  "等",
  "要求",
  "应当",
  "必须",
  "提供",
  "具备",
  "投标人",
  "供应商",
]);

/**
 * 确定性分词（中英文 + 二元组）
 */
export function tokenizeTerms(text: string): string[] {
  const normalized = text
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9.%≥≤]/g, " ")
    .toLowerCase();
  const tokens: string[] = [];
  const zh = normalized.match(/[\u4e00-\u9fa5]{2,}/g) || [];
  for (const z of zh) {
    if (z.length >= 2 && !STOP.has(z)) tokens.push(z);
    if (z.length >= 4) {
      for (let i = 0; i <= z.length - 2; i += 2) {
        const bi = z.slice(i, i + 2);
        if (!STOP.has(bi)) tokens.push(bi);
      }
    }
  }
  const en = normalized.match(/[a-z0-9]{2,}/gi) || [];
  tokens.push(...en.map((t) => t.toLowerCase()));
  return [...new Set(tokens)];
}
