/**
 * Binary artifact validation for PDF/ZIP downloads.
 */

export class BinaryArtifactError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = "BinaryArtifactError";
  }
}

export function isPdfBytes(buf: Uint8Array | Buffer): boolean {
  return (
    buf.length >= 5 &&
    buf[0] === 0x25 &&
    buf[1] === 0x50 &&
    buf[2] === 0x44 &&
    buf[3] === 0x46 &&
    buf[4] === 0x2d
  );
}

export function isZipBytes(buf: Uint8Array | Buffer): boolean {
  return (
    buf.length >= 4 &&
    buf[0] === 0x50 &&
    buf[1] === 0x4b &&
    (buf[2] === 0x03 || buf[2] === 0x05 || buf[2] === 0x07) &&
    (buf[3] === 0x04 || buf[3] === 0x06 || buf[3] === 0x08)
  );
}

export function looksLikeHtmlOrJson(buf: Uint8Array | Buffer): boolean {
  const head = Buffer.from(buf.subarray(0, Math.min(buf.length, 64)))
    .toString("utf8")
    .trimStart()
    .toLowerCase();
  return (
    head.startsWith("<!doctype") ||
    head.startsWith("<html") ||
    head.startsWith("{") ||
    head.startsWith("[") ||
    head.startsWith('{"') ||
    head.includes('"ok":')
  );
}

export function assertPdfBytes(buf: Buffer, label = "PDF"): void {
  if (!buf.length) {
    throw new BinaryArtifactError(`${label} 文件为空`, "PDF_EMPTY");
  }
  if (looksLikeHtmlOrJson(buf)) {
    throw new BinaryArtifactError(
      `${label} 响应为 HTML/JSON 错误页，不是有效 PDF`,
      "PDF_NOT_BINARY",
    );
  }
  if (!isPdfBytes(buf)) {
    throw new BinaryArtifactError(`${label} 魔数无效（必须以 %PDF 开头）`, "PDF_INVALID_MAGIC");
  }
}

export function assertZipBytes(buf: Buffer, label = "ZIP"): void {
  if (!buf.length) {
    throw new BinaryArtifactError(`${label} 文件为空`, "ZIP_EMPTY");
  }
  if (looksLikeHtmlOrJson(buf)) {
    throw new BinaryArtifactError(
      `${label} 响应为 HTML/JSON 错误页，不是有效 ZIP`,
      "ZIP_NOT_BINARY",
    );
  }
  if (!isZipBytes(buf)) {
    throw new BinaryArtifactError(`${label} 魔数无效（必须以 PK 开头）`, "ZIP_INVALID_MAGIC");
  }
}

/** HTTP headers must be ByteString (Latin-1). Use ASCII fallback + RFC 5987 filename*. */
export function buildContentDispositionAttachment(fileName: string): string {
  const trimmed = (fileName || "download").replace(/[\u0000-\u001F\u007F]/g, "").trim();
  const ascii =
    trimmed
      .replace(/[^\x20-\x7E]/g, "_")
      .replace(/["\\]/g, "_")
      .replace(/\s+/g, "_")
      .slice(0, 120) || "download.bin";
  const encoded = encodeURIComponent(trimmed || ascii);
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

export function pdfBinaryResponse(
  pdfBuffer: Buffer,
  fileName: string,
): Response {
  assertPdfBytes(pdfBuffer, fileName);
  const body = new Uint8Array(pdfBuffer);
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": buildContentDispositionAttachment(fileName),
      "Content-Length": String(body.byteLength),
      "Cache-Control": "no-store",
    },
  });
}

export function zipBinaryResponse(
  zipBuffer: Buffer,
  fileName: string,
): Response {
  assertZipBytes(zipBuffer, fileName);
  const body = new Uint8Array(zipBuffer);
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": buildContentDispositionAttachment(fileName),
      "Content-Length": String(body.byteLength),
      "Cache-Control": "no-store",
    },
  });
}
