import type { VercelRequest, VercelResponse } from "@vercel/node";
import { objectifsSchema } from "../shared/domain";
import { storage } from "../server/composition";
import { isAuthorized } from "../server/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const objectifs = await storage.getObjectifs();
    res.status(200).json(objectifs);
    return;
  }

  if (req.method === "PUT") {
    if (!isAuthorized(req.headers["x-settings-password"] as string | undefined)) {
      res.status(401).json({ error: "Non autorisé" });
      return;
    }
    const parsed = objectifsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    await storage.setObjectifs(parsed.data);
    res.status(200).json(parsed.data);
    return;
  }

  res.status(405).json({ error: "Méthode non supportée" });
}
