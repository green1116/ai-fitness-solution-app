import { handlePdfGateway } from "../api/handlers";
import { withHandler } from "../api/handler.util";

export async function GET(req: Request) {
  return withHandler("/api/v80/pdf", handlePdfGateway, req);
}
