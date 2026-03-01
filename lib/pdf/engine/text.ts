// lib/pdf/engine/text.ts
import type { PDFFont } from "pdf-lib";

type WrapOpts = {
  font: PDFFont;
  fontSize: number;
  maxWidth: number;
  maxLines: number;
};

function isBreakChar(ch: string) {
  // 空格 + 常见标点作为"优先断行点"
  const code = ch.charCodeAt(0);
  // 中文标点范围 + 英文标点
  if (ch === " " || ch === "\t") return true;
  if ("，。；：、！？）】》".indexOf(ch) >= 0) return true;
  if ("（【《".indexOf(ch) >= 0) return true;
  if ("!?)]}>".indexOf(ch) >= 0) return true;
  if ("([{<".indexOf(ch) >= 0) return true;
  // 引号类
  if (code === 0x201C || code === 0x201D) return true; // ""
  if (code === 0x2018 || code === 0x2019) return true; // ''
  if (ch === '"' || ch === "'") return true;
  return false;
}

// ✅ 中文/混排安全换行：优先按断点，其次才逐字
export function wrapTextCN(text: string, opts: WrapOpts): string[] {
  const { font, fontSize, maxWidth, maxLines } = opts;
  const s = String(text ?? "").replace(/\r\n/g, "\n");
  if (!s) return [""];

  // 先按显式换行分段
  const paras = s.split("\n");
  const out: string[] = [];

  for (const para of paras) {
    const chars = [...para];
    let line = "";
    let lastBreakPos = -1; // line 内最近一个可断点位置（字符索引）

    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      const next = line + ch;

      if (isBreakChar(ch)) {
        lastBreakPos = line.length; // 记录断点（断在这个字符后）
      }

      if (font.widthOfTextAtSize(next, fontSize) <= maxWidth) {
        line = next;
        continue;
      }

      // 超宽：优先在 lastBreakPos 处断开
      if (lastBreakPos >= 1) {
        const left = line.slice(0, lastBreakPos + 1).trimEnd();
        const rest = (line.slice(lastBreakPos + 1) + ch).trimStart();
        if (left) out.push(left);
        line = rest;
      } else {
        // 没有断点：退化为逐字断（但尽量避免单字行）
        if (line) out.push(line);
        line = ch;
      }

      lastBreakPos = -1;

      if (out.length >= maxLines) break;
    }

    if (out.length >= maxLines) break;
    if (line) out.push(line);
  }

  // ✅ 回收"单字行"：如果某行只有1个字，尽量从上一行挪一个字过来
  for (let i = 1; i < out.length; i++) {
    if (out[i].length === 1 && out[i - 1].length >= 2) {
      const prev = out[i - 1];
      out[i - 1] = prev.slice(0, -1);
      out[i] = prev.slice(-1) + out[i];
    }
  }

  // ✅ 超行：最后一行省略号
  if (out.length > maxLines) {
    const kept = out.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last.length > 0 && font.widthOfTextAtSize(last + "…", fontSize) > maxWidth) {
      last = last.slice(0, -1);
    }
    kept[maxLines - 1] = (last ? last : "") + "…";
    return kept;
  }

  return out.length ? out : [""];
}