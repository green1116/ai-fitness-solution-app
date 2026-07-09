/**
 * Tender download sanity verification — PDF/ZIP magic bytes + route contracts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  assertPdfBytes,
  assertZipBytes,
  BinaryArtifactError,
  buildContentDispositionAttachment,
  isPdfBytes,
  isZipBytes,
  looksLikeHtmlOrJson,
} from "../lib/http/binaryArtifact";
import { createDevZipProjectBundle } from "../lib/pdf/devFallback";
import { buildTenderDocumentContext, computeTenderPackReqsig } from "../lib/pdf/tenderDocumentContext";
import {
  buildTenderPdfFilename,
  renderTenderPackPdfBuffer,
  renderTenderZipBuffer,
  type TenderExportContext,
} from "../lib/pdf/tenderExportBundle";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function verifyBinaryValidators() {
  const pdf = Buffer.from("%PDF-1.7\n%âãÏÓ\n1 0 obj");
  const zip = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00]);
  const json = Buffer.from('{"ok":false,"message":"error"}');
  const html = Buffer.from("<!doctype html><html></html>");

  assert(isPdfBytes(pdf), "pdf magic");
  assert(isZipBytes(zip), "zip magic");
  assert(looksLikeHtmlOrJson(json), "json detect");
  assert(looksLikeHtmlOrJson(html), "html detect");

  assertPdfBytes(pdf, "test.pdf");

  let rejected = false;
  try {
    assertPdfBytes(json, "bad.pdf");
  } catch (e) {
    rejected = e instanceof BinaryArtifactError;
  }
  assert(rejected, "reject json as pdf");

  assertZipBytes(zip, "test.zip");
  console.log("✓ binary validators");
}

function verifyRouteContracts() {
  const packPath = join(process.cwd(), "app/api/pdf/tender/pack/route.ts");
  const zipPath = join(process.cwd(), "app/api/pdf/tender/zip/route.ts");
  const packSrc = readFileSync(packPath, "utf8");
  const zipSrc = readFileSync(zipPath, "utf8");

  assert(packSrc.includes("application/pdf"), "pack content-type pdf");
  assert(packSrc.includes("pdfBinaryResponse"), "pack uses pdfBinaryResponse");
  assert(packSrc.includes("searchParams.get(\"projectId\")"), "pack GET projectId");

  assert(zipSrc.includes("application/zip"), "zip content-type");
  assert(zipSrc.includes("zipBinaryArtifactResponse"), "zip validated response");
  assert(zipSrc.includes("searchParams.get(\"projectId\")"), "zip GET projectId");

  const tenderService = readFileSync(
    join(process.cwd(), "lib/services/tender.service.ts"),
    "utf8",
  );
  assert(tenderService.includes("/api/pdf/tender/pack"), "tender service pack url");
  console.log("✓ route contracts");
}

function verifyContentDispositionAscii() {
  const header = buildContentDispositionAttachment("星河科技园-tender.pdf");
  assert(header.includes('filename="'), "ascii filename part");
  assert(header.includes("filename*=UTF-8''"), "utf8 filename star");
  new Response(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]), {
    headers: { "Content-Disposition": header },
  });
  console.log("✓ content-disposition ascii-safe");
}

async function verifyRenderedArtifacts() {
  const bundle = createDevZipProjectBundle("proj-tender-download");
  const project = bundle as unknown as TenderExportContext["project"];
  const budget = project.budgets[0]!;

  const tenderDocument = buildTenderDocumentContext({
    projectId: project.id,
    planId: project.id,
    tier: "enterprise",
  });
  const packReqsig = await computeTenderPackReqsig(tenderDocument, {
    budgetLevel: project.budgetLevel,
  });

  const ctx: TenderExportContext = {
    project,
    budget,
    renderTier: "enterprise",
    planIdForEnt: project.id,
    docCtx: { ...tenderDocument, reqsig: packReqsig },
    dataSource: "dev-fallback",
  };

  const pdf = await renderTenderPackPdfBuffer(ctx);
  assert(pdf.length > 500, "tender pdf size");
  assertPdfBytes(pdf, buildTenderPdfFilename(project, project.id));

  const zip = await renderTenderZipBuffer(ctx);
  assert(zip.length > 500, "tender zip size");
  assertZipBytes(zip, "enterprise-package.zip");

  console.log("✓ rendered tender pdf/zip bytes");
}

async function main() {
  console.log("Tender Download Sanity Verification\n");
  verifyBinaryValidators();
  verifyRouteContracts();
  verifyContentDispositionAscii();
  await verifyRenderedArtifacts();
  console.log("\nPASS — tender download sanity (magic bytes + route contracts)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
