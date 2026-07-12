import { z } from 'zod';
import {
  entrainementSchema,
  objectifsSchema,
  swimResultsSchema,
  type Entrainement,
  type Objectifs,
} from '@shared/domain';
import { getStoredPassword } from '@/lib/settings-auth';

const promptResponseSchema = z.object({ prompt: z.string() });
const verifyResponseSchema = z.object({ ok: z.boolean() });

function authHeaders(): HeadersInit {
  const password = getStoredPassword();
  return password ? { 'x-settings-password': password } : {};
}

async function apiFetch<T>(path: string, schema: z.ZodType<T>, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) {
    let message = `Erreur ${res.status}`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      // réponse sans corps JSON exploitable
    }
    throw new Error(message);
  }
  return schema.parse(await res.json());
}

export const api = {
  getObjectifs: () => apiFetch('/api/objectifs', objectifsSchema),

  setObjectifs: (objectifs: Objectifs) =>
    apiFetch('/api/objectifs', objectifsSchema, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(objectifs),
    }),

  getPrompt: () =>
    apiFetch('/api/prompt', promptResponseSchema, { headers: authHeaders() }).then((r) => r.prompt),

  setPrompt: (prompt: string) =>
    apiFetch('/api/prompt', promptResponseSchema, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ prompt }),
    }).then((r) => r.prompt),

  getEntrainement: () => apiFetch('/api/entrainement', entrainementSchema.nullable()),

  generateEntrainement: (): Promise<Entrainement> =>
    apiFetch('/api/entrainement/generate', entrainementSchema, {
      method: 'POST',
      headers: authHeaders(),
    }),

  getSwimResults: () => apiFetch('/api/swim-results', swimResultsSchema),

  verifyPassword: (password: string) =>
    apiFetch('/api/auth/verify', verifyResponseSchema, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }).then((r) => r.ok),
};
