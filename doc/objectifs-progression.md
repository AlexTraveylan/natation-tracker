# Objectifs & progression (page Home)

Route : `/` (`src/pages/Home.tsx`).

## Contenu

- Sélecteur de distance (`50`, `100`, `200`, `400`, `800` — `DISTANCES` dans `shared/domain.ts`), état local via `useState<Distance>`.
- Carte "Progression" : `DistanceLineChart` (`src/components/distance-line-chart.tsx`, recharts) affichant les résultats filtrés par distance (`useSwimResults`) avec une ligne d'objectif (`useObjectifs`, champ `targetTimeSeconds`).
- Carte "Dernier entraînement généré" : affiche `useEntrainement().data.content` ou un message d'invitation à se rendre dans les réglages.

## Hooks utilisés (`src/hooks/api.ts`)

- `useObjectifs()` → `GET /api/objectifs`
- `useSwimResults()` → `GET /api/swim-results` (staleTime 5 min côté client, voir aussi le cache serveur dans `doc/swim-results-strava.md`)
- `useEntrainement()` → `GET /api/entrainement`

## Format des temps

`shared/format.ts` : `formatTime(seconds)` → `"mm:ss"`, `parseTime("mm:ss")` → secondes ou `null` si invalide. Utilisé aussi dans `Settings.tsx` (`ObjectifsEditor`).

→ Read when: modifier l'affichage de la progression, ajouter une distance, changer le format des temps.
