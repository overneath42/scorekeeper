# Plan: Player & Template Rearchitecture

## Context

The app currently stores players as plain strings embedded directly in each `Game` (`GamePlayer = {index, name}`) and each `GameTemplate` (`players: string[]`). There is no persistent, reusable Player entity — a name typed into one game has no relationship to the "same" name typed into another. This plan introduces `Player` as a first-class, persistent entity (with first/last/optional display name), a `PlayerAssociation` join entity linking Players to Games with turn order, and a `PlayerTemplate` entity that bundles Players with full game settings for one-step game creation.

This is explicitly **architectural only**: per the spec, the existing embedded `game.players` and `GameTemplate.players: string[]` mechanisms must keep working completely unmodified. No existing type, service, or UI component is changed. New entities are added alongside the old ones, ready for a future cutover that is out of scope here.

## Naming decisions

- **`GamePlayer`** (existing `{index, name}` type) — left untouched, name included, to avoid any collision.
- **`PlayerAssociation`** — the new Game↔Player join entity. Not `GamePlayerAssociation`: the `gameId` field already scopes it to a game, and the shorter name avoids stutter next to `Player`/`PlayerTemplate`.
- **`PlayerTemplate`** — the new Player-based template entity, coexisting with the untouched `GameTemplate`. Named for what makes it new (built from `Player` references), matching the domain-first naming already in use (`Player`, `GamePlayer`, `Template`).

## Files to create/modify

**Types**
- `src/types/player.ts` — `Player { id, firstName, lastName, displayName?, createdAt, updatedAt }`.
- `src/types/player-association.ts` — `PlayerAssociation { id, gameId, playerId, turnOrder }`.
- `src/types/player-template.ts` — `PlayerTemplate { id, templateName, defaultName?, playerIds: string[], targetScore, timeLimit, timerBehavior, turnTrackingEnabled, createdAt, updatedAt }`. `playerIds` is an ordered list of references (not embedded Player data), per the spec's rule that Templates hold references, not snapshots — array order doubles as default turn order.
- `src/types/index.ts` — add three barrel re-exports. No edits to existing `Game`/`GameTemplate`/`GamePlayer` declarations.

**Services** (mirrors `src/services/templateStorage.ts` exactly: singleton via `getInstance()`/`initialize()`, `crypto.randomUUID()`, `createdAt`/`updatedAt` stamped in the service, `null`/`false`-on-failure rather than throwing)
- `src/services/playerStorage.ts` — `PlayerStorageService`. `createPlayer`, `getPlayer`, `getAllPlayers`, `updatePlayer` (restamps `updatedAt`), `deletePlayer` (runs the deletion guard below before removing), `clearAllPlayers`. Storage key `scorekeeper-players`.
- `src/services/playerAssociationStorage.ts` — `PlayerAssociationStorageService`. `createAssociation` (rejects if `turnOrder` is already taken in that game, or if that `playerId` already has an association in that game), `getAssociationsForGame(gameId)`, `getAssociationsForPlayer(playerId)`, `removeAssociation(id)` (after removal, renumbers the remaining associations in that game so `turnOrder` stays contiguous from 0), `clearAll`. Storage key `scorekeeper-player-associations`.
- `src/services/playerTemplateStorage.ts` — `PlayerTemplateStorageService`. `createTemplate` (rejects empty `playerIds`, rejects duplicate `templateName` — same case-insensitive check style as `hasTemplateName`), `getTemplate`, `getAllTemplates`, `updateTemplate`, `removePlayerFromTemplate(templateId, playerId)` (re-indexes `playerIds` to stay contiguous — array order is turn order here, so splicing the array is the renumbering), `deleteTemplate`, `hasTemplateName`. Storage key `scorekeeper-player-templates`.
- `src/services/index.ts` — add three barrel exports. No edits to existing exports.

