# Post Tag Testing Guide

This document describes the comprehensive test suite for the post tag feature.

## Overview

The post tag feature allows users to add optional tags to their posts. Tags are:
- Optional (can be null or empty)
- Maximum 20 characters (automatically truncated)
- Trimmed of whitespace
- Validated on both client and server side

## Test Structure

### 1. Unit Tests - Tag Validation Helper

**Location**: `server/src/utils/tests/validation.test.ts`

**Purpose**: Test the `validateTag()` helper function that validates and sanitizes tag input.

**Test Cases**:
- ✅ Valid tags (under 20 characters)
- ✅ Whitespace trimming
- ✅ Empty tag handling (returns null)
- ✅ Too-long tag truncation (to 20 chars)
- ✅ Type coercion (numbers, booleans, objects)

**Run**: 
```bash
cd server
npm test -- validation.test.ts
```

### 2. API Integration Tests

**Location**: `server/src/routes/tests/posts.test.ts`

**Purpose**: Test the POST and PUT endpoints for creating and updating posts with tags.

**Test Cases**:

**POST /api/posts**:
- ✅ Accept valid tag (under 20 characters)
- ✅ Accept post without tag (optional)
- ✅ Truncate tags longer than 20 characters
- ✅ Return null for empty tag
- ✅ Return null for whitespace-only tag
- ✅ Trim whitespace from valid tags

**PUT /api/posts/:id**:
- ✅ Accept valid tag update
- ✅ Truncate tags longer than 20 characters
- ✅ Allow removing tag (set to empty)
- ✅ Trim whitespace from tags
- ✅ Handle null tag
- ✅ Return 404 for non-existent post

**Run**:
```bash
cd server
npm test -- posts.test.ts
```

### 3. End-to-End Tests - Cypress

**Location**: `client/cypress/e2e/feed-tags.cy.ts`

**Purpose**: Test the full user flow of creating posts with tags and viewing them in the feed.

**Test Cases**:
- ✅ Display tag on post when set
- ✅ Display posts without tags correctly
- ✅ Truncate tags longer than 20 characters
- ✅ Allow updating post tags
- ✅ Display multiple posts with different tags

**Setup**:
```bash
cd client
npm install  # This will install Cypress
```

**Run**:
```bash
# Interactive mode
cd client
npm run cypress:open

# Headless mode
cd client
npm run test:e2e
```

**Prerequisites**:
- Server must be running on http://localhost:5000
- Client must be running on http://localhost:5173

## Running All Tests

### Quick Test Run
```bash
# From project root
cd server && npm test
```

### Full Test Suite (including E2E)
```bash
# Terminal 1: Start server
cd server && npm run dev

# Terminal 2: Start client
cd client && npm run dev

# Terminal 3: Run all tests
cd server && npm test && cd ../client && npm run test:e2e
```

## Test Coverage

The test suite covers:
- **17 unit tests** for tag validation logic
- **12 API integration tests** for post endpoints
- **5 E2E tests** for user interactions

## Database Migration

The tag feature requires a database migration that adds the `tag` column to the `posts` table:

```sql
ALTER TABLE posts ADD COLUMN tag TEXT DEFAULT NULL
```

This migration runs automatically when the server starts (see `server/src/database.ts`).

## Test Data

Test images are provided in:
- `server/test-assets/test-image.jpg` - For API tests
- `client/cypress/fixtures/test-image.jpg` - For E2E tests

## Continuous Integration

To run tests in CI/CD:

```yaml
# Example GitHub Actions workflow
- name: Run unit and API tests
  run: |
    cd server
    npm install
    npm test

- name: Run E2E tests
  run: |
    cd server && npm run dev &
    cd client && npm run dev &
    sleep 10
    cd client && npm run test:e2e
```

## Troubleshooting

### Cypress Installation Issues
If Cypress fails to download, you may need to:
1. Check network/firewall settings
2. Use `CYPRESS_INSTALL_BINARY` environment variable
3. Install Cypress manually from cache

### Database Issues
If tests fail due to database errors:
1. Delete `server/instagram-lite.db`
2. Restart the server to recreate database
3. Run migrations will execute automatically

### Port Conflicts
Ensure ports 5000 (server) and 5173 (client) are available.

## Contributing

When adding new tag-related features:
1. Add unit tests in `validation.test.ts`
2. Add API tests in `posts.test.ts`
3. Add E2E tests in `feed-tags.cy.ts`
4. Update this documentation

## Summary

This comprehensive test suite ensures the post tag feature works correctly at all levels:
- **Unit level**: Tag validation logic
- **Integration level**: API endpoints
- **End-to-end level**: User interactions

All tests are passing ✅
