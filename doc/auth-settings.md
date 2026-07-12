# Authentification des réglages

L'app n'a pas de système de comptes utilisateurs : un seul mot de passe (`SETTINGS_PASSWORD`) protège l'écriture (objectifs, prompt, génération d'entraînement). La lecture (objectifs, résultats, dernier entraînement) est publique.

## Client

- `PasswordGate` (`src/pages/Settings.tsx`) : formulaire de mot de passe, appelle `useVerifyPassword` (`POST /api/auth/verify`).
- En cas de succès, le mot de passe est stocké dans `sessionStorage` (`src/lib/settings-auth.ts` : `getStoredPassword`/`setStoredPassword`/`clearStoredPassword`, clé `settings-password`).
- `src/lib/api-client.ts` (`authHeaders()`) rajoute le header `x-settings-password` sur les requêtes qui en ont besoin (`setObjectifs`, `getPrompt`/`setPrompt`, `generateEntrainement`).
- La page `Settings` affiche `PasswordGate` tant que `getStoredPassword() === null`.

## Serveur

- `server/auth.ts` : `isAuthorized(providedPassword)` compare le mot de passe fourni à `process.env.SETTINGS_PASSWORD` avec `timingSafeEqual` (résistant aux attaques par timing), après avoir vérifié que les deux chaînes ont la même longueur.
- `api/auth/verify.ts` : `POST /api/auth/verify` — valide le body avec `authSchema` (zod) et renvoie `{ ok: isAuthorized(password) }`.
- Chaque route protégée (`api/objectifs.ts` en `PUT`, `api/prompt.ts`, `api/entrainement/generate.ts`) appelle `isAuthorized(req.headers["x-settings-password"])` avant d'agir.

→ Read when: ajouter une route protégée, changer le mécanisme d'auth, modifier le stockage du mot de passe côté client.
