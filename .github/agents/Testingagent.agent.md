---
description: 'Automated Testing for Follow/Unfollow Feature'
tools: ['edit', 'runNotebooks', 'search', 'new', 'runCommands', 'runTasks', 'usages', 'vscodeAPI', 'problems', 'changes', 'testFailure', 'openSimpleBrowser', 'fetch', 'githubRepo', 'extensions', 'todos', 'runSubagent', 'runTests']
---


# Testing Agent Mode Setup
## Automated Testing for Follow/Unfollow Feature

---

## Setup Instructions

### 1. Install Testing Dependencies (if not already done)

Backend tests already have Jest configured in `server/package.json`:
```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "ts-jest": "^29.4.5",
    "@types/jest": "^29.5.14"
  }
}
```

## Agent Task

Create complete test suite for Follow/Unfollow feature:

Tasks:
1. Generate unit tests for follow API
2. Generate integration tests
3. Generate E2E tests with Cypress
4. Execute all tests
5. Generate coverage report
6. Report results (pass/fail counts)

## Test Files to Create

- server/src/routes/__tests__/follow.test.ts
- server/src/repositories/__tests__/followRepository.test.ts
- client/cypress/e2e/follow.cy.ts

## Commands Agent Should Run

npm test -- --coverage
npx cypress run

## Success Metrics

- All tests pass ✅
- Coverage >= 80%
- No console errors
- E2E tests complete without timeouts

## Expected Test Output

Coverage Report:
- Lines: XX%
- Branches: XX%
- Functions: XX%
- Statements: XX%

Test Results:
- Total: XX
- Passed: XX
- Failed: 0