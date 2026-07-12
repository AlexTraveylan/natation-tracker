import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage, activityProvider } from '../server/composition.js';

const TTL_MS = 60 * 60 * 1000; // 1h : évite de re-solliciter Strava à chaque chargement de page

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Méthode non supportée' });
    return;
  }

  const cache = await storage.getSwimResultsCache();
  const isFresh = cache !== null && Date.now() - new Date(cache.updatedAt).getTime() < TTL_MS;

  if (isFresh) {
    res.status(200).json(cache.results);
    return;
  }

  try {
    const results = await activityProvider.getSwimResults();
    await storage.setSwimResultsCache({
      results,
      updatedAt: new Date().toISOString(),
    });
    res.status(200).json(results);
  } catch (err) {
    if (cache) {
      // Strava indisponible : on retombe sur le dernier cache connu plutôt que d'échouer.
      res.status(200).json(cache.results);
      return;
    }
    res.status(502).json({
      error: err instanceof Error ? err.message : "Erreur lors de l'appel à Strava",
    });
  }
}
