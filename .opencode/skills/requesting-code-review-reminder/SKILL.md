---
name: requesting-code-review-reminder
description: Use when completing a feature or before opening a PR. Ensures code review is requested before claiming work is done.
---

## What I do

Remind the agent to invoke `requesting-code-review` skill before claiming a task is complete.

## When to use me

Use this when:

- You are about to say "done" or "complete"
- You just finished implementing a feature
- You are about to open a PR
- You have made changes to >3 files

## Checklist

Before claiming done, verify:

1. **Invoke `requesting-code-review` skill** — this is mandatory, not optional
2. **Run verification commands** — `pnpm run format:check && pnpm run lint && pnpm run test && pnpm run build`
3. **Check for unintended changes** — `git diff --stat`
4. **Update memory files if needed** — `docs/superpowers/memory/decisions.md` for ADRs

## Why this matters

- Code review catches bugs, security issues, and design problems
- The `requesting-code-review` skill provides structured feedback
- Skipping review leads to regressions and technical debt

## Common mistakes

- Saying "done" without invoking the review skill
- Claiming "tests pass" without actually running them
- Forgetting to update memory files with new decisions
