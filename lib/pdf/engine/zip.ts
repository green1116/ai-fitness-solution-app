// lib/pdf/engine/zip.ts
import JSZip from "jszip";

export async function makeZipBytes(files: Array<{ name: string; bytes: Uint8Array | Buffer | string }>) {
  const zip = new JSZip();
  for (const f of files) zip.file(f.name, f.bytes as any);

  const out = await zip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return out;
}