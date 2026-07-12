import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'node:crypto';
import type { Entrainement } from '../../shared/domain.js';
import { formatTime } from '../../shared/format.js';
import { storage, llm } from '../../server/composition.js';
import { isAuthorized } from '../../server/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Méthode non supportée' });
    return;
  }
  if (!isAuthorized(req.headers['x-settings-password'] as string | undefined)) {
    res.status(401).json({ error: 'Non autorisé' });
    return;
  }

  const [objectifs, promptTemplate] = await Promise.all([
    storage.getObjectifs(),
    storage.getPrompt(),
  ]);

  const objectifsText =
    objectifs.length > 0
      ? [...objectifs]
          .sort((a, b) => a.distance - b.distance)
          .map((o) => `${o.distance}m : ${formatTime(o.targetTimeSeconds)}`)
          .join('\n')
      : 'Aucun objectif défini.';

  const finalPrompt = promptTemplate.includes('{objectifs}')
    ? promptTemplate.replace('{objectifs}', objectifsText)
    : `${promptTemplate}\n\nObjectifs :\n${objectifsText}`;

  let content: string;
  try {
    content = await llm.generateText(finalPrompt);
  } catch (err) {
    res.status(502).json({
      error: err instanceof Error ? err.message : "Erreur lors de l'appel au LLM",
    });
    return;
  }

  const entrainement: Entrainement = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    content,
    prompt: promptTemplate,
  };

  await storage.setLastEntrainement(entrainement);
  res.status(200).json(entrainement);
}
