import { z } from 'zod';

export const DISTANCES = [50, 100, 200, 400, 800] as const;

export const distanceSchema = z.union([
  z.literal(50),
  z.literal(100),
  z.literal(200),
  z.literal(400),
  z.literal(800),
]);
export type Distance = z.infer<typeof distanceSchema>;

export const objectifSchema = z.object({
  distance: distanceSchema,
  targetTimeSeconds: z.number().positive(),
});
export type Objectif = z.infer<typeof objectifSchema>;

export const objectifsSchema = z.array(objectifSchema);
export type Objectifs = z.infer<typeof objectifsSchema>;

export const swimResultSchema = z.object({
  date: z.string(),
  distance: distanceSchema,
  timeSeconds: z.number().positive(),
  activityId: z.string(),
  activityName: z.string().optional(),
});
export type SwimResult = z.infer<typeof swimResultSchema>;

export const swimResultsSchema = z.array(swimResultSchema);
export type SwimResults = z.infer<typeof swimResultsSchema>;

export const swimResultsCacheSchema = z.object({
  results: swimResultsSchema,
  updatedAt: z.string(),
});
export type SwimResultsCache = z.infer<typeof swimResultsCacheSchema>;

export const entrainementSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  content: z.string(),
  prompt: z.string(),
});
export type Entrainement = z.infer<typeof entrainementSchema>;

export const DEFAULT_PROMPT = `Tu es un coach de natation. En te basant sur les objectifs de temps ci-dessous, propose une seule séance d'entraînement en piscine, structurée en lignes (échauffement, corps de séance avec répétitions, retour au calme), avec les distances et le nombre de répétitions. Réponds uniquement avec la séance, sans explication.

Objectifs :
{objectifs}`;

export const promptSchema = z.object({
  prompt: z.string().min(1),
});
export type PromptInput = z.infer<typeof promptSchema>;

export const authSchema = z.object({
  password: z.string().min(1),
});
export type AuthInput = z.infer<typeof authSchema>;
