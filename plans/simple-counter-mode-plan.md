# Implementation Plan: Simple Counter Game Mode

## Feature Overview

Add a new game "type" called **Simple Counter** (or "Quick Score") as an alternative to the existing tally-based scoring system. This mode is optimized for one-on-one sports or games where:

- Scores increment by 1 point at a time
- Score history display is unnecessary
- Quick, one-tap scoring is essential

### Key Differences from Tally Mode

| Aspect             | Tally Mode (Current)                            | Simple Counter Mode (New)                 |
| ------------------ | ----------------------------------------------- | ----------------------------------------- |
| Score display      | Full history list with running totals           | Single large score number only            |
| Score entry        | Popover with numeric input + quick buttons      | Direct +1 button tap                      |
| Use case           | Games with variable scoring (board games, etc.) | Sports/games with single-point increments |
| History visibility | Always shown                                    | Hidden (but still recorded immutably)     |

---

## Design Decisions

### 1. Data Model Approach

**Recommended: Add `gameType` field to existing Game interface**

The existing immutable `scoringHistory` architecture is well-suited for simple counter mode. Each +1 tap will append a `[playerIndex, 1]` entry, and the current score is calculated the same way.

```typescript
// Addition to Game interface
gameType: "tally" | "counter"; // 'tally' is default for backward compatibility
```

**Why this approach:**

- Maintains full audit trail (immutability preserved)
- No changes to storage logic or score calculation
- Only UI/display logic changes based on `gameType`
- Easy to extend with additional game types in the future
- Existing games automatically default to 'tally' mode

### 2. UI for Counter Mode

The play page will render a different layout when `gameType === 'counter'`:

```
┌─────────────────────────────────────────┐
│           Game Header                   │
├───────────────────┬─────────────────────┤
│                   │                     │
│    Player 1       │     Player 2        │
│                   │                     │
│      ┌───┐        │       ┌───┐         │
│      │ 7 │        │       │ 5 │         │
│      └───┘        │       └───┘         │
│                   │                     │
│     ┌────┐        │      ┌────┐         │
│     │ +1 │        │      │ +1 │         │
│     └────┘        │      └────┘         │
│                   │                     │
└───────────────────┴─────────────────────┘
```

**Key UI elements:**

- Large, prominent score display (larger than current `x-current-score`)
- Highly visible +1 button directly below score
- Optional: Winner/leader labels (configurable)
- Turn tracking still available if enabled (but optional)
- No score history section

### 3. Undo/Correction Mechanism

Since scores are immutable, corrections require adding negative entries:

- Option A: Add a small "-1" button for corrections
- Option B: Long-press on +1 to access correction options
- Option C: No built-in correction (keep it simple for v1)

**Recommendation for v1:** Option A - Add a small "-1" button, positioned less prominently than +1 to prevent accidental taps.

---

## Implementation Steps

### Phase 1: Data Model Changes

#### 1.1 Update Type Definitions

**File:** `src/types/index.ts`

Add `gameType` to the `Game` interface:

```typescript
export interface Game {
  // ... existing fields ...
  gameType: "tally" | "counter";
}
```

#### 1.2 Update Storage Service

**File:** `src/services/gameStorage.ts`

- Update `createGame()` to accept `gameType` parameter (default: 'tally')
- Ensure `getStoredGame()` handles missing `gameType` (defaults to 'tally' for existing games)
- Add migration logic for existing games without `gameType`

```typescript
createGame(
  name: string,
  players: { name: string }[],
  targetScore: number | null,
  timeLimit: number | null,
  timerBehavior: 'no-winner' | 'highest-score' | null,
  turnTrackingEnabled: boolean,
  gameType: 'tally' | 'counter' = 'tally'  // NEW PARAMETER
): StoredGame
```

#### 1.3 Update Context Types

**File:** `src/context/game-context.ts`

Ensure `GameContext` exposes `gameType` and includes a helper method:

