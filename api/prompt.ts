import type { VercelRequest, VercelResponse } from '@vercel/node';
import { promptSchema } from '../shared/domain.js';
import { storage } from '../server/composition.js';
import { isAuthorized } from '../server/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isAuthorized(req.headers['x-settings-password'] as string | undefined)) {
    res.status(401).json({ error: 'Non autorisé' });
    return;
  }

  if (req.method === 'GET') {
    const prompt = await storage.getPrompt();
    res.status(200).json({ prompt });
    return;
  }

  if (req.method === 'PUT') {
    const parsed = promptSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    await storage.setPrompt(parsed.data.prompt);
    res.status(200).json({ prompt: parsed.data.prompt });
    return;
  }

  res.status(405).json({ error: 'Méthode non supportée' });
}
