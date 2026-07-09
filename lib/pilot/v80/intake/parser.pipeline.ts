/**
 * V80 Pilot P1 — Parser pipeline interface (delegates to lib/tender/parser, no duplicate engine)
 */

import {
  parseTenderDocument,
  type ParseTenderInput,
} from "@/lib/tender/parser";
import type { TenderParseResult } from "@/lib/tender/types";

export type { ParseTenderInput, TenderParseResult };

export type TenderParserPipeline = {
  parse(input: ParseTenderInput): Promise<TenderParseResult>;
};

/** Default pipeline — single entry for upload + workflow steps */
export const defaultTenderParserPipeline: TenderParserPipeline = {
  parse: parseTenderDocument,
};

export async function runTenderParserPipeline(
  input: ParseTenderInput,
  pipeline: TenderParserPipeline = defaultTenderParserPipeline,
): Promise<TenderParseResult> {
  return pipeline.parse(input);
}
