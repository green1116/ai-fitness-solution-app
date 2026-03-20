// lib/pdf/tocAnchors.ts
import {
    PDFDocument,
    PDFPage,
    PDFName,
    PDFString,
    PDFNumber,
    PDFArray,
    PDFDict,
  } from "pdf-lib";
  
  export const TOC_ANCHOR_PREFIX = "TOC_ANCHOR:";
  
  function ensureAnnotsArray(doc: PDFDocument, page: PDFPage): PDFArray {
    const annots = page.node.Annots();
    if (annots) return annots as unknown as PDFArray;
    const arr = doc.context.obj([]);
    page.node.set(PDFName.of("Annots"), arr);
    return arr as unknown as PDFArray;
  }
  
  /**
   * 在当前页写一个“不可见”注释作为 anchor。
   * key 建议稳定：PLAN.XXX / BUDGET.XXX
   */
  export function addTocAnchor(doc: PDFDocument, page: PDFPage, key: string) {
    const annots = ensureAnnotsArray(doc, page);
  
    // 1x1 的注释框，放在页角落（几乎不可见）
    const rect = doc.context.obj([
      PDFNumber.of(1),
      PDFNumber.of(1),
      PDFNumber.of(2),
      PDFNumber.of(2),
    ]);
  
    const annot = doc.context.obj({
      Type: PDFName.of("Annot"),
      Subtype: PDFName.of("Link"),
      Rect: rect,
      Border: doc.context.obj([PDFNumber.of(0), PDFNumber.of(0), PDFNumber.of(0)]),
      Contents: PDFString.of(`${TOC_ANCHOR_PREFIX}${key}`),
    }) as PDFDict;
  
    annots.push(annot);
  }
  
  /**
   * 合并后扫描：返回 key -> pageNo(从1开始)
   */
  export function scanTocAnchors(mergedDoc: PDFDocument): Record<string, number> {
    const out: Record<string, number> = {};
    const pages = mergedDoc.getPages();
  
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const annots = page.node.Annots();
      if (!annots) continue;
  
      try {
        const arr = annots as unknown as PDFArray;
        const n = arr.size();
        for (let j = 0; j < n; j++) {
          const refOrObj = arr.get(j);
          const annot = mergedDoc.context.lookup(refOrObj) as PDFDict;
          const contents = annot.get(PDFName.of("Contents"));
          if (!contents) continue;
          const s = mergedDoc.context.lookup(contents) as PDFString;
          const text = s.decodeText ? s.decodeText() : String(s);
          if (!text.startsWith(TOC_ANCHOR_PREFIX)) continue;
          const key = text.slice(TOC_ANCHOR_PREFIX.length).trim();
          if (key) out[key] = i + 1; // 页码从 1 开始
        }
      } catch {
        // ignore
      }
    }
  
    return out;
  }