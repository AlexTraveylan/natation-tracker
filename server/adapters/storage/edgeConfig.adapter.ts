import { get } from "@vercel/edge-config";
import {
  DEFAULT_PROMPT,
  entrainementSchema,
  objectifsSchema,
  swimResultsCacheSchema,
  type Entrainement,
  type Objectifs,
  type SwimResultsCache,
} from "../../../shared/domain.js";
import type { StoragePort } from "../../ports/storage.port.js";

const KEYS = {
  objectifs: "objectifs",
  prompt: "prompt",
  lastEntrainement: "lastEntrainement",
  swimResults: "swimResults",
} as const;

// L'écriture n'est pas possible via le SDK @vercel/edge-config (lecture seule,
// propagation en edge cache) : il faut passer par l'API REST Vercel qui met à
// jour la source de vérité et invalide le cache.
async function edgeConfigWrite(key: string, value: unknown): Promise<void> {
  const edgeConfigId = process.env.EDGE_CONFIG_ID;
  const token = process.env.VERCEL_API_TOKEN;
  if (!edgeConfigId || !token) {
    throw new Error(
      "EDGE_CONFIG_ID et VERCEL_API_TOKEN sont requis pour écrire dans Edge Config",
    );
  }

  const teamId = process.env.VERCEL_TEAM_ID;
  const url = new URL(
    `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`,
  );
  if (teamId) url.searchParams.set("teamId", teamId);

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [{ operation: "upsert", key, value }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Échec de l'écriture Edge Config (${res.status}): ${body}`,
    );
  }
}

export class EdgeConfigStorageAdapter implements StoragePort {
  async getObjectifs(): Promise<Objectifs> {
    const raw = await get(KEYS.objectifs);
    if (!raw) return [];
    return objectifsSchema.parse(raw);
  }

  async setObjectifs(objectifs: Objectifs): Promise<void> {
    await edgeConfigWrite(KEYS.objectifs, objectifsSchema.parse(objectifs));
  }

  async getPrompt(): Promise<string> {
    const raw = await get(KEYS.prompt);
    return typeof raw === "string" && raw.length > 0 ? raw : DEFAULT_PROMPT;
  }

  async setPrompt(prompt: string): Promise<void> {
    await edgeConfigWrite(KEYS.prompt, prompt);
  }

  async getLastEntrainement(): Promise<Entrainement | null> {
    const raw = await get(KEYS.lastEntrainement);
    if (!raw) return null;
    return entrainementSchema.parse(raw);
  }

  async setLastEntrainement(entrainement: Entrainement): Promise<void> {
    await edgeConfigWrite(
      KEYS.lastEntrainement,
      entrainementSchema.parse(entrainement),
    );
  }

  async getSwimResultsCache(): Promise<SwimResultsCache | null> {
    const raw = await get(KEYS.swimResults);
    if (!raw) return null;
    return swimResultsCacheSchema.parse(raw);
  }

  async setSwimResultsCache(cache: SwimResultsCache): Promise<void> {
    await edgeConfigWrite(KEYS.swimResults, swimResultsCacheSchema.parse(cache));
  }
}
