# Stockage (Vercel Edge Config)

## Port

`server/ports/storage.port.ts` (`StoragePort`) : `getObjectifs`/`setObjectifs`, `getPrompt`/`setPrompt`, `getLastEntrainement`/`setLastEntrainement`, `getSwimResultsCache`/`setSwimResultsCache`.

## Adapter

`server/adapters/storage/edgeConfig.adapter.ts` (`EdgeConfigStorageAdapter`), instancié dans `server/composition.ts` (`export const storage = new EdgeConfigStorageAdapter()`).

Clés stockées (`KEYS`) : `objectifs`, `prompt`, `lastEntrainement`, `swimResults`.

**Lecture vs écriture — asymétrie du SDK Vercel Edge Config :**

- Lecture : SDK `@vercel/edge-config` (`get(key)`), rapide (cache edge), mais **lecture seule**.
- Écriture : le SDK ne le permet pas. `edgeConfigWrite()` passe par l'API REST Vercel (`PATCH https://api.vercel.com/v1/edge-config/{EDGE_CONFIG_ID}/items`, auth `Bearer VERCEL_API_TOKEN`) qui met à jour la source de vérité et invalide le cache edge.

Chaque valeur lue/écrite est (re)validée par le schéma zod correspondant (`objectifsSchema`, `entrainementSchema`, `swimResultsCacheSchema`) avant d'être retournée ou envoyée.

Le prompt par défaut (`DEFAULT_PROMPT`, `shared/domain.ts`) est renvoyé par `getPrompt()` tant qu'aucun prompt n'a été enregistré.

→ Read when: ajouter une nouvelle donnée persistée, changer de solution de stockage (remplacer par un autre adapter implémentant `StoragePort`).
