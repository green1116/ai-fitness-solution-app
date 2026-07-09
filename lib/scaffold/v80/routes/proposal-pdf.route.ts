import { handleProposalPdf } from "../api/handlers";
import { withHandler } from "../api/handler.util";

export async function POST(req: Request) {
  return withHandler("/api/v80/proposal-pdf/render", handleProposalPdf, req);
}
