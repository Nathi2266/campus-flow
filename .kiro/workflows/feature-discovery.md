# Workflow: Feature Discovery

Feature Engineer–led review of the product to propose what to introduce or improve. Ends with a human decision—not code.

## When to run

- User asks for Feature Engineer, feature discovery, “what next”, backlog proposals
- Start of a cycle when production readiness or role gaps need prioritization
- After major ships when `future-features.md` needs a reality check against code
- When the user says “use all engineers” for feature planning (discovery seats, not implementation)

## Hard rules

1. **No product code changes** during discovery (reading/searching the codebase is required).
2. Cite CampusFlow specs; do not invent business rules. Gaps → BA/PM.
3. Feature Engineer synthesizes; other engineers give seat assessments only.
4. Output uses `.kiro/templates/feature-recommendation.md` (save a dated copy under `.kiro/memory/` when durable).
5. **Stop for user decision** before Engineering Council or implementation.
6. Prefer `AEOS_VERBOSE=true` so seat inputs are visible.

## Pipeline

```
User requests discovery / Feature Engineer
↓
Feature Engineer loads specs, memory, role matrix
↓
Spot-check codebase (routes, controllers, pages, migrations, tests)
↓
Seat all relevant engineers (read-only assessments)
↓
Feature Engineer ranks candidates (impact / effort / risk)
↓
Write feature-recommendation pack
↓
Present to user → wait
↓
User selects → PM acceptance → Engineering Council → Loop implementation
```

## Seats (assess feasibility; no diffs)

Use the same disciplines as Engineering Council, plus Documentation and ops seats when relevant:

| Seat | Skill | Assesses for discovery |
|------|-------|------------------------|
| Feature Engineer | `feature-engineer` | Inventory, ranking, user-facing recommendation pack |
| Product Manager | `product-manager` | Business value / priority intent |
| Business Analyst | `business-analyst` | Spec completeness for each candidate |
| Solution Architect | `solution-architect` | Fit and sequencing |
| Frontend Engineer | `frontend-engineer` | UI surfaces / a11y |
| Backend Engineer | `backend-engineer` | API / enforcement |
| Database Engineer | `database-engineer` | Schema / migration risk |
| QA Engineer | `qa-engineer` | Testability / regression |
| Security Engineer | `security-engineer` | Authn/authz / PII |
| Performance Engineer | `performance-engineer` | Scale hotspots |
| DevOps / Docker / Preview | ops skills | Deploy / preview readiness |
| Documentation Engineer | `documentation-engineer` | Spec/doc drift |
| Loop Engineer | `loop-engineer` | Delivery path after approval (gates only) |

## Relationship to other workflows

```
feature-discovery  ← you are here (recommend + user decision)
        ↓
sprint-planning / PM acceptance (optional)
        ↓
engineering-council
        ↓
new-feature | bug-fix | …
        ↓
Loop verification
```

## Verbose mode

When enabled, extend the AEOS trace with a **Discovery Seats** section (each Current Agent = one seat) before the recommendation pack is shown to the user.