**Deletion guard**
- Lives in `PlayerStorageService.deletePlayer`. Before removing, it calls `PlayerAssociationStorageService.getInstance().getAssociationsForPlayer(id)` and scans `PlayerTemplateStorageService.getInstance().getAllTemplates()` for any `playerIds.includes(id)`; if either is non-empty, `deletePlayer` returns `false` instead of deleting. This is the first cross-service call in this codebase (existing services are independent siblings) — worth knowing about if `playerStorage.ts` is touched later, since it now depends on the other two services existing and being importable without a cycle (they don't import it back).

**Firestore sync** (`src/services/firebase.ts`)
- Extend `activateSync`: add local+Firestore+throttled+synced adapter trios for collections `"players"`, `"playerAssociations"`, `"playerTemplates"`, following the exact block already there for `"templates"` (lines 84–89 today). Track each new `ThrottledStorageAdapter` in a new module-level `active*ThrottledAdapter` variable.
- Extend `deactivateSync`: flush/destroy the three new throttled adapters and re-`initialize()` each service back to a plain `LocalStorageAdapter`, same as the existing two blocks.
- Extend `signOut`'s `Promise.all` to also call `clearAllPlayers`, `clearAll` (associations), `clearAllTemplates` (player templates) — naming these methods consistently across the three new services matters here since `signOut` calls them by name.
- Add `runInitialPlayerSync`, `runInitialPlayerAssociationSync`, `runInitialPlayerTemplateSync`, each following `runInitialTemplateSync`'s local/remote reconciliation-by-`updatedAt` (or `createdAt` where that's all that exists) pattern, and call all three from `activateSync`'s existing `Promise.all([...])` alongside `runInitialSync`/`runInitialTemplateSync`.
- No changes to `FirestoreStorageAdapter` itself — none of the three new types have a Firestore-incompatible shape (no nested arrays like `scoringHistory`'s tuples), so the existing generic serialize/deserialize works as-is.

**Tests** (new — first test setup in this repo)
- `vitest.config.ts` — root config, `environment: "node"` (storage-service logic doesn't need a DOM; an in-memory fake avoids pulling in jsdom).
- `src/services/playerStorage.test.ts` — required firstName/lastName, deletion blocked while referenced (by association, then by template), deletion succeeds once unreferenced.
- `src/services/playerAssociationStorage.test.ts` — duplicate turnOrder rejected, duplicate player-in-same-game rejected, contiguous renumbering after `removeAssociation`.
- `src/services/playerTemplateStorage.test.ts` — empty `playerIds` rejected, duplicate `templateName` rejected, contiguous renumbering after `removePlayerFromTemplate`.
- Each test file builds its service against a small in-memory `Map`-backed `StorageAdapter<T>` test double (implements `get/set/remove/clear/keys/has/getAll`) passed via `initialize()`, not real `localStorage`.
- `package.json` — add `"test": "vitest run"` script and `vitest` devDependency.

**Not touched**: `src/components/game-detail/*`, `src/context/*`, `src/components/providers/*`, and the existing `Game`/`GameTemplate`/`GamePlayer` type declarations. No context/provider is added for the new services — they follow `TemplateStorageService`'s existing precedent of direct singleton access from components, since nothing in this spec's scope needs reactive cross-component state.

**Future UI hook-in points (not built now)**: `template-select.ts` would need a second source (or tab) for `PlayerTemplate`s alongside legacy `GameTemplate`s; `player-list.ts` would need a Player-picker mode backed by `PlayerStorageService.getAllPlayers()`; a new `src/components/players/` directory would house Player CRUD UI when that's eventually built.

## Dependencies

- **Vitest** (new devDependency) — the only new dependency. Introduced because the new services carry real, easily-regressed invariants (turn-order uniqueness, contiguous renumbering, cross-service deletion guards) that no UI exercises yet.
- No new runtime dependencies. `crypto.randomUUID()` (already the modern pattern in `templateStorage.ts`) and the existing `StorageAdapter` family are reused unmodified.

## Implementation order

1. **Types**: `player.ts`, `player-association.ts`, `player-template.ts`, wired into `types/index.ts`. Compiles standalone.
2. **`PlayerStorageService`** — CRUD only, deletion guard deferred (needs steps 3–4 first). Add to `services/index.ts`.
3. **`PlayerAssociationStorageService`** — create/read/remove, turnOrder + per-game-player uniqueness, contiguous renumbering. Depends only on step 1.
4. **`PlayerTemplateStorageService`** — create/read/update/delete, at-least-one-player + unique-name validation, contiguous renumbering on removal. Depends only on step 1.
5. **Deletion guard** — wire `PlayerStorageService.deletePlayer` to call into steps 3 and 4's services.
6. **Vitest setup + tests** — config, in-memory `StorageAdapter` test double, then the three test files covering steps 2–5.
7. **Firestore wiring** (`firebase.ts`) — add the three collections to `activateSync`/`deactivateSync`/`signOut` and the three `runInitial*Sync` functions, once local-storage behavior is confirmed by step 6's tests.

## Assumptions

- **Firestore sync wired now** (confirmed with user): matches `games`/`templates` both already having it, and avoids a second pass through `activateSync`/`deactivateSync`/`signOut` later.
- **Vitest introduced now** (confirmed with user): these are the first non-UI-verifiable invariants in the codebase (uniqueness, renumbering, deletion guards), so tests are the only practical way to verify them pre-cutover.
- **`PlayerTemplate.players` modeled as `playerIds: string[]`**, not embedded `Player` objects — required by the spec's rule that Games/Templates hold live references, not snapshots.
- **New services stay direct-singleton, no Lit context/provider** — follows `TemplateStorageService`'s existing precedent; no UI in scope needs reactive shared state yet.
- **Deletion-guard logic lives in `PlayerStorageService.deletePlayer`** rather than a separate validation module (none exists in this codebase) — keeps the invariant next to the entity it protects so no call site can bypass it. This does introduce a first-of-its-kind cross-service import.
- **Test environment is Node with an in-memory fake `StorageAdapter`**, not jsdom + real `LocalStorageAdapter` — keeps the new test setup dependency-minimal and tests service logic in isolation from the browser storage API (which is unmodified, existing code).
- **No migration** of existing `GameTemplate`/embedded `game.players` data into the new entities — explicitly out of scope per the spec; all three new services start empty under new storage keys.
- **`PlayerTemplate.turnTrackingEnabled` is required** (not optional), matching the spec's Template model table exactly, even though the same field is optional on `Game` itself.
- **Failure convention**: new services return `null`/`false` on validation failure rather than throwing, matching `TemplateStorageService`'s existing contract, so future UI callers get one consistent pattern across all storage services.

## Verification

- `npm run typecheck` — confirms new types/services compile and nothing existing broke.
- `npm run test` (new Vitest script) — runs the three new service test suites; all should pass, specifically exercising: duplicate turnOrder rejection, duplicate player-per-game rejection, contiguous renumbering (both association removal and template player removal), empty-players template rejection, duplicate template name rejection, and deletion-guard blocking/unblocking.
- `npm run lint` and `npm run build` — confirm no regressions in the untouched existing code paths (game creation/edit flow, legacy templates) since those files are not modified.
- Manually spot-check via `npm run dev` that the New Game form, existing template select/save/delete, and game creation/editing still work exactly as before — this change should be invisible in the running app.
