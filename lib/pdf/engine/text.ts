// lib/pdf/engine/text.ts
import type { PDFFont } from "pdf-lib";

type WrapOpts = {
  font: PDFFont;
  fontSize: number;
  maxWidth: number;
  maxLines: number;
};

/** Strip chars that commonly render as tofu in embedded Noto subsets. */
export function sanitizePdfText(text: string): string {
  return String(text ?? "")
    .normalize("NFKC")
    .replace(/[\uD800-\uDFFF]/g, "")
    .replace(/\uFFFD/g, "")
    .replace(/\uFFFC/g, "")
    .replace(/\u0000/g, "")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[\u2000-\u200A\u202F\u205F\u3000]/g, " ")
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
    .replace(/[\uFE00-\uFE0F]/g, "")
    .replace(/[\uFFF9-\uFFFF]/g, "")
    .replace(/[\u{1F000}-\u{1FAFF}]/gu, "")
    .replace(/[\u{E000}-\u{F8FF}]/gu, "")
    .replace(/\u00AD/g, "")
    .replace(/[\u2018\u2019\u2032\u2035]/g, "'")
    .replace(/[\u201C\u201D\u2033\u2036]/g, '"')
    .replace(/[\u2013\u2014\u2212]/g, "-")
    .replace(/\.{3,}/g, "…")
    .replace(/[\u2022\u25CF\u25E6\u00B7]/g, "·")
    .replace(/([!?])(?=[\u4e00-\u9fff\u3400-\u4dbf])/g, (_, ch) => (ch === "!" ? "！" : "？"))
    .replace(/([\u4e00-\u9fff\u3400-\u4dbf])([!?])/g, (_, cjk, ch) => `${cjk}${ch === "!" ? "！" : "？"}`)
    .replace(/([\u4e00-\u9fff\u3400-\u4dbf]),/g, "$1，")
    .replace(/,([\u4e00-\u9fff\u3400-\u4dbf])/g, "，$1")
    .replace(/([\u4e00-\u9fff\u3400-\u4dbf]);/g, "$1；")
    .replace(/;([\u4e00-\u9fff\u3400-\u4dbf])/g, "；$1")
    .replace(/([\u4e00-\u9fff\u3400-\u4dbf]):/g, "$1：")
    .replace(/:([\u4e00-\u9fff\u3400-\u4dbf])/g, "：$1")
    .replace(/\.(?=[\u4e00-\u9fff\u3400-\u4dbf])/g, "。")
    .replace(/([\u4e00-\u9fff\u3400-\u4dbf])\./g, "$1。")
    .replace(/[^\S\n]+/g, " ")
    .trimEnd();
}

function isLatinAlnum(ch: string): boolean {
  if (!ch) return false;
  const c = ch.charCodeAt(0);
  return (c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a) || (c >= 0x30 && c <= 0x39);
}

function isBreakChar(ch: string) {
  // 空格 + 常见标点作为"优先断行点"
  const code = ch.charCodeAt(0);
  // 中文标点范围 + 英文标点
  if (ch === " " || ch === "\t" || ch === "-") return true;
  if ("，。；：、！？）】》".indexOf(ch) >= 0) return true;
  if ("…·".indexOf(ch) >= 0) return true;
  if ("（【《".indexOf(ch) >= 0) return true;
  if ("!?)]}>".indexOf(ch) >= 0) return true;
  if ("([{<".indexOf(ch) >= 0) return true;
  // 引号类
  if (code === 0x201C || code === 0x201D) return true; // ""
  if (code === 0x2018 || code === 0x2019) return true; // ''
  if (ch === '"' || ch === "'") return true;
  return false;
}

function breakOverflowLine(line: string, ch: string): { head: string; tail: string } {
  if (line) {
    const lastSpace = line.lastIndexOf(" ");
    if (lastSpace > 0) {
      const after = line.slice(lastSpace + 1);
      if ([...after].every(isLatinAlnum) && isLatinAlnum(ch)) {
        return {
          head: line.slice(0, lastSpace),
          tail: `${after}${ch}`,
        };
      }
    }
    return { head: line, tail: ch };
  }
  return { head: "", tail: ch };
}

// ✅ 中文/混排安全换行：优先按断点，英文尽量在词边界断开
export function wrapTextCN(text: string, opts: WrapOpts): string[] {
  const { font, fontSize, maxWidth, maxLines } = opts;
  const s = sanitizePdfText(text).replace(/\r\n/g, "\n");
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
        const broken = breakOverflowLine(line, ch);
        if (broken.head) out.push(broken.head);
        line = broken.tail;
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