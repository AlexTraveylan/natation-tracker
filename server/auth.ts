import { timingSafeEqual } from 'node:crypto';

export function isAuthorized(providedPassword: string | undefined): boolean {
  const expected = process.env.SETTINGS_PASSWORD;
  if (!expected || !providedPassword) return false;

  const a = Buffer.from(providedPassword);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
