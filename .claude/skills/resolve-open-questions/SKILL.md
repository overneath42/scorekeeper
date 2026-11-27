---
name: resolve-open-questions
description: Work through a spec's Open Questions one at a time with the user and fold each resolution back into the spec. Use when the user asks to resolve, answer, or work through open questions in a spec. Only edits the spec file — no code, no plan.
---

# resolve-open-questions

Resolve every item in a spec's Open Questions list, one question at a time, and update the spec with each answer as it's given.

## Input

- A path to a spec file (e.g. `specs/manage-employee-project-assignments.md`). If no path is given, ask which spec.
- Read the spec in full before asking anything.

## Find the open questions

Look for the Open Questions items — usually under a section like "Out-of-scope/Open Questions" (per this repo's `generate-spec` convention). Only pull the genuinely open/ambiguous items, not the deliberate out-of-scope exclusions if the two are combined in one section — those aren't questions and shouldn't be asked about.

If there are no open questions, say so and stop. Don't invent ones to ask.

## Ask one at a time

Work through the list in the order it appears in the spec, one question per turn:

- Use `AskUserQuestion` for each question. Propose 2-4 plausible answers grounded in the spec's own content and this project's existing conventions (`CLAUDE.md`, other specs/plans) — don't offer generic placeholder options. The user can always pick "Other" to give a different answer in their own words.
- If a question has a clear recommended answer, make it the first option and label it "(Recommended)", per this tool's convention — but still offer the real alternatives, don't pad with strawmen.
- Wait for the answer before moving to the next question. Don't batch all questions into one multi-question call — the point is one at a time, so later questions can account for earlier answers if they turn out to be related.

## Update the spec after each answer

Immediately after each answer, edit the spec file — don't wait until all questions are answered:

- Fold the resolution into the section it actually belongs to (Business rules, Models, Acceptance criteria, Limitations/Constraints, etc.), matching that section's existing tone and granularity.
- Remove the resolved question from Open Questions.
- If the answer surfaces a new, genuinely separate ambiguity, add it to Open Questions rather than resolving it unasked — but don't go looking for extra questions beyond what's already listed.

## Rules

- Spec only. Never write or modify code, tests, or a plan file as part of this skill.
- Don't touch other sections of the spec beyond what a given answer requires — no drive-by rewrites, reformatting, or "improvements."
- Don't silently assume an answer. If the user's response is ambiguous, ask a follow-up before editing.
- When every question is resolved, confirm the Open Questions section is empty (or note which remain, if the user chose to defer one) and stop.
