/** pdf-parse 顶层 index 在 module.parent 为空时会同步读 ./test/data/*.pdf，导致 ENOENT */
export type PdfParseResult = {
  text?: string;
  numpages?: number;
  numrender?: number;
  info?: Record<string, unknown> | null;
  metadata?: unknown;
  version?: string | null;
};

export type PdfParseFn = (buffer: Buffer) => Promise<PdfParseResult>;

/**
 * 加载 pdf-parse 核心实现（跳过 index.js 中的 debug harness）。
 * 仅解析调用方传入的 buffer，不读取任何本地测试文件。
 */
export async function loadPdfParse(): Promise<PdfParseFn> {
  const mod = await import("pdf-parse/lib/pdf-parse.js");
  const fn = (
    mod as { default?: PdfParseFn; module?: { exports?: PdfParseFn } }
  ).default ?? (mod as unknown as PdfParseFn);

  if (typeof fn !== "function") {
    throw new Error("pdf-parse core module unavailable");
  }
  return fn;
}
