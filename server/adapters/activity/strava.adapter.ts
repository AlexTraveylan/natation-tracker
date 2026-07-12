import type { Distance, SwimResults } from "../../../shared/domain";
import { DISTANCES } from "../../../shared/domain";
import type { ActivityProviderPort } from "../../ports/activity.port";

const MAX_ACTIVITIES = 30;
const DISTANCE_TOLERANCE = 0.05; // ±5%

interface StravaActivity {
  id: number;
  name: string;
  type: string;
  sport_type: string;
  start_date: string;
}

interface StravaLap {
  distance: number;
  moving_time: number;
}

// Strava peut faire tourner (rotate) le refresh_token à chaque appel. On ne
// persiste pas le nouveau token : on réutilise simplement celui du .env à
// chaque requête. S'il est un jour révoqué/rotate côté Strava, il faudra
// ré-autoriser l'app et mettre à jour REFRESH_TOKEN dans .env.
async function getAccessToken(): Promise<string> {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.SECRET_CLIENT;
  const refreshToken = process.env.REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "CLIENT_ID, SECRET_CLIENT et REFRESH_TOKEN sont requis dans .env",
    );
  }

  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Échec du refresh Strava (${res.status}): ${body}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

// Strava ne calcule pas de "meilleur temps" pour une distance donnée en
// natation (contrairement aux best_efforts en course à pied) : on approxime
// en cherchant, parmi les longueurs (laps) de l'activité, celles dont la
// distance est proche (±5%) de la distance cible, et on garde la plus rapide.
function extractBestTimesPerDistance(
  laps: StravaLap[],
): Partial<Record<Distance, number>> {
  const best: Partial<Record<Distance, number>> = {};
  for (const distance of DISTANCES) {
    const matches = laps.filter(
      (lap) => Math.abs(lap.distance - distance) <= distance * DISTANCE_TOLERANCE,
    );
    if (matches.length === 0) continue;
    best[distance] = Math.min(...matches.map((lap) => lap.moving_time));
  }
  return best;
}

export class StravaActivityAdapter implements ActivityProviderPort {
  async getSwimResults(): Promise<SwimResults> {
    const accessToken = await getAccessToken();

    const activitiesRes = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?per_page=${MAX_ACTIVITIES}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!activitiesRes.ok) {
      const body = await activitiesRes.text();
      throw new Error(
        `Échec de récupération des activités Strava (${activitiesRes.status}): ${body}`,
      );
    }
    const activities = (await activitiesRes.json()) as StravaActivity[];
    const swims = activities.filter(
      (a) => a.type === "Swim" || a.sport_type === "Swim",
    );

    const results: SwimResults = [];
    for (const activity of swims) {
      const lapsRes = await fetch(
        `https://www.strava.com/api/v3/activities/${activity.id}/laps`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      if (!lapsRes.ok) continue;
      const laps = (await lapsRes.json()) as StravaLap[];
      const bestTimes = extractBestTimesPerDistance(laps);

      for (const [distance, timeSeconds] of Object.entries(bestTimes)) {
        results.push({
          date: activity.start_date,
          distance: Number(distance) as Distance,
          timeSeconds,
          activityId: String(activity.id),
          activityName: activity.name,
        });
      }
    }

    return results;
  }
}
