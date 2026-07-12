import type { VercelRequest, VercelResponse } from "@vercel/node";
import { authSchema } from "../../shared/domain";
import { isAuthorized } from "../../server/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Méthode non supportée" });
    return;
  }
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ ok: false });
    return;
  }
  res.status(200).json({ ok: isAuthorized(parsed.data.password) });
}
