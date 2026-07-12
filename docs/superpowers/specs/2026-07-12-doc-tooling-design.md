# Design — Documentation LLM-oriented + outillage qualité (natation)

Date : 2026-07-12

## Contexte

Le projet `natation` (Vite/React/shadcn, fonctions Vercel, ports/adapters pour LLM/storage/activité) n'a ni documentation orientée LLM, ni hooks git, ni config de formatage. Le projet de référence `hussards_orga/front` a ces trois éléments en place (`CLAUDE.md` + `doc/index.md` + fichiers par feature, `.husky/pre-commit`, `.prettierrc`).

L'architecture LLM (ports/adapters) existe déjà dans `natation` (`server/ports/llm.port.ts`, `server/adapters/llm/openai.adapter.ts`, `server/composition.ts`) : ce travail ne modifie **aucun code**, il documente l'existant et ajoute l'outillage de qualité.

## Hors périmètre

- Pas de changement de code applicatif ni de restructuration des ports/adapters existants.
- Pas de remplacement d'oxlint par ESLint (natation garde oxlint).
- Pas d'ajout de tests (aucun test n'existe actuellement dans le projet).

## 1. Reformatage ponctuel

Avant d'activer le hook Prettier, lancer `npx prettier --write .` une fois sur tout le repo pour éliminer l'incohérence actuelle (guillemets simples/sans `;` dans `src/*.tsx` vs guillemets doubles/`;` dans `server/`, `api/`, `shared/`). Sans ça, le hook `prettier --check` échouerait dès le premier commit sur des fichiers non modifiés par ce chantier.

## 2. Config qualité

- `.prettierrc` (copié de `hussards_orga/front`) :
  ```json
  {
    "semi": true,
    "singleQuote": true,
    "tabWidth": 2,
    "trailingComma": "es5",
    "printWidth": 100
  }
  ```
- `.prettierignore` : `dist`, `.vercel`, `node_modules`
- oxlint conservé tel quel (`.oxlintrc.json` inchangé), pas d'ESLint.

## 3. `.husky/pre-commit`

```sh
npm run lint
npx prettier --check .
npx tsc -b
```

Pas de `npm run test` (aucun test dans le projet).

## 4. `package.json`

- devDependencies ajoutées : `husky`, `prettier`
- script ajouté : `"prepare": "husky"`

## 5. `CLAUDE.md` (racine)

Adapté du `CLAUDE.md` de `hussards_orga/front`, avec les différences suivantes :

- **Project Overview** : app personnelle de suivi natation — objectifs de temps par distance, progression (données Strava), génération d'entraînement par LLM (OpenAI).
- **Commands** : install/dev/build, `npm run lint` (oxlint), `npx prettier --check .`, `npx tsc -b`. Pas de commande test/validate.sh (pas de script dédié — les 3 commandes suffisent, listées telles quelles).
- **Architecture** : résumé très court (src/, server/, api/, shared/), renvoie à `doc/architecture.md` pour le détail.
- **Code Style Rules** :
  - TypeScript strict, pas de `any`.
  - React : TanStack Query pour le fetch (pas de `useEffect` pour charger des données), dérivation au render.
  - Ports/adapters : `server/ports/<x>.port.ts` (interface) + `server/adapters/<domaine>/<impl>.adapter.ts` (implémentation), instanciés/branchés dans `server/composition.ts`. Convention actuelle = fichiers plats (pas de sous-dossier `port.ts`/`adapter.ts`/`index.ts` par feature comme dans `hussards_orga/front` — à adopter seulement si un port a besoin d'une sélection dynamique entre plusieurs implémentations).
  - **Commentaires** : autorisés uniquement pour expliquer un WHY non évident (contrainte cachée, quirk d'API externe, workaround) — reflète ce qui existe déjà dans le code (ex. quirks Strava/Edge Config dans `server/adapters/`). Pas de commentaire qui répète ce que le code dit déjà.
- Pas de section SEO/versioning/CHANGELOG (non pertinent pour une app privée mono-utilisateur sans CHANGELOG existant).
- Section finale "Avant de push" allégée : juste "vérifier si `doc/` doit être mis à jour via `doc/index.md`".

## 6. `doc/`

- **`index.md`** — pitch produit (2-3 lignes), "How to use this documentation", puis l'index des features ci-dessous avec liens + résumé + ligne `→ Read when: ...`, et enfin un tableau des dépendances clés.
- **`architecture.md`** — tableau stack (React 19, Vite, Tailwind 4, shadcn/radix, TanStack Query, Vercel functions, zod, TypeScript), tableau des variables d'env (`.env` : `CLIENT_ID`/`SECRET_CLIENT`/`REFRESH_TOKEN` Strava, `SETTINGS_PASSWORD`, `OPENAI_API_KEY`/`OPENAI_MODEL`, `EDGE_CONFIG`/`EDGE_CONFIG_ID`, `VERCEL_API_TOKEN`), arborescence complète commentée fichier par fichier, schéma du data flow principal (`main.tsx → App.tsx → Home/Settings → src/lib/api-client.ts → api/*.ts (Vercel functions) → server/composition.ts → ports/adapters`).
- **`conventions.md`** — règles TypeScript (strict, pas de `any`), pattern ports/adapters avec les 3 exemples réels (llm, storage, activity) et leur convention de nommage plate, règle sur les commentaires (WHY seulement), commandes de validation, note sur les alias `@/` et `@shared/`.
- **`objectifs-progression.md`** — page `Home` : sélecteur de distance, `useObjectifs`/`useSwimResults`/`useEntrainement`, `DistanceLineChart`, format `mm:ss` (`shared/format.ts`).
- **`entrainement-llm.md`** — `PromptEditor` (Settings), `DEFAULT_PROMPT` et placeholder `{objectifs}`, `LlmPort`/`OpenAiLlmAdapter`, route `api/entrainement/generate.ts` (auth requise, appel LLM, sauvegarde via `StoragePort`).
- **`swim-results-strava.md`** — `ActivityProviderPort`/`StravaActivityAdapter` (refresh token non persisté, extraction du meilleur temps par lap avec tolérance ±5%), cache 1h dans `api/swim-results.ts` avec fallback sur cache si Strava indisponible.
- **`auth-settings.md`** — `PasswordGate` (Settings), `sessionStorage` (`settings-auth.ts`), header `x-settings-password`, `isAuthorized` (comparaison timing-safe côté serveur).
- **`storage-edge-config.md`** — `StoragePort`/`EdgeConfigStorageAdapter` : lecture via SDK `@vercel/edge-config` (cache edge, lecture seule), écriture via API REST Vercel (`EDGE_CONFIG_ID`/`VERCEL_API_TOKEN`), clés stockées (`objectifs`, `prompt`, `lastEntrainement`, `swimResults`).

## Fichiers créés/modifiés (récapitulatif)

Nouveaux : `.prettierrc`, `.prettierignore`, `.husky/pre-commit`, `CLAUDE.md`, `doc/index.md`, `doc/architecture.md`, `doc/conventions.md`, `doc/objectifs-progression.md`, `doc/entrainement-llm.md`, `doc/swim-results-strava.md`, `doc/auth-settings.md`, `doc/storage-edge-config.md`.

Modifiés : `package.json` (devDependencies + script `prepare`).

Reformatés (commit séparé) : tous les fichiers `.ts`/`.tsx` existants via `prettier --write .`.
