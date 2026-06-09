declare module "pdf-parse/lib/pdf-parse.js" {
  type PdfParseResult = {
    numpages?: number;
    numrender?: number;
    info?: Record<string, unknown> | null;
    metadata?: unknown;
    text?: string;
    version?: string | null;
  };

  function pdfParse(dataBuffer: Buffer): Promise<PdfParseResult>;
  export default pdfParse;
}
