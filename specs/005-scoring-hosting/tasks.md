---
description: "Tasks for Scoring & Results (preserved scope)"
---

# Tasks: Scoring & Results

**Note**: Timers, time-bonus scoring, drawer bonuses, and host migration are out of scope per the assignment README and were NOT implemented.

- [ ] T001 Backend: Implement flat 100-point scoring in `submitGuess` in `backend/src/services/roomStore.ts`
- [ ] T002 Backend: Implement all-correct round-end detection in `submitGuess` in `backend/src/services/roomStore.ts`
- [ ] T003 Backend: Unit test — correct guess awards 100 points
- [ ] T004 Backend: Unit test — incorrect guess awards 0 points
- [ ] T005 Backend: Unit test — duplicate correct guess does not award additional points
- [ ] T006 Backend: Unit test — all-correct transitions room to result
- [ ] T007 Verify: backend type check (`cd backend && npx tsc --noEmit`)
- [ ] T008 Verify: frontend type check (`cd frontend && npx tsc --noEmit`)
- [ ] T009 Verify: all backend tests pass (`cd backend && npx vitest run`)
- [ ] T010 Verify: all frontend tests pass (`cd frontend && npx vitest run`)
