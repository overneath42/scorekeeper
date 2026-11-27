---
name: generate-plan
description: Turn a feature spec file into an implementation plan (Files to create/modify, Dependencies, Implementation order, Assumptions). Use when the user asks to write/generate/create a plan from a spec. Asks clarifying questions when the spec leaves architecture-relevant decisions unstated; produces the plan only, no code.
---

# generate-plan

Produce an implementation plan from a spec file, following the four-section structure below. See `plans/manage-employees-plan.md` for a prior example plan in this repo — note it includes extra sections (Context, HTMX Route Mapping, Testing Strategy, Verification) beyond this skill's four; this skill's output is scoped to just the four below unless the user asks for more.

## Input

- A path to a spec file (e.g. `specs/manage-projects.md`). If no path is given, ask which spec to plan against.
- Read the spec in full, and read this project's `CLAUDE.md` and any existing `plans/*.md`, before asking questions or writing anything — don't re-ask what's already decided by project convention (this repo already fixes the stack: Node/TypeScript, Express, HTMX, SQLite via `better-sqlite3`, Zod, Vitest/Supertest).

## Before writing: ask questions

Ask only about decisions that are both unstated by the spec/project conventions and material to implementation — e.g. ambiguous business rules that affect the data model, whether a new entity needs its own route surface or extends an existing one, naming collisions with existing files. Don't interview for its own sake: if the spec plus existing conventions answer something, proceed without asking.

## Output

A single markdown file with exactly these four sections, in this order:

1. **Files to create/modify** — the concrete file tree for new files, plus any existing files that need modification (e.g. registering a new route module in `server.ts`, extending a shared migration list) with a one-line purpose per file/directory. Name existing files explicitly when modifying them — don't list a modification as if it were a new file.
2. **Dependencies** — runtime and dev packages needed, each with a one-line reason. Call out what's already present in the project vs. newly introduced; don't re-list unchanged existing dependencies as if they were new.
3. **Implementation order** — a numbered build sequence, each step naming the file(s) it touches, ordered so each step depends only on prior steps (e.g. schema/migration before repository before validation before routes before views).
4. **Assumptions** — every decision made that the spec left unstated, each flagged explicitly (bold lead-in) with a one-line rationale. Never silently invent a load-bearing decision — if there's no reasonable default, ask instead of assuming it here.

## Rules

- No speculative features, no abstractions beyond what the spec requires.
- Match this project's existing stack and file-layout conventions unless the user says otherwise.
- Save the output to `plans/<feature-name-kebab-case>-plan.md` unless the user specifies a different path.
