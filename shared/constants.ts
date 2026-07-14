import { DISTANCES, type Distance, type Objectifs } from './domain';

export const RECORD_ATTEMPT_COEFFICIENT = 1.5;

// Records olympiques masculins en nage libre (en vigueur au 2026-07-14) :
// 50m Caeleb Dressel (Tokyo 2020), 100m Pan Zhanle (Paris 2024),
// 200m Michael Phelps (Beijing 2008), 400m Sun Yang (Londres 2012),
// 800m Daniel Wiffen (Paris 2024).
const OLYMPIC_RECORD_SECONDS: Record<Distance, number> = {
  50: 21.07,
  100: 46.4,
  200: 102.96,
  400: 220.14,
  800: 458.19,
};

export const DEFAULT_OBJECTIF_MULTIPLIER = 3;

export const DEFAULT_OBJECTIFS_SECONDS: Record<Distance, number> = Object.fromEntries(
  DISTANCES.map((d) => [d, OLYMPIC_RECORD_SECONDS[d] * DEFAULT_OBJECTIF_MULTIPLIER])
) as Record<Distance, number>;

export function getEffectiveTargetTimeSeconds(distance: Distance, objectifs: Objectifs): number {
  const found = objectifs.find((o) => o.distance === distance);
  return found ? found.targetTimeSeconds : DEFAULT_OBJECTIFS_SECONDS[distance];
}
