# E2E Failure Report

**Status:** PASS

**Suite:** `frontend/e2e/roles-and-data-flow.spec.ts`  
**Result:** 10 passed (0 failed, 0 skipped)  
**Date:** 2026-07-29

Covered:
- Login UI health
- ADMIN / LECTURER / STUDENT nav role gates
- STUDENT student-list + course-roster IDOR negatives
- Profile patch
- Admin create student (temp password) → course → enroll → reports
- Lecturer grade entry
- Student self-enroll
- Public register → STUDENT

Loop may sign off on E2E smoke for this cycle.
