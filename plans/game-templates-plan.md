# Game Templates Feature

## Context

Users currently must fill out the entire game form every time they create a new game. This feature adds reusable templates — named presets of game configuration (players, target score, time limit, etc.) — so users can quickly start games they play regularly. Templates are stored via the existing localStorage adapter framework.

## Implementation

### 1. Define `GameTemplate` type

**File: `src/types/index.ts`**

Add interface:

```typescript
export interface GameTemplate {
  id: string;
  templateName: string;
  players: string[];
  targetScore: number | null;
  timeLimit: number | null;
  timerBehavior: 'no-winner' | 'highest-score' | null;
  turnTrackingEnabled: boolean;
  createdAt: Date;
}
```

Players stored as `string[]` (names only) since indexes are assigned at game creation.

### 2. Extract shared utility: `parseTimeLimit`

**File: `src/utils/time.ts`** (new)

Extract the `timeLimit` (seconds) to `{ hours, minutes }` decomposition currently in `populateForm()` into a reusable helper, since both `populateForm` and `handleTemplateSelect` need it:

```typescript
export function parseTimeLimit(totalSeconds: number): { hours: number; minutes: number } {
  const totalMinutes = Math.floor(totalSeconds / 60);
  return { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 };
}
```

Re-export from `src/utils/index.ts`. Refactor `populateForm()` in `form.ts` to use it.

### 3. Create `TemplateStorageService`

**New file: `src/services/templateStorage.ts`**

Singleton following the `GameStorageService` pattern (`src/services/gameStorage.ts`):
- Constructor creates `new LocalStorageAdapter<GameTemplate>("scorekeeper-templates")`
- `getInstance()` — singleton accessor
- `createTemplate(options: CreateTemplateOptions)` — uses `crypto.randomUUID()`, builds object, saves. Returns the template on success, `null` on failure (storage full, etc.)
- `getTemplate(id)` — retrieves with `createdAt` Date hydration
- `getAllTemplates()` — returns all, sorted by `createdAt`. Maps through `getTemplate()` to ensure Date hydration.
- `deleteTemplate(id)` — removes by ID
- `hasTemplateName(name)` — case-insensitive check for existing template with same name

Use `crypto.randomUUID()` instead of duplicating the homegrown UUID function.

`createTemplate` takes an options object. `CreateTemplateOptions` is defined and exported from `templateStorage.ts` (only used by the service and its consumers):

```typescript
export interface CreateTemplateOptions {
  templateName: string;
  players: string[];
  targetScore: number | null;
  timeLimit: number | null;
  timerBehavior: 'no-winner' | 'highest-score' | null;
  turnTrackingEnabled: boolean;
}
```

**File: `src/services/index.ts`** — add barrel export.

### 4. Fix player-list attribute binding (bug fix)

**File: `src/components/game-detail/player-list.ts`**

Change `value="${player}"` to `.value="${player}"` (property binding instead of attribute binding) on the player name inputs. The attribute binding only sets the initial value — once the user interacts with the input, attribute updates are ignored by the browser. This is a pre-existing bug but template selection makes it immediately visible since it swaps player lists on existing DOM elements.

### 5. Extract `templateFieldsValid` from `formIsValid`

**File: `src/components/game-detail/form.ts`**

Extract a `get templateFieldsValid()` getter that validates everything except game name:

```typescript
private get templateFieldsValid(): boolean {
  const hasPlayers = this.players.length >= 1;
  const targetScoreValid = this.targetScore === null || this.targetScore > 0;
  const timeValid = !this.isTimedGame || (this.hours > 0 || this.minutes > 0);
  const timerBehaviorValid = !this.isTimedGame || this.targetScore === null || this.timerBehavior !== null;
  return hasPlayers && targetScoreValid && timeValid && timerBehaviorValid;
}

private get formIsValid(): boolean {
  return this.templateFieldsValid && this.gameName.trim().length > 0;
}
```

This lets template saving reuse the core validation without the game name check.

### 6. Add template selector to the create form

**File: `src/components/game-detail/form.ts`**

Add a `<select>` dropdown above the form grid, visible only in create mode when templates exist. Selecting a template populates all form fields except game name.

New state: `templates: GameTemplate[]`, `selectedTemplateId: string`.

Load templates in `connectedCallback()`.

`handleTemplateSelect(e)`:
- Loads selected template and sets `players`, `targetScore`, `isTimedGame` (derived as `timeLimit !== null && timeLimit > 0`), `hours`/`minutes` (via `parseTimeLimit`), `timerBehavior`, `turnTrackingEnabled`
- "None" option resets to explicit defaults: `players = ["Player 1"]`, `targetScore = null`, `isTimedGame = false`, `hours = 0`, `minutes = 0`, `timerBehavior = null`, `turnTrackingEnabled = true`
- Never touches `gameName`

Include a delete button next to the dropdown, visible when a template is selected. Deletion opens a confirmation modal (via the generic `x-modal`, same pattern as `games-list.ts` line 25-55) before removing. After confirmed deletion: reset `selectedTemplateId` to `""`, reset all form fields to defaults (same list as "None" above), and refresh the templates list.

### 7. Create `x-save-template-modal` component

**New file: `src/components/game-detail/save-template-modal.ts`**

A dedicated component instead of fighting the generic modal's static-content model. This component owns its own reactive state and avoids the "frozen TemplateResult" problem entirely.

