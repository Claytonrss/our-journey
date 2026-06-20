---
name: parallel-execution
description: Use when executing implementation plans with independent tasks. Suggests dispatching parallel agents and using git worktrees for isolation.
---

## What I do

Suggest using `dispatching-parallel-agents` and `using-git-worktrees` skills when a plan has multiple independent tasks that can be executed in parallel.

## When to use me

Use this when:

- You have an implementation plan with 2+ independent tasks
- Tasks don't share state or file dependencies
- You want to speed up execution
- The user has approved the plan and you're about to start coding

## How to identify parallelizable tasks

Tasks are independent if:

- They touch different files/directories
- They don't depend on each other's output
- They can be tested in isolation

Examples of parallelizable tasks:

- Adding unit tests for different components
- Implementing different API endpoints
- Refactoring different modules
- Writing documentation for different features

## Checklist

Before starting execution:

1. **Load `dispatching-parallel-agents` skill** — understand how to dispatch
2. **Load `using-git-worktrees` skill** — understand isolation strategy
3. **Identify independent tasks** from the plan
4. **Create worktrees** for each parallel task (if using worktrees)
5. **Dispatch agents** with clear scope and file boundaries

## Worktree strategy

```bash
# Create worktree for task A
git worktree add ../our-journey-task-a feat/task-a

# Create worktree for task B
git worktree add ../our-journey-task-b feat/task-b

# Each agent works in its own worktree
# Merge back to main after completion
```

## When NOT to parallelize

- Tasks have dependencies (B needs A's output)
- Tasks touch the same files (merge conflicts)
- Tasks require sequential validation (integration tests)
- Plan is small (< 30 min total work)

## Benefits

- 2-3x faster execution for large plans
- Isolation prevents context pollution
- Each agent has focused context
- Easier to review (separate PRs per task)
