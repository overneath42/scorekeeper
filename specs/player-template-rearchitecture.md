# Player & Template Rearchitecture

## Summary

This feature rearchitects how players and game configuration are stored: Players become persistent entities that can be created, edited, and reused across Games via a many-to-many association (GamePlayer). Templates become collections of Players plus the full set of game configuration options, allowing a new Game to be populated from a Template in one step. The existing embedded `game.players` list continues to work unchanged until a future cutover retires it.

## Entities

- **Player**: A persistent, reusable participant with a name, independent of any single Game.
- **Game**: A single played (or in-progress) instance of the scorekeeper, configured with rules and associated Players.
- **GamePlayer**: The association between a Game and a Player, representing that Player's participation in that specific Game (including any per-game data, such as turn order).
- **Template**: A reusable, named bundle of Players and Game settings used to prefill a new Game.

## Models

### Player

| Field | Type | Required | Notes |
|---|---|---|---|
| id | identifier | Yes | System-generated. |
| firstName | string | Yes | |
| lastName | string | Yes | |
| displayName | string | No | Optional. When present, shown in place of first/last name during gameplay. Replaces the current standalone `name` field. |
| createdAt | timestamp | Yes | System-generated. |
| updatedAt | timestamp | Yes | System-generated. |

### Game

| Field | Type | Required | Notes |
|---|---|---|---|
| id | identifier | Yes | System-generated. |
| name | string | Yes | |
| targetScore | number or null | No | Null means no target score. |
| timeLimit | number (seconds) or null | No | Null means untimed. |
| timeRemaining | number (seconds) or null | No | Present only for timed games. |
| timerBehavior | enum: no-winner, highest-score, or null | No | Applies only when timed and a target score is set. |
| turnTrackingEnabled | boolean | No | Feature flag; defaults to off. |
| currentPlayerIndex | number | No | Present only when turn tracking is enabled. |
| currentTurnNumber | number | No | Present only when turn tracking is enabled. |
| scoringHistory | list of score entries | Yes | Existing scoring data, unaffected by this rearchitecture. |
| lastActiveAt | timestamp or null | No | |
| createdAt | timestamp | Yes | System-generated. |
| updatedAt | timestamp | Yes | System-generated. |

Note: the existing embedded `players` list (index + name pairs) on Game is preserved as-is during this rearchitecture and is not replaced by GamePlayer until a later cutover.

### GamePlayer

| Field | Type | Required | Notes |
|---|---|---|---|
| id | identifier | Yes | System-generated. |
| gameId | identifier | Yes | References the Game. |
| playerId | identifier | Yes | References the Player. |
| turnOrder | number | Yes | Position of this Player within this Game; determines turn sequence and display order. |

### Template

| Field | Type | Required | Notes |
|---|---|---|---|
| id | identifier | Yes | System-generated. |
| templateName | string | Yes | Must be unique. |
| defaultName | string | No | If provided, prefills the name of the game |
| players | list of Player references, ordered | Yes | At least one Player. Order determines default turn order in games created from the template. |
| targetScore | number or null | No | |
| timeLimit | number (seconds) or null | No | |
| timerBehavior | enum: no-winner, highest-score, or null | No | |
| turnTrackingEnabled | boolean | Yes | |
| createdAt | timestamp | Yes | System-generated. |
| updatedAt | timestamp | Yes | System-generated. |

## Limitations/Constraints

- This is purely architectural: no user-facing behavior changes are required as part of this work, other than the New Game form gaining the ability to populate all its existing options from a Template (which templates already partially support).
- The existing embedded `game.players` (index + name) mechanism must continue to function unmodified; nothing may depend on GamePlayer existing until a later, separate cutover.
- Migration of existing stored Games and Templates to the new Player/GamePlayer structures is not addressed by this spec.
- Multi-user access, sharing Players/Templates across accounts or devices, and any backend/sync concerns are out of scope.
- Deleting a Player that is referenced by existing Games or Templates is prevented until the Player is removed from those references (see Business rules).

