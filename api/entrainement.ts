import type { VercelRequest, VercelResponse } from "@vercel/node";
import { storage } from "../server/composition.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Méthode non supportée" });
    return;
  }
  const entrainement = await storage.getLastEntrainement();
  res.status(200).json(entrainement);
}
