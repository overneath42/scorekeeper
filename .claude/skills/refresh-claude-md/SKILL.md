---
name: refresh-claude-md
description: Audit a CLAUDE.md against the actual repo — real file tree, package manifests, specs/plans, tests, .claude/skills, .claude/commands, .claude/rules — and classify every factual claim as still true, false now, missing, or a judgment call. Interviews the user on judgment calls (especially whether the project has outgrown a single CLAUDE.md, and whether it's near an instruction budget) instead of deciding for them. Proposes edits grouped by classification for piecemeal approval. Re-runnable: a second run on an unchanged repo must find nothing left to fix. Use when the user asks to refresh, audit, reconcile, or fact-check CLAUDE.md against the current codebase.
---

# refresh-claude-md

Ground every claim in a CLAUDE.md against the repo as it actually is, then let the user decide what to do about the parts the repo can't decide on its own.

## Scope

Default target: the root `CLAUDE.md` (repo root, or nearest ancestor of the cwd). If the user names a different file (a nested `CLAUDE.md`, a `.claude/rules/*.md`), audit that one instead. Also **discover** any other `CLAUDE.md` / `.claude/rules/*.md` files already in the repo — mention them even if they're not the primary target, since a judgment call about the root file (e.g. "split it up") may already be partly answered by files that exist.

## Step 1 — Ground truth first, opinions never precede it

Before reading CLAUDE.md's claims as true, build an independent picture of the repo:

- Real file tree (`git ls-files`, or `find` respecting `.gitignore` — don't trust a stale mental model or what CLAUDE.md says exists).
- Package manifests (`package.json`/lockfile, or the language equivalent) — actual dependencies, actual `scripts`.
- `specs/*`, `plans/*`, `docs/*` — what specs/plans actually exist, not just the ones CLAUDE.md names.
- Test files — do they exist, what do they cover, what command actually runs them (check `scripts` and CI config, don't assume `npm test` works).
- `.claude/skills/*`, `.claude/commands/*`, `.claude/rules/*` — real contents, not a remembered list.
- Source layout — does the described architecture (route surfaces, layers, file paths named in CLAUDE.md) actually exist on disk with those names.

Use Glob/Grep/Read/Bash freely here. Do not skip this step or infer repo state from CLAUDE.md's own prose — that prose is exactly what's under audit.

## Step 2 — Extract every factual claim

Walk the target CLAUDE.md and pull out atomic, checkable claims: named files/paths, stack/dependency choices, commands, described architecture, "notable conventions," project-status statements (e.g. "no source code has been scaffolded yet"), anything that asserts a fact about the repo rather than a preference about how to work in it.

## Step 3 — Classify each claim

For each claim, decide:

- **Still true** — verified against real repo state. No edit needed, don't mention it in the proposal (don't manufacture busywork).
- **False now** — repo state contradicts it (e.g. claims no code exists, but `src/` is fully built; a file path that moved; a command that no longer works).
- **Missing** — a load-bearing, durable fact about the repo that isn't mentioned anywhere in CLAUDE.md (a new skill, a new spec, a new architectural layer, a convention the code now consistently follows). Don't propose adding transient state (in-progress branches, today's TODOs) — CLAUDE.md is durable project guidance, not a status log.
- **Judgment call** — the repo doesn't settle it by itself. This is not "I'm not sure" — it's a real fork where reasonable people would want the human's input: whether the project has outgrown a single CLAUDE.md, whether a convention that's inconsistently followed in code should be codified or dropped, whether something ambiguous should become a hard rule.

## Step 4 — Judgment calls get an interview, not a decision

For every item in the judgment-call bucket, use `AskUserQuestion` — don't pick an answer and present it as done. Two judgment calls are in-scope on every run regardless of what else comes up:

### 4a. Has this outgrown a single CLAUDE.md?

Look at real signals, don't guess: line/word count of the target file, number of distinct feature areas or route surfaces in the repo, whether subdirectories have genuinely different conventions (e.g. a `frontend/` vs `backend/` split, or multiple unrelated features each with their own rules). Present those signals, then ask what the user wants to do — don't default to "split it" just because it's grown.

### 4b. Is it bumping into a real instruction budget?

Measure it: line count, word count, rough token estimate (~0.75 tokens/word as a floor estimate — call it approximate). Note that this only tells you the size of what's *eagerly* loaded (root CLAUDE.md + any `@imports` it contains, expanded up to 4 hops) — nested files and `.claude/rules/*.md` don't count against launch budget unless they're loaded. Recommend the user confirm the real number with `/context` rather than trusting the estimate. Then ask whether they want to act on it now or revisit later.

**Built-in knowledge for this interview — don't re-derive it, but re-verify against current docs/issue trackers if it's been a while since last checked (a `WebSearch` for `"Claude Code" CLAUDE.md nested rules imports site:github.com/anthropics/claude-code` is enough to refresh this):**

There are four distinct mechanisms, not two, and they are not interchangeable:

1. **Root CLAUDE.md** (repo root or an ancestor of the cwd) — loads in full at session launch. Always costs budget.
2. **`@path/to/file` imports** *inside* a CLAUDE.md — **eager**, not lazy. Expanded at launch, every session, chained up to 4 hops, relative paths resolved against the file containing the import (not the cwd). Splitting content into `@imports` is purely organizational — it does **not** save any context budget. This is the most common wrong assumption to correct if the user is hoping imports will lighten launch load.
3. **Nested CLAUDE.md files** (in subdirectories below the cwd) — **lazy in principle**: meant to load only when Claude reads a file in that subtree, which is the actual budget-saving mechanism. **Has open reliability reports as of this check**: inconsistent loading, sometimes skipped even when a matching file is touched, problems surviving `--continue`, and cases where a directory's `.claude/rules/*` load but that same directory's nested `CLAUDE.md` doesn't. Don't present this as a guaranteed fix — recommend the user verify with `/context` after setting one up, and expect to re-check occasionally.
4. **`.claude/rules/*.md`** with `paths:` YAML frontmatter (glob patterns) — also lazy, scoped to files matching the glob, same intent as nested CLAUDE.md but file-pattern-scoped rather than directory-scoped. Also has open reliability reports (e.g. user-level `~/.claude/rules/` being silently ignored in some reports). Same caveat: verify with `/context`, don't treat as guaranteed.

If the user decides to split: nested CLAUDE.md or `.claude/rules/*.md` are the only two mechanisms that actually reduce launch-time budget — `@imports` do not, and should not be recommended as a fix for budget pressure.

### Recording the answer so the second run doesn't re-ask

Once the user answers a judgment call, write the resolution into CLAUDE.md itself as one of the approved edits (Step 5) — even a "not now" answer. For example: *"Single-file CLAUDE.md is intentional for now; revisit if it exceeds ~N lines or a second, genuinely separate feature area appears."* This is what makes the audit idempotent on subjective items: next run, that sentence is now a verifiable claim (still true, until the stated trigger condition actually fires), not an open question to re-interview.

## Step 5 — Propose edits grouped by classification, approve piecemeal

Present findings in three groups (skip empty groups): **False now**, **Missing**, **Judgment calls (resolved this run)**. Within each group, list specific proposed edits (old text → new text, or "add: ..."), each independently identifiable.

Use `AskUserQuestion` (multiSelect) per group to let the user pick which specific edits in that group to apply — never batch all groups into one take-it-or-leave-it diff, and never apply anything the user didn't approve. Apply only the approved edits, surgically — don't rewrite surrounding prose, don't "clean up" untouched sections.

## Step 6 — Idempotency check

After applying approved edits, re-run Steps 1–3 against the updated file. It should now produce zero findings (aside from anything the user explicitly declined — note declined items are expected to reappear next run unless the user wants them recorded as declined-for-now, in which case record that too, same as Step 4's resolution pattern). If a second pass still finds something that should have been caught the first time, that's a gap in this run's grounding or classification — fix the audit, don't just silently patch the file again.

## Rules

- Never edit CLAUDE.md based on an assumption — every proposed edit must trace to something actually observed in the repo (Step 1) or an answer the user actually gave (Step 4).
- Don't touch nested CLAUDE.md/`.claude/rules/*` files unless they're the stated target or the user approves a specific edit to them as part of a split decision.
- Don't add speculative sections, don't restate content that's still accurate, don't reformat untouched parts of the file.