```typescript
@customElement("x-save-template-modal")
export class SaveTemplateModalComponent extends BaseComponent {
  @state() templateName = "";
  @state() isDuplicate = false;
  @state() errorMessage = "";

  private dialogRef: Ref<HTMLDialogElement> = createRef();
  private templateStorage = TemplateStorageService.getInstance();

  open() { /* reset state, show dialog */ }
  close() { /* animated close matching x-modal pattern */ }

  private handleInput(e: Event) {
    this.templateName = (e.target as HTMLInputElement).value;
    this.isDuplicate = this.templateStorage.hasTemplateName(this.templateName);
  }

  private handleSave() {
    if (!this.templateName.trim()) return;
    this.dispatchEvent(new CustomEvent("save-template", {
      detail: { templateName: this.templateName.trim() },
      bubbles: true,
    }));
  }

  render() { /* dialog with input, duplicate warning, save/cancel buttons */ }
}
```

Key behaviors:
- Input field for template name with reactive bindings (works because this component owns its state)
- Save button disabled when name is empty (reactive — no frozen template problem)
- Inline duplicate warning shown reactively as user types (case-insensitive via `hasTemplateName`)
- Dispatches `save-template` custom event with the name; the parent form handles the actual saving
- Reuses the same `<dialog>` pattern and CSS transitions as `x-modal`

**File: `src/main.ts`** — add import for new component.

### 8. Add "Save As Template" button to the form

**File: `src/components/game-detail/form.ts`**

Add a "Save As Template" button in the footer bar next to the submit button. Available in both create and edit modes. **Disabled when `templateFieldsValid` is false** — this gives immediate feedback that the form state can't be saved as a template.

When clicked (and `templateFieldsValid` is true): calls `saveTemplateModalRef.value?.open()`.

Listen for the `save-template` event from the modal:

```typescript
private handleSaveTemplate(e: CustomEvent) {
  const { templateName } = e.detail;
  const timeLimit = this.isTimedGame ? (this.hours * 3600) + (this.minutes * 60) : null;
  const timerBehavior = this.isTimedGame && this.targetScore !== null ? this.timerBehavior : null;

  const template = this.templateStorage.createTemplate({
    templateName,
    players: this.players,
    targetScore: this.targetScore,
    timeLimit,
    timerBehavior,
    turnTrackingEnabled: this.turnTrackingEnabled,
  });

  if (template) {
    this.templates = this.templateStorage.getAllTemplates();
    this.saveTemplateModalRef.value?.close();
  } else {
    // Storage failure — the modal stays open; set error state if needed
  }
}
```

**Layout:** The render method returns a wrapping `<div class="h-full overflow-hidden flex flex-col">` containing the `<form class="flex-1 overflow-hidden flex flex-col gap-md">`, the `<x-save-template-modal>`, and the `<x-modal>` (for delete confirmation). The `gap-md` stays on the form, not the wrapper. The wrapper only handles height/overflow for the flex chain.

**Modals:** Two separate elements with separate refs:
- `saveTemplateModalRef: Ref<SaveTemplateModalComponent>` — for save-as-template
- `deleteModalRef: Ref<ModalComponent>` — for delete confirmation (generic `x-modal`)

### 9. No other component registrations needed

`TemplateStorageService` is imported directly by the form. `x-modal` is already registered. `x-save-template-modal` is registered in `src/main.ts` (step 7).

### Known limitations (v1)

- **No template editing**: users cannot rename or update a template's configuration. To change a template, delete it and re-save.
- **Template selector hidden when no templates exist**: the feature is discoverable only via the "Save As Template" button in the form footer.

## Files to create/modify

| File | Action |
|------|--------|
| `src/types/index.ts` | Add `GameTemplate` interface |
| `src/utils/time.ts` | **Create** — `parseTimeLimit` helper |
| `src/utils/index.ts` | Add barrel export for `time.ts` |
| `src/services/templateStorage.ts` | **Create** — `TemplateStorageService` singleton with `CreateTemplateOptions` |
| `src/services/index.ts` | Add barrel export |
| `src/components/game-detail/player-list.ts` | Fix `value=` to `.value=` attribute binding bug |
| `src/components/game-detail/save-template-modal.ts` | **Create** — dedicated save-template modal component |
| `src/components/game-detail/form.ts` | Template selector, save-as-template button, delete confirmation modal, extract `templateFieldsValid`, refactor `populateForm` to use `parseTimeLimit` |
| `src/main.ts` | Import `save-template-modal.ts` |

## Verification

1. Run `npm run typecheck` — no type errors
2. Run `npm run lint` — no lint errors
3. Run `npm run dev` and test:
   - Create a game, click "Save As Template", name it, verify it saves
   - Navigate to new game form, verify template appears in dropdown
   - Select the template, verify form fields populate (name stays empty)
   - Verify player name inputs update correctly when switching templates (`.value` fix)
   - Select "None", verify form resets to defaults (1 player named "Player 1", no target score, untimed, turn tracking on)
   - Select a template, click delete, verify confirmation modal appears, confirm, verify template removed and form resets to defaults
   - Edit an existing game, verify "Save As Template" is available
   - Try clicking "Save As Template" with invalid form state (e.g. timed game with 0 time) — button should be disabled
   - In save modal, verify save button is disabled when name input is empty
   - In save modal, type a duplicate name — verify inline warning appears reactively
   - In save modal, type a name that differs only in case from existing — verify warning appears (case-insensitive)
   - Verify wrapper div doesn't break form height/scrolling on mobile and desktop
   - Test storage failure: fill localStorage to quota, try saving a template, verify graceful handling
