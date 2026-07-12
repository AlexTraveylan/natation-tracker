# Génération d'entraînement (LLM)

## UI

`PromptEditor` dans `src/pages/Settings.tsx` : édite le prompt (`usePrompt`/`useSetPrompt`, `PUT /api/prompt`) et déclenche la génération (`useGenerateEntrainement`, `POST /api/entrainement/generate`). Le résultat est affiché par `LastEntrainement` et repris sur la page `Home`.

## Prompt par défaut

`DEFAULT_PROMPT` dans `shared/domain.ts` contient un placeholder `{objectifs}`. Utilisé par défaut tant que l'utilisateur n'a pas enregistré son propre prompt (`EdgeConfigStorageAdapter.getPrompt()`).

## Route serveur : `api/entrainement/generate.ts`

1. Vérifie l'autorisation (`isAuthorized`, header `x-settings-password` — voir `doc/auth-settings.md`).
2. Charge `objectifs` et `promptTemplate` via `storage` (`server/composition.ts`).
3. Construit le texte des objectifs triés par distance croissante (`"100m : 1:30"` par ligne), remplace `{objectifs}` dans le template (ou l'ajoute en fin de prompt si le placeholder est absent).
4. Appelle `llm.generateText(finalPrompt)`.
5. Sauvegarde le résultat (`storage.setLastEntrainement`) et le renvoie (type `Entrainement` : `id`, `createdAt`, `content`, `prompt`).

Erreur LLM → réponse `502` avec le message d'erreur.

## Port / adapter

- `server/ports/llm.port.ts` : `LlmPort.generateText(prompt: string): Promise<string>`
- `server/adapters/llm/openai.adapter.ts` : `OpenAiLlmAdapter`, appelle `POST https://api.openai.com/v1/chat/completions` avec `OPENAI_API_KEY`/`OPENAI_MODEL` (défaut `gpt-4o-mini`). Lève une erreur si la clé API est absente, si la requête échoue, ou si la réponse n'a pas de contenu texte.
- Instancié dans `server/composition.ts` (`export const llm = new OpenAiLlmAdapter()`).

→ Read when: modifier le prompt par défaut, changer de fournisseur LLM (ajouter un adapter dans `server/adapters/llm/` + le brancher dans `composition.ts`), ou modifier la route de génération.
