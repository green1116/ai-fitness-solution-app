/**
 * Normalize binary inputs for pdf-lib (Buffer → Uint8Array copy).
 * Avoids pooled Buffer views and non-byte types reaching embed/load/save.
 */

export function toPdfLibBytes(input: Buffer | Uint8Array | ArrayBuffer): Uint8Array {
  if (input instanceof ArrayBuffer) {
    return new Uint8Array(input);
  }
  if (input instanceof Uint8Array) {
    return Uint8Array.from(input);
  }
  return Uint8Array.from(input);
}

export function assertPdfMagic(bytes: Uint8Array, label: string): void {
  if (!bytes.length) {
    throw new Error(`${label} PDF is empty`);
  }
  const head = new TextDecoder().decode(bytes.subarray(0, Math.min(bytes.length, 16)));
  if (head.startsWith("{") || head.startsWith("[") || head.trimStart().startsWith("<")) {
    throw new Error(`${label} is HTML/JSON, not PDF bytes`);
  }
  if (
    bytes.length < 5 ||
    bytes[0] !== 0x25 ||
    bytes[1] !== 0x50 ||
    bytes[2] !== 0x44 ||
    bytes[3] !== 0x46
  ) {
    throw new Error(`${label} missing %PDF magic bytes`);
  }
}

export function toNodePdfBuffer(saved: Uint8Array): Buffer {
  return Buffer.from(saved);
}
