import { handleIntegrity } from "../api/handlers";
import { withHandler } from "../api/handler.util";

export async function GET(req: Request) {
  return withHandler("/api/v80/production/integrity", handleIntegrity, req);
}
