# natation — Documentation LLM

Application personnelle de suivi de natation : objectifs de temps par distance, progression suivie via Strava, et génération d'une séance d'entraînement par LLM (OpenAI) à partir de ces objectifs. Stack : React 19 + TypeScript + Vite + Tailwind, backend en fonctions serverless Vercel (`api/`) avec une architecture ports/adapters (`server/`).

---

## Comment utiliser cette documentation

Identifie la feature concernée ci-dessous, lis le fichier correspondant, puis agis.
Pour comprendre l'organisation générale du code (arborescence, stack, data flow), commence par [architecture.md](architecture.md).

---

## Index des features

### [architecture.md](architecture.md)

Stack technique, variables d'environnement, arborescence complète du projet, data flow principal. **Point de départ si tu ne connais pas le projet.**

### [conventions.md](conventions.md)

Règles TypeScript, pattern ports/adapters (avec exemples réels), règle sur les commentaires, commandes de validation.
→ Read when: avant d'écrire du code, pour suivre les patterns existants — notamment avant de créer un nouveau port/adapter.

### [objectifs-progression.md](objectifs-progression.md)

Page `Home` : sélecteur de distance, graphique de progression (`DistanceBarChart`), objectifs de temps.
→ Read when: modifier l'affichage de la progression, ajouter une distance, changer le format des temps.

### [entrainement-llm.md](entrainement-llm.md)

Génération d'entraînement par LLM : `PromptEditor`, prompt par défaut, `LlmPort`/`OpenAiLlmAdapter`, route `api/entrainement/generate.ts`.
→ Read when: modifier le prompt par défaut, changer de fournisseur LLM, modifier la route de génération.

### [swim-results-strava.md](swim-results-strava.md)

Récupération des résultats de natation depuis Strava : `ActivityProviderPort`/`StravaActivityAdapter`, extraction des meilleurs temps par lap, cache serveur.
→ Read when: changer la logique d'extraction des temps, la durée du cache, ou remplacer Strava par une autre source.

### [auth-settings.md](auth-settings.md)

Protection des routes d'écriture par mot de passe unique : `PasswordGate`, `sessionStorage`, header `x-settings-password`, `isAuthorized`.
→ Read when: ajouter une route protégée, changer le mécanisme d'auth.

### [storage-edge-config.md](storage-edge-config.md)

Persistance via Vercel Edge Config : `StoragePort`/`EdgeConfigStorageAdapter`, asymétrie lecture (SDK) / écriture (API REST).
→ Read when: ajouter une nouvelle donnée persistée, changer de solution de stockage.

---

## Dépendances clés

| Package                 | Usage                                                |
| ----------------------- | ---------------------------------------------------- |
| `@tanstack/react-query` | Fetch/cache des données REST côté client             |
| `@vercel/node`          | Types des fonctions serverless (`api/`)              |
| `@vercel/edge-config`   | Lecture du stockage Edge Config                      |
| `zod`                   | Validation des schémas (partagés `shared/domain.ts`) |
| `recharts`              | Graphique de progression                             |
| `radix-ui` / `shadcn`   | Composants UI (`src/components/ui/`)                 |
| `react-router-dom`      | Routage SPA                                          |
