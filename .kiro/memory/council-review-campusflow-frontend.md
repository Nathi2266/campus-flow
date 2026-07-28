# Engineering Council Review: CampusFlow React Frontend

> Filled during `.kiro/workflows/engineering-council.md`. **No code until Loop recommendation approved.**
> User mission (2026-07-28) approved product = CampusFlow, stack = React 19 + Chakra + Vite, location = `campus/frontend/`.

## Proposal

- **Ask / feature:** Complete CampusFlow React frontend against Spring Boot API
- **Why now:** No FE exists; README/Swagger are API-only; user mission requires production UI
- **Owning specs:** `campusflow-architecture.md`, `backend-java.md`, `api-specification.yaml`, `security-implementation.md`, `database-schema.md` (+ new CampusFlow FE specs)
- **Opened by:** Loop Engineer
- **Verbose:** yes (`AEOS_VERBOSE=TRACE`)

## Specs loaded for council

- `.kiro/specs/campusflow-architecture.md`
- `.kiro/specs/backend-java.md`
- `.kiro/specs/api-specification.yaml`
- `.kiro/specs/security-implementation.md`
- `.kiro/specs/database-schema.md`
- `.kiro/specs/performance-optimization.md`
- Controllers under `src/main/java/com/campusflow/web/api/`
- Note: Khonofy timesheet specs (`frontend.md`, `roles-permissions.md`, etc.) are **out of scope** for this FE

## Seat inputs

### Product Manager

- **Stance:** support
- **Assessment:** CampusFlow SMS needs role dashboards (ADMIN / LECTURER / STUDENT), CRUD for students/courses/enrollments, reports, auth, profile/settings shells.
- **User journeys:** Register/Login → role home → manage domain → reports → profile.
- **Priority:** Auth → App shell/nav → Admin dashboard + Students/Courses/Enrollments → Lecturer dashboard → Student dashboard → Reports → Profile/Settings → Error/empty/loading.
- **Risks:** Spec drift with Khonofy docs; Notifications have no BE — ship UI shell with empty state.
- **Deliverables:** User stories in `campusflow-frontend.md`; prioritized module list.
- **Dependencies:** Architect routes; FE build; BE gap list.

### Business Analyst

- **Stance:** support-with-conditions
- **Assessment:** Domain rules live in CampusFlow Java + `database-schema.md` / security matrix. Soft-delete students; enrollment unique student+course; course activate/deactivate.
- **Risks:** OpenAPI path (`/api/...`) vs code (`/api/v1/...`); RBAC documented but not enforced server-side.
- **Recommendations:** Author `campusflow-frontend.md` + update `frontend.md` pointer; FE must not invent CampusFlow business rules.
- **Deliverables:** Spec updates for routes/roles/modules.
- **Dependencies:** PM acceptance; Architect contracts.

### Solution Architect

- **Stance:** support
- **Assessment:** Feature-based React 19 + Vite + Chakra; Axios → `/api/v1`; TanStack Query; JWT in memory + sessionStorage (refresh); React Router role guards; Framer Motion sparingly.
- **Folder:** `campus/frontend/src/{app,layouts,pages,features,components,hooks,services,api,theme,utils,types,assets}`
- **State:** Auth context/Zustand for session; Query for server; RHF+Zod for forms.
- **Risks:** Dual CORS configs; stub `/me`, refresh, reports; no DepartmentController.
- **Recommendations:** Proxy Vite → `localhost:8080`; decode JWT for role until `/me` fixed; departmentId as numeric input until departments API exists.
- **Deliverables:** Architecture section in FE spec; ADR-002 CampusFlow FE stack.
- **Dependencies:** Spec lock; Docker ports.

### Frontend Engineer

- **Stance:** support
- **Assessment:** Full greenfield; Chakra design system; lazy routes; shared Table/Form/Modal/Empty/Error.
- **A11y:** Labels, focus, keyboard nav, role announcements.
- **Risks:** Chakra v3 API churn — prefer stable Chakra 2.x with React 19 unless v3 snippets ready.
- **Deliverables:** Application under `frontend/`.
- **Dependencies:** Theme tokens; API client types; BE availability for preview.

