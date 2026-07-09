/**
 * Client-side binary download helpers with magic-byte validation.
 */

export class DownloadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DownloadValidationError";
  }
}

function isPdfBytes(buf: Uint8Array): boolean {
  return (
    buf.length >= 5 &&
    buf[0] === 0x25 &&
    buf[1] === 0x50 &&
    buf[2] === 0x44 &&
    buf[3] === 0x46 &&
    buf[4] === 0x2d
  );
}

function isZipBytes(buf: Uint8Array): boolean {
  return (
    buf.length >= 4 &&
    buf[0] === 0x50 &&
    buf[1] === 0x4b &&
    (buf[2] === 0x03 || buf[2] === 0x05 || buf[2] === 0x07)
  );
}

function looksLikeHtmlOrJson(buf: Uint8Array): boolean {
  const head = new TextDecoder().decode(buf.subarray(0, Math.min(buf.length, 64))).trimStart();
  return head.startsWith("<") || head.startsWith("{") || head.startsWith("[");
}

export function assertDownloadBytes(
  bytes: Uint8Array,
  kind: "pdf" | "zip",
): void {
  if (!bytes.length) {
    throw new DownloadValidationError("下载文件为空，请重试生成");
  }
  if (looksLikeHtmlOrJson(bytes)) {
    throw new DownloadValidationError("下载失败：服务器返回了错误页面而非文件");
  }
  if (kind === "pdf" && !isPdfBytes(bytes)) {
    throw new DownloadValidationError("下载失败：文件不是有效的 PDF（缺少 %PDF 头）");
  }
  if (kind === "zip" && !isZipBytes(bytes)) {
    throw new DownloadValidationError("下载失败：文件不是有效的 ZIP 包");
  }
}

export async function parseDownloadError(res: Response): Promise<string> {
  let message = `Download failed (${res.status})`;
  try {
    const json = (await res.json()) as { message?: string; error?: string; code?: string };
    message = json.message || json.error || json.code || message;
  } catch {
    const text = await res.text();
    if (text) message = text.slice(0, 300);
  }
  return message;
}

export function triggerBrowserDownload(bytes: Uint8Array, fileName: string, mime: string): void {
  const blob = new Blob([bytes], { type: mime });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

export async function fetchBinaryArtifact(
  url: string,
  init: RequestInit,
  kind: "pdf" | "zip",
): Promise<{ bytes: Uint8Array; fileName: string }> {
  const res = await fetch(url, { credentials: "include", ...init });
  if (!res.ok) {
    throw new Error(await parseDownloadError(res));
  }

  const contentType = (res.headers.get("content-type") || "").toLowerCase();
  if (kind === "pdf" && !contentType.includes("application/pdf")) {
    throw new DownloadValidationError("服务器未返回 PDF 内容类型");
  }
  if (kind === "zip" && !contentType.includes("application/zip")) {
    throw new DownloadValidationError("服务器未返回 ZIP 内容类型");
  }

  const bytes = new Uint8Array(await res.arrayBuffer());
  assertDownloadBytes(bytes, kind);

  const disposition = res.headers.get("content-disposition") || "";
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const fileName = match?.[1] || (kind === "pdf" ? "tender.pdf" : "enterprise-package.zip");

  return { bytes, fileName };
}
