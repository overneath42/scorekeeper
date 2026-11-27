---
name: generate-spec
description: Turn a feature name and business requirements into a formal spec markdown file (Summary, Entities, Models, Limitations/Constraints, Business rules, Acceptance criteria, Out-of-scope/Open Questions). Use when the user asks to write/generate a spec for a feature. Produces the spec only — no code, file paths, or implementation detail.
---

# generate-spec

Produce a formal feature spec from a feature name and business requirements, following the exact structure used in Session 1 (see `specs/manage-employees.md` for a reference example).

## Input

- Feature name
- Business requirements (freeform description, bullet points, or prose from the user)

If the business requirements are too thin to fill a section (e.g. no business rules given at all), do not invent them — ask the user, or state the gap under Out-of-scope/Open Questions rather than fabricating rules.

## Output

A single markdown file with exactly these seven sections, in this order:

1. **Summary** — 1-3 sentences: what the feature is and what operations/behavior it provides.
2. **Entities** — the nouns/domain objects involved. Name each; one-line description.
3. **Models** — for each entity, a field table: `Field | Type | Required | Notes`. Include system-generated fields (id, timestamps) where applicable.
4. **Limitations/Constraints** — what this spec deliberately does not handle or assumes is handled elsewhere (auth, multi-tenancy, bulk ops, etc.).
5. **Business rules** — validation rules, uniqueness constraints, state transitions, formatting rules. Each rule should be independently testable.
6. **Acceptance criteria** — one entry per operation/flow, phrased as observable pass/fail behavior (what a test would check), including error/edge cases (not-found, invalid input, conflicts).
7. **Out-of-scope / Open Questions** — explicitly excluded features, and anything ambiguous in the requirements that a future session/plan needs to resolve.

## Rules

- **No code.** No function names, endpoints, file paths, database schemas, framework/library choices, or class names.
- **No implementation detail.** Don't specify routing, storage engine, templating, or architecture — that belongs in the plan, not the spec.
- Business rules and acceptance criteria must be behavior-level ("email must be unique") not mechanism-level ("check uniqueness via a repository lookup").
- Match the tone and granularity of the reference spec: declarative, terse, one rule/criterion per bullet.
- Save the output to `specs/<feature-name-kebab-case>.md` unless the user specifies a different path.
