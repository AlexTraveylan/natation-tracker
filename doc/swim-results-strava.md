# Résultats de natation (Strava)

## Route serveur : `api/swim-results.ts`

1. Lit le cache (`storage.getSwimResultsCache()`).
2. Si le cache a moins d'1h (`TTL_MS`), le renvoie tel quel.
3. Sinon, appelle `activityProvider.getSwimResults()`, met à jour le cache, renvoie les résultats frais.
4. Si l'appel Strava échoue et qu'un cache existe (même expiré), renvoie ce cache plutôt que d'échouer (fallback). Sinon, `502`.

## Port / adapter

- `server/ports/activity.port.ts` : `ActivityProviderPort.getSwimResults(): Promise<SwimResults>`
- `server/adapters/activity/strava.adapter.ts` : `StravaActivityAdapter`
  - `getAccessToken()` : refresh OAuth Strava via `CLIENT_ID`/`SECRET_CLIENT`/`REFRESH_TOKEN`. **Le refresh token retourné par Strava n'est pas persisté** — le même `REFRESH_TOKEN` du `.env` est réutilisé à chaque appel ; s'il est un jour révoqué/tourné côté Strava, il faudra ré-autoriser l'app et mettre à jour `.env`.
  - Récupère les 30 dernières activités (`MAX_ACTIVITIES`), filtre celles de type `Swim`.
  - Pour chaque activité, récupère les laps et extrait le meilleur temps par distance cible (`DISTANCES`) parmi les laps dont la distance est à ±5 % (`DISTANCE_TOLERANCE`) de la distance visée (Strava ne fournit pas de "best effort" nageur comme il le fait pour la course à pied).
- Instancié dans `server/composition.ts` (`export const activityProvider = new StravaActivityAdapter()`).

## Type `SwimResult`

`shared/domain.ts` : `{ date, distance, timeSeconds, activityId, activityName? }`.

→ Read when: changer la logique d'extraction des temps, la tolérance de distance, la durée du cache, ou remplacer Strava par une autre source.
