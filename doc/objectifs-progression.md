# Objectifs & progression (page Home)

Route : `/` (`src/pages/Home.tsx`).

## Contenu

- Sélecteur de distance (`50`, `100`, `200`, `400`, `800` — `DISTANCES` dans `shared/domain.ts`), état local via `useState<Distance>`.
- Carte "Progression" : `DistanceBarChart` (`src/components/distance-bar-chart.tsx`, recharts) affichant chaque tentative filtrée par distance (`useSwimResults`) comme une barre distincte (plusieurs tentatives possibles le même jour), avec une ligne d'objectif (`useObjectifs`, champ `targetTimeSeconds`). Seules les tentatives dont le temps est ≤ `RECORD_ATTEMPT_COEFFICIENT` (1.5) × l'objectif sont affichées (`shared/constants.ts`) — les temps plus lents sont considérés comme du repos/entraînement.
- Carte "Dernier entraînement généré" : affiche `useEntrainement().data.content` ou un message d'invitation à se rendre dans les réglages.

## Objectif par défaut (`shared/constants.ts`)

Si aucun objectif n'est configuré pour une distance dans les réglages, `getEffectiveTargetTimeSeconds(distance, objectifs)` retourne une valeur par défaut : `DEFAULT_OBJECTIF_MULTIPLIER` (3) × le record olympique masculin en nage libre pour cette distance. Cette valeur est traitée comme un objectif normal (ligne de référence du graphique, pré-remplissage dans `Settings.tsx`, base du filtre "tentative de record") — aucune distinction visuelle avec un objectif saisi par l'utilisateur.

## Hooks utilisés (`src/hooks/api.ts`)

- `useObjectifs()` → `GET /api/objectifs`
- `useSwimResults()` → `GET /api/swim-results` (staleTime 5 min côté client, voir aussi le cache serveur dans `doc/swim-results-strava.md`)
- `useEntrainement()` → `GET /api/entrainement`

## Format des temps

`shared/format.ts` : `formatTime(seconds)` → `"mm:ss"`, `parseTime("mm:ss")` → secondes ou `null` si invalide. Utilisé aussi dans `Settings.tsx` (`ObjectifsEditor`).

→ Read when: modifier l'affichage de la progression, ajouter une distance, changer le format des temps.
