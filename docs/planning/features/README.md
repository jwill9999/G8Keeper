# Feature Plans

This directory contains detailed implementation plans for features being developed or planned.

## How It Works

1. **Pick a feature** from the [backlog](../backlog.md) or propose a new one
2. **Create a plan** using the [template](./_template.md) — name the file with kebab-case (e.g., `refresh-token.md`)
3. **Break it down** into sub-tasks tagged by architecture layer (Domain, Application, Infrastructure, Interface)
4. **Link to docs** — each sub-task references which documentation it will affect
5. **Track progress** — check off sub-tasks as they're completed
6. **Close out** — move the feature to [index.md](../index.md) when done

## Active Feature Plans

| Feature                       | Status     | Priority | File                                                               |
| ----------------------------- | ---------- | -------- | ------------------------------------------------------------------ |
| SaaS Auth Platform (6 phases) | 📋 Planned | 🔴 High  | [backlog.md](../backlog.md#-saas-auth-platform--phased-build-plan) |

> The SaaS Platform plan lives in `backlog.md` rather than a separate feature plan file because it spans 6 phases and 33+ tasks across multiple bounded contexts. Individual phases can be broken into separate feature plan files here if needed during implementation.
>
> Update this table when adding or completing feature plans.

## Conventions

- Use the `feature-planning` skill to generate plans from requirements
- File names use kebab-case: `rate-limiting.md`, `email-verification.md`
- Sub-tasks are ordered by dependency (prerequisites first)
- Every sub-task identifies its architecture layer and affected docs

---

**Last Updated:** 2026-03-03