## Business rules

1. A Player must have a first name and a last name.
2. A Player's display name is optional; when absent, first and last name are used for display.
3. A Game may have zero or more GamePlayer associations independent of, and in addition to, its existing embedded `players` list.
4. Each GamePlayer association belongs to exactly one Game and references exactly one Player.
5. Within a single Game, turn order values among its GamePlayer associations must be unique.
6. A Player may have at most one GamePlayer association per Game.
7. A Template must reference at least one Player.
8. A Template's name must be unique among all Templates.
9. A Template must be able to represent every configuration option currently available on the New Game form: target score, time limit, timer behavior, and turn tracking.
10. Selecting a Template to create a new Game populates all of the Template's settings and its Players into the new Game's configuration, without modifying the Template itself.
11. If a `defaultName` was provided to the Template, this is applied to the Game's `name` field; otherwise, the name of the Template will be used.
12. Regardless of the result of Rule 11, the user will be able to change the name of the Game at any point before or during the game.
13. Editing a Player's fields updates the display of that Player everywhere it is referenced, including in existing Games and Templates; Games and Templates hold a reference to the Player, not a snapshot of its data.
14. A Player that is referenced by any GamePlayer association or Template cannot be deleted until it is removed from all of those references.
15. A Player can be removed from a Game (via its GamePlayer association) or from a Template at any time before or during setup.
16. When a Player is removed from a Game or Template, the turn order values of the remaining Players are renumbered to stay contiguous, with no gaps.

## Acceptance criteria

- Creating a Player with a first name and last name (and no display name) succeeds and the Player displays using first and last name.
- Creating a Player with a first name, last name, and display name succeeds and the Player displays using the display name during gameplay.
- Creating a Player without a first name or without a last name fails validation.
- Editing an existing Player's fields succeeds and persists the changes.
- Editing a Player referenced by an existing Game or Template causes that Game or Template to display the Player's updated data.
- Attempting to delete a Player that is referenced by a GamePlayer association or a Template fails.
- Deleting a Player that has no GamePlayer associations or Template references succeeds.
- Removing a Player from a Game or Template succeeds and the remaining Players' turn order values are renumbered contiguously, with no gaps.
- Associating a Player with a Game via GamePlayer succeeds and the association records the Player's turn order within that Game.
- A Game can have multiple GamePlayer associations, each with a distinct turn order.
- Attempting to create two GamePlayer associations for the same Game with the same turn order fails.
- Attempting to create a second GamePlayer association for the same Player within the same Game fails.
- Creating a Template with a name, at least one Player, and a full set of game settings (target score, time limit, timer behavior, turn tracking) succeeds.
- Creating a Template with no Players fails validation.
- Creating a Template with a name that duplicates an existing Template's name fails.
- Selecting an existing Template on the New Game form populates the form's players and all supported settings fields (target score, time limit, timer behavior, turn tracking) to match the Template.
- After selecting a Template and submitting the New Game form, the created Game reflects the Template's settings and players via the existing embedded `players` mechanism.
- Existing Games created before this rearchitecture continue to load, display, and play using the existing embedded `players` list, unaffected by the new Player/GamePlayer/Template structures.
- Existing Templates created before this rearchitecture (with `players` as plain name strings) continue to function as before.

## Out-of-scope / Open Questions

- Out-of-scope: migrating existing embedded `game.players` data into GamePlayer records; this spec only establishes the new structures alongside the old ones.
- Out-of-scope: any UI/UX changes beyond the New Game form's ability to populate all its existing options from a Template.
- Out-of-scope: the actual cutover from `game.players` to GamePlayer as the source of truth — this spec explicitly preserves the old path.
- Out-of-scope: renaming or deprecating the existing `GameTemplate.players: string[]` field. It is left as-is, functioning unmodified, alongside the new Player-based Template structure; any rename/deprecation is deferred to the future cutover.