```typescript
isCounterMode(): boolean;  // Returns true if gameType === 'counter'
```

---

### Phase 2: Game Creation Form Updates

#### 2.1 Add Game Type Selection

**File:** `src/components/game-detail/form.ts`

Add a game type toggle/selector at the top of the form:

```
┌─────────────────────────────────────────┐
│  Game Type:                             │
│  ○ Tally Mode    ● Simple Counter       │
└─────────────────────────────────────────┘
```

Implementation details:

- Radio button group or segmented control
- Default selection: Tally Mode (backward compatible)
- When "Simple Counter" selected:
  - Turn tracking section hidden (or defaults to off)
  - Target score remains available (for win conditions)
  - Timer settings remain available

#### 2.2 Conditional Form Sections

When counter mode is selected:

- Hide or simplify turn tracking options (auto-disable)
- Keep target score option (useful for "first to X" games)
- Keep timer options (useful for timed games)

---

### Phase 3: Play Page UI Changes

#### 3.1 Create Counter Score Component

**File:** `src/components/game/elements/counter-score.ts` (NEW)

New component `x-counter-score` for counter mode display:

```typescript
@customElement("x-counter-score")
export class CounterScore extends BaseComponent {
  // Displays:
  // - Player name
  // - Large score number
  // - +1 button (prominent)
  // - -1 button (small, for corrections)
  // - Winner/leader indicator
}
```

Template structure:

```html
<div class="counter-score-container">
  <div class="player-name">{playerName}</div>
  <div class="score-display">{currentScore}</div>
  <div class="score-buttons">
    <button class="decrement-btn">-1</button>
    <button class="increment-btn">+1</button>
  </div>
  <div class="status-label">{winner/leader/tied}</div>
</div>
```

Styling considerations:

- Score display: Very large (text-6xl or larger)
- +1 button: Large, prominent, easy tap target (min 44x44px, ideally larger)
- -1 button: Smaller, less prominent, positioned away from +1
- Container: Flexbox column, centered content
- Responsive: Works for 2-4 players side by side

#### 3.2 Update Gameboard Component

**File:** `src/components/game/gameboard.ts`

Add conditional rendering based on `gameType`:

```typescript
render() {
  if (this.gameContext?.gameType === 'counter') {
    return this.renderCounterMode();
  }
  return this.renderTallyMode();  // Existing render logic
}

private renderCounterMode() {
  // Simplified layout:
  // - Game header
  // - Grid of x-counter-score components (one per player)
}

private renderTallyMode() {
  // Existing implementation
}
```

#### 3.3 Counter Mode Grid Layout

**File:** `src/styles/components/game-detail.css` (additions)

Add CSS for counter mode layout:

```css
.counter-mode-grid {
  display: grid;
  grid-template-columns: repeat(var(--player-count, 2), 1fr);
  gap: 1rem;
  height: 100%;
  align-items: center;
}

.counter-score-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}
```

#### 3.4 Update Game Provider

**File:** `src/components/providers/game-provider.ts`

Add method for quick score increment:

```typescript
async incrementScore(playerIndex: number, amount: number = 1) {
  // Directly add score without popover
  // Essentially calls addScore(playerIndex, amount)
}
```

---

### Phase 4: Score Entry Logic

#### 4.1 Quick Score Methods in Provider

**File:** `src/components/providers/game-provider.ts`

```typescript
// Quick increment for counter mode
async quickIncrement(playerIndex: number): Promise<boolean> {
  return this.addScore(playerIndex, 1);
}

// Quick decrement for corrections (adds -1)
async quickDecrement(playerIndex: number): Promise<boolean> {
  return this.addScore(playerIndex, -1);
}
```

#### 4.2 Turn Tracking Consideration

For counter mode:

- Turn tracking should be **optional** (toggle in form)
- If enabled, same rules apply: only current player's +1 is active
- If disabled (default for counter): any player can score at any time

---

### Phase 5: Polish and Edge Cases

