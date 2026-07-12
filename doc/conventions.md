# Conventions — patterns et règles de code

## TypeScript

- Mode strict activé, pas de `any`.
- Les interfaces de ports (`server/ports/*.port.ts`) utilisent `interface`.
- Les types de domaine partagés (client + serveur) vivent dans `shared/domain.ts`, validés par des schémas zod (`z.infer<typeof ...>`).
- Alias d'import : `@/*` → `src/*`, `@shared/*` → `shared/*` (voir `vite.config.ts` et `tsconfig.app.json`). Côté serveur (`api/`, `server/`), les imports relatifs utilisent l'extension `.js` (résolution ESM Node).

## Ports / adapters

Utilisé pour toute abstraction ayant (ou pouvant avoir) plusieurs implémentations : LLM, stockage, fournisseur d'activité sportive.

Convention actuelle (fichiers plats, pas de sous-dossier par feature) :

```
server/ports/<nom>.port.ts                    ← interface TypeScript (le contrat)
server/adapters/<domaine>/<impl>.adapter.ts   ← implémentation concrète (classe qui `implements` le port)
server/composition.ts                         ← instancie l'implémentation choisie et l'exporte
```

Exemples existants :

- `server/ports/llm.port.ts` (`LlmPort`) → `server/adapters/llm/openai.adapter.ts` (`OpenAiLlmAdapter`)
- `server/ports/storage.port.ts` (`StoragePort`) → `server/adapters/storage/edgeConfig.adapter.ts` (`EdgeConfigStorageAdapter`)
- `server/ports/activity.port.ts` (`ActivityProviderPort`) → `server/adapters/activity/strava.adapter.ts` (`StravaActivityAdapter`)

`server/composition.ts` est le seul endroit qui connaît les implémentations concrètes ; les routes `api/*.ts` importent uniquement les instances exportées (`storage`, `llm`, `activityProvider`), jamais les classes adapters directement.

Si un port a besoin de sélectionner dynamiquement entre plusieurs implémentations (feature flag, mock de test, device...), adopter la convention dossier-par-feature (`port.ts` + `adapter.ts` de sélection + `index.ts`) utilisée dans `hussards_orga/front` (pattern `AnswerInput`/`digit-recognition`) plutôt que de complexifier `composition.ts`.

## React / état & données

- Les données serveur passent par TanStack Query (`useQuery`/`useMutation`), hooks centralisés dans `src/hooks/api.ts`.
- `useState` réservé à l'état que l'utilisateur modifie directement (formulaires, mot de passe déverrouillé).
- Chaque réponse HTTP est validée par un schéma zod dans `src/lib/api-client.ts` (fonction `apiFetch`) ; les composants consomment des types déjà validés.
- Pas d'appel `fetch` direct dans les composants : tout passe par l'objet `api` de `src/lib/api-client.ts`.

## Commentaires

Autorisés uniquement pour expliquer un **WHY** non évident (contrainte cachée, comportement surprenant d'une API externe, workaround). Ne jamais commenter ce que le code dit déjà.

Exemples existants à suivre : le commentaire sur la rotation du refresh token Strava (`server/adapters/activity/strava.adapter.ts`), celui sur la limitation en écriture du SDK Edge Config (`server/adapters/storage/edgeConfig.adapter.ts`).

## Validation avant commit

```bash
npm run lint          # oxlint
npx prettier --check .
npx tsc -b
```

Ces trois commandes sont automatiquement lancées par le hook `.husky/pre-commit`.

## Variables d'environnement

Toutes les variables sont lues côté serveur (`process.env`), jamais exposées au client (pas de préfixe `VITE_` utilisé actuellement). Voir `doc/architecture.md` pour la liste complète.
