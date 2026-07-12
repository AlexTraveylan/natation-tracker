# CLAUDE.md - natation

## Discover the project

@doc/index.md

## Project Overview

Application personnelle de suivi de natation : objectifs de temps par distance, progression suivie via Strava, génération d'une séance d'entraînement par LLM (OpenAI) à partir des objectifs.
Construite avec React 19, TypeScript, Vite, Tailwind CSS, et des fonctions serverless Vercel pour le backend.

## Commands

- Install dependencies: `npm install`
- Run dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Format check: `npx prettier --check .`
- Type check: `npx tsc -b`

## Architecture

- `src/` — application React (pages, hooks, composants)
- `server/` — ports/adapters (LLM, storage, activité) et wiring (`composition.ts`)
- `api/` — fonctions serverless Vercel (une par route HTTP)
- `shared/` — types et schémas zod partagés client/serveur

Voir `doc/architecture.md` pour le détail complet (arborescence commentée, data flow).

## Code Style Rules

### TypeScript

- Mode strict, pas de type `any`.
- Les ports (`server/ports/*.port.ts`) sont des `interface` ; les types de domaine partagés sont dans `shared/domain.ts`, dérivés de schémas zod.

### State & data (React)

- Les données serveur passent par TanStack Query (`useQuery`/`useMutation`, hooks dans `src/hooks/api.ts`), jamais par `useEffect` + `fetch`.
- Chaque réponse HTTP est validée par un schéma zod dans `src/lib/api-client.ts` avant d'atteindre les composants.

### Ports & adapters

- Toute abstraction ayant plusieurs implémentations possibles (LLM, stockage, fournisseur d'activité) suit le pattern `server/ports/<nom>.port.ts` (interface) + `server/adapters/<domaine>/<impl>.adapter.ts` (implémentation), branché dans `server/composition.ts`. Détails et exemples dans `doc/conventions.md`.

### Comments

Autorisés uniquement pour expliquer un WHY non évident (contrainte cachée, comportement surprenant d'une API externe, workaround). Jamais pour répéter ce que le code dit déjà.

## Validation

Toutes ces commandes doivent passer avant de commiter :

```bash
npm run lint
npx prettier --check .
npx tsc -b
```

Le hook Husky `.husky/pre-commit` les lance automatiquement.

## Avant de push

- Vérifier si `doc/` doit être mis à jour (voir `doc/index.md`).