#### 5.1 Negative Score Protection

- Prevent score from going below 0
- If current score is 0, disable -1 button
- Or: allow negative scores if that makes sense for the game

#### 5.2 Victory Detection

- Works the same as tally mode
- If target score set, game completes when reached
- Winner/leader labels display appropriately

#### 5.3 Game Status Indicators

- Show winner/leader/tied labels below score
- Use existing color scheme for consistency

#### 5.4 Timer Support

- Counter mode games can still have timers
- Timer display in header works the same way

#### 5.5 Responsive Design

- 2 players: Side by side, large scores
- 3-4 players: 2x2 grid or smaller individual displays
- Mobile: Stack vertically or 2x2 grid

---

## File Change Summary

### New Files

1. `src/components/game/elements/counter-score.ts` - Counter mode score display component

### Modified Files

1. `src/types/index.ts` - Add `gameType` to Game interface
2. `src/services/gameStorage.ts` - Update createGame, add migration
3. `src/context/game-context.ts` - Add isCounterMode helper
4. `src/components/game-detail/form.ts` - Add game type selector
5. `src/components/game/gameboard.ts` - Conditional rendering for counter mode
6. `src/components/providers/game-provider.ts` - Add quick increment/decrement methods
7. `src/styles/components/game-detail.css` - Counter mode styles
8. `src/main.ts` - Register new component

---

## Testing Considerations

### Manual Testing Scenarios

1. Create counter mode game with 2 players
2. Tap +1 for player 1, verify score increments
3. Tap +1 for player 2, verify score increments
4. Tap -1 for correction, verify score decrements
5. Verify -1 disabled when score is 0
6. Create counter mode with target score, verify victory detection
7. Create counter mode with timer, verify timer works
8. Create counter mode with turn tracking, verify only current player can score
9. Verify existing tally games still work (backward compatibility)
10. Create new tally game, verify still works as before

### Edge Cases

- What happens with 4+ players in counter mode (layout)
- Very high scores (display truncation?)
- Rapid +1 taps (debounce needed?)
- Offline/storage failure during score

---

## Future Enhancements (Out of Scope for v1)

1. **Customizable increment amounts** - Allow +2, +3 quick buttons for games like basketball
2. **Score reset** - Reset all scores to 0 without creating new game
3. **Match/set tracking** - Track multiple games within a match
4. **Sound effects** - Audible feedback on score
5. **Haptic feedback** - Vibration on mobile for +1 taps
6. **Undo last action** - Undo button instead of -1
7. **Score animation** - Visual feedback when score changes

---

## Open Questions for Review

1. **Naming:** "Simple Counter" vs "Quick Score" vs "Counter Mode" - which resonates best?

2. **Negative scores:** Should -1 be allowed to go below 0, or stop at 0?

3. **Default turn tracking:** Should counter mode default to turn tracking off, or should it be a separate choice?

4. **Button layout:** Should -1 button be:

   - Next to +1 (easier access, risk of misclick)
   - Below +1 (less prominent, more deliberate)
   - Behind a long-press/menu (hidden, most safe)

5. **Quick buttons for tally mode:** Should we add a dedicated +1 button to tally mode as well, in addition to the popover?

6. **Migration:** For existing games, should there be any UI to "convert" a tally game to counter mode (or vice versa)?

---

## Estimated Complexity

| Phase                 | Complexity | Notes                                   |
| --------------------- | ---------- | --------------------------------------- |
| Phase 1: Data Model   | Low        | Small type changes, backward compatible |
| Phase 2: Form Updates | Low-Medium | New UI section, conditional logic       |
| Phase 3: Play UI      | Medium     | New component, layout changes           |
| Phase 4: Score Logic  | Low        | Reuses existing addScore                |
| Phase 5: Polish       | Medium     | Edge cases, responsive design           |

**Overall:** Medium complexity feature with well-defined scope. The existing architecture supports this cleanly.
