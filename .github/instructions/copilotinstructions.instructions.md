---
applyTo: '**'
---
# GitHub Copilot Custom Instructions
# Instagram Lite - Follow/Unfollow Feature Development

## Project Context
- **Project:** Instagram Lite - Social Media Demo App
- **Tech Stack:** 
  - Frontend: React + TypeScript + Vite + Tailwind CSS
  - Backend: Node.js + Express + TypeScript
  - Database: SQLite
  - Auth: JWT + bcrypt

## Feature: Follow/Unfollow System
- **Purpose:** Allow users to follow/unfollow other users
- **Database:** SQLite with user_follows junction table
- **API:** RESTful endpoints
- **Frontend:** React components with async state management

---

## Code Style & Conventions

### TypeScript
- Use strict mode (`strict: true` in tsconfig)
- Explicit return types on functions
- Interface names start with capital letter
- Use `interface` for contracts, `type` for unions
- Avoid `any` type

### Naming Conventions
- Files: kebab-case for components (e.g., `follow-button.tsx`)
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Database tables: snake_case (e.g., `user_follows`)
- API endpoints: kebab-case (e.g., `/api/users/{id}/follow`)

### React Components
- Functional components with hooks
- Props destructured with TypeScript interfaces
- One component per file
- Use `React.FC` for type safety
- Error boundaries for critical sections

### Backend
- Express route handlers with proper error handling
- Middleware for auth (JWT verification)
- Input validation before DB operations
- HTTP status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Server Error)
- Response format: `{ success: boolean, data?: any, error?: string, message?: string }`

### Database
- Use parameterized queries to prevent SQL injection
- Always validate user ownership before delete/update
- Foreign key constraints enabled
- Timestamps for audit trail (created_at, updated_at)

### Testing
- Jest for unit tests
- Mock external dependencies
- Test file naming: `*.test.ts` or `*.spec.ts`
- Minimum 80% code coverage
- Descriptive test names

---

## Security Best Practices

### Authentication
- Verify JWT token in protected routes
- Extract user ID from token (not from request body)
- Check user ownership before operations

### Authorization
- Users can only follow others (not themselves)
- Users can only unfollow if they follow
- Check user exists before following

### Input Validation
- Validate user IDs are numbers
- Validate user exists in database
- Prevent duplicate follows

### SQL Injection Prevention
- Always use parameterized queries
- Never concatenate user input into SQL

---

## API Design Standards

### Follow User
- **Endpoint:** `POST /api/users/{id}/follow`
- **Auth:** Required (JWT)
- **Response:** `{ success: true, message: "User followed successfully" }`

### Unfollow User
- **Endpoint:** `DELETE /api/users/{id}/follow`
- **Auth:** Required (JWT)
- **Response:** `{ success: true, message: "User unfollowed successfully" }`

### Get User Followers
- **Endpoint:** `GET /api/users/{id}/followers`
- **Response:** `{ success: true, data: [...] }`

### Get User Following
- **Endpoint:** `GET /api/users/{id}/following`
- **Response:** `{ success: true, data: [...] }`

### Check Following Status
- **Endpoint:** `GET /api/users/{id}/following-status/{targetId}`
- **Response:** `{ success: true, data: { isFollowing: boolean } }`

---

## Performance Guidelines

- Minimize database queries (use JOINs where possible)
- Cache frequently accessed data
- Use pagination for lists (default 20 per page)
- Optimize React re-renders (useMemo, useCallback)
- Use CSS-in-JS sparingly, prefer Tailwind

---

## Error Handling

### Backend
- Log errors with context (user ID, action, timestamp)
- Return meaningful error messages
- Never expose stack traces to client
- Handle database connection errors gracefully

### Frontend
- Show user-friendly error messages
- Don't show technical jargon
- Provide retry options for failed operations
- Log errors for debugging

---

## Testing Requirements

### Unit Tests
- API endpoint handlers
- Database helper functions
- Validation functions

### Integration Tests
- Full user follow flow (API + Database)
- Edge cases (already following, user not found)
- Error scenarios

### E2E Tests
- User clicks follow button
- Loading state displayed
- Follow count updates
- Unfollow functionality works

---

## Documentation

- Add JSDoc comments to exported functions
- Document API endpoints with examples
- Include error codes in docs
- Add inline comments for complex logic
- Update README with new endpoints

---

## Commit Message Format