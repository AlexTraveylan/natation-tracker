# Architecture — natation

## Stack technique

| Outil                             | Version | Rôle                                             |
| --------------------------------- | ------- | ------------------------------------------------ |
| React                             | 19      | UI                                               |
| TypeScript                        | ~6.0    | typage strict                                    |
| Vite                              | 8       | bundler / dev server                             |
| Tailwind CSS                      | 4       | styles utilitaires                               |
| shadcn/radix-ui                   | -       | composants UI (`src/components/ui/`)             |
| TanStack Query                    | 5       | fetch/cache des données REST                     |
| React Router DOM                  | 7       | routage SPA                                      |
| zod                               | 4       | validation des schémas (partagés client/serveur) |
| Vercel Functions (`@vercel/node`) | 5       | backend serverless (`api/`)                      |
| Husky                             | 9       | hooks git (pre-commit)                           |
| Prettier                          | 3       | formatage                                        |
| oxlint                            | 1       | linting                                          |

## Variables d'environnement

| Variable            | Usage                                                                                |
| ------------------- | ------------------------------------------------------------------------------------ |
| `CLIENT_ID`         | ID client OAuth Strava                                                               |
| `SECRET_CLIENT`     | Secret client OAuth Strava                                                           |
| `REFRESH_TOKEN`     | Refresh token Strava (non tourné automatiquement, voir `doc/swim-results-strava.md`) |
| `SETTINGS_PASSWORD` | Mot de passe de protection des routes settings (`server/auth.ts`)                    |
| `OPENAI_API_KEY`    | Clé API OpenAI pour la génération d'entraînement                                     |
| `OPENAI_MODEL`      | Modèle OpenAI utilisé (défaut `gpt-4o-mini`)                                         |
| `EDGE_CONFIG`       | URL de connexion Vercel Edge Config (lecture)                                        |
| `EDGE_CONFIG_ID`    | ID de l'Edge Config store (écriture via API REST)                                    |
| `VERCEL_API_TOKEN`  | Token API Vercel (écriture Edge Config)                                              |

Toutes ces variables sont lues côté serveur (`process.env`), aucune n'est exposée au client.

## Arborescence complète

```
natation/
├── doc/ # Documentation orientée LLM (ce dossier)
│ ├── index.md
│ ├── architecture.md
│ ├── conventions.md
│ ├── objectifs-progression.md
│ ├── entrainement-llm.md
│ ├── swim-results-strava.md
│ ├── auth-settings.md
│ └── storage-edge-config.md
├── api/ # Fonctions serverless Vercel (routes HTTP)
│ ├── auth/
│ │ └── verify.ts # POST /api/auth/verify — vérifie le mot de passe settings
│ ├── entrainement.ts # GET /api/entrainement — dernier entraînement généré
│ ├── entrainement/
│ │ └── generate.ts # POST /api/entrainement/generate — génère un entraînement via LLM
│ ├── objectifs.ts # GET/PUT /api/objectifs
│ ├── prompt.ts # GET/PUT /api/prompt
│ └── swim-results.ts # GET /api/swim-results — résultats Strava (avec cache)
├── server/ # Logique serveur partagée par les fonctions api/
│ ├── auth.ts # isAuthorized() — comparaison timing-safe du mot de passe
│ ├── composition.ts # Wiring : instancie les adapters concrets
│ ├── ports/
│ │ ├── llm.port.ts # LlmPort
│ │ ├── storage.port.ts # StoragePort
│ │ └── activity.port.ts # ActivityProviderPort
│ └── adapters/
│ ├── llm/openai.adapter.ts # OpenAiLlmAdapter
│ ├── storage/edgeConfig.adapter.ts # EdgeConfigStorageAdapter
│ └── activity/strava.adapter.ts # StravaActivityAdapter
├── shared/ # Types/schémas zod partagés client + serveur
│ ├── domain.ts # Distance, Objectifs, SwimResults, Entrainement, DEFAULT_PROMPT...
│ └── format.ts # formatTime / parseTime (mm:ss)
├── src/ # Application React (client)
│ ├── main.tsx # Entrée React (QueryClientProvider + BrowserRouter)
│ ├── App.tsx # Routes (/ et /settings)
│ ├── pages/
│ │ ├── Home.tsx # Progression + dernier entraînement
│ │ └── Settings.tsx # PasswordGate + éditeurs objectifs/prompt
│ ├── hooks/
│ │ └── api.ts # Hooks TanStack Query (useObjectifs, useEntrainement, ...)
│ ├── lib/
│ │ ├── api-client.ts # Client fetch + validation zod (objet `api`)
│ │ ├── settings-auth.ts # Stockage du mot de passe en sessionStorage
│ │ └── utils.ts # cn() (clsx + tailwind-merge)
│ ├── components/
│ │ ├── distance-line-chart.tsx # Graphique de progression (recharts)
│ │ └── ui/ # Composants shadcn (button, card, select, ...)
│ └── index.css
├── CLAUDE.md # Instructions pour un LLM travaillant sur ce repo
├── package.json
├── vite.config.ts
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json / tsconfig.server.json
└── .husky/pre-commit
```

## Data flow principal

```
main.tsx
└── App.tsx (QueryClientProvider > BrowserRouter > Routes)
├── Home.tsx → useObjectifs/useSwimResults/useEntrainement (src/hooks/api.ts)
└── Settings.tsx → PasswordGate puis ObjectifsEditor/PromptEditor/LastEntrainement
│
▼
src/lib/api-client.ts (fetch + validation zod)
│
▼
api/*.ts (fonctions Vercel, une par route HTTP)
│
▼
server/composition.ts (storage, llm, activityProvider)
│
▼
server/ports/*.port.ts ←implements— server/adapters/**/*.adapter.ts
```