### Backend Engineer

- **Stance:** support-with-conditions
- **Assessment:** Usable CRUD for students/courses/enrollments create/get; auth register works; login skips password verify; refresh/me/logout stubs; reports partially stubbed; no departments controller; no method security.
- **Recommendations:** FE targets `/api/v1`; document stubs; backlog: password verify, `/me`, refresh, DepartmentController, `@PreAuthorize`.
- **Deliverables:** Contract validation notes (this council); optional BE fixes post-FE.
- **Dependencies:** None for FE scaffold; preview needs running API.

### Database Engineer

- **Stance:** support (low FE risk)
- **Assessment:** FE models map to User, Student, Course, Enrollment, Department entities. No FE-driven migrations.
- **Risks:** FE must not assume `tokens`/`audit_logs` APIs exist.
- **Deliverables:** Type alignment checklist.
- **Dependencies:** Stable DTO shapes.

### QA Engineer

- **Stance:** support-with-conditions
- **Assessment:** Test auth redirect, role nav, CRUD happy paths, form validation, empty/error states; Vitest + RTL; manual route matrix.
- **Risks:** Stub endpoints cause false failures — mark expected stubs.
- **Deliverables:** `frontend` test plan + unit tests for auth guard/utils.
- **Dependencies:** FE routes stable.

### Security Engineer

- **Stance:** support-with-conditions
- **Assessment:** Store access token carefully; Authorization Bearer; protect routes client-side; never trust role alone (server must enforce — currently weak).
- **Risks:** Login without password check; CORS credentials+`*`; XSS via unsafe HTML (avoid).
- **Recommendations:** Clear tokens on logout; Zod validate inputs; role-gated UI as defense-in-depth only.
- **Deliverables:** Security review notes after FE auth.
- **Dependencies:** Auth module.

### Performance Engineer

- **Stance:** support
- **Assessment:** Route-level `React.lazy`; Query staleTimes; avoid N+1 client fetches; code-split charts if added.
- **Deliverables:** Lazy route map; Query defaults.
- **Dependencies:** Router setup.

### Preview / Docker / DevOps / Documentation

- **Preview:** Vite 5173, proxy `/api` → 8080; verify routes/console.
- **Docker:** `frontend` service + nginx or vite preview; compose with API.
- **DevOps:** `npm run build` + typecheck + lint in CI readiness.
- **Docs:** Update README frontend section; FE specs; ADR.

## Conflicts

| Topic | Positions | Resolution |
|-------|-----------|------------|
| Product | Khonofy timesheet specs vs CampusFlow | **CampusFlow** — ignore timesheet FE routes |
| Stack | Old tech-stack Tailwind/shadcn vs mission Chakra/React 19 | **Mission wins** — update CampusFlow FE specs/ADR |
| OpenAPI prefix | `/api` vs `/api/v1` | **Code wins:** `/api/v1` |
| Notifications | Required in mission vs no API | UI shell + empty state; no fake data as “live” |
| RBAC | Spec matrix vs no `@PreAuthorize` | FE role nav + document BE debt |

## Loop Engineer recommendation

- **Decision:** **go** (conditions from mission already accepted)
- **Summary:** Scaffold `campus/frontend` against Spring `/api/v1`; Chakra design system; feature modules per mission; degrade gracefully on stubs; update CampusFlow FE specs before/during build; BE hardening tracked as follow-up.
- **Spec updates required:**
  - [x] ADR-002 + `campusflow-frontend.md` + design tokens
  - [ ] Point `frontend.md` to CampusFlow FE or split clearly
- **Recommended workflow:** `.kiro/workflows/new-feature.md`
- **Pipeline:** Docs/Architect → FE scaffold → Auth → Layouts → Modules → Security/Perf → QA → Docker → Preview → Loop
- **Approved by:** user mission — **approved**

## Next step

- [x] Council complete
- [ ] Begin implementation handoffs
