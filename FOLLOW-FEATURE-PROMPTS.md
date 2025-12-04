# Follow/Unfollow Feature - API Prompts

## Prompt 1: API Design

**Mode:** PLAN MODE

Copy this prompt:

```
Design REST API endpoints for Follow/Unfollow feature.
Include 5 endpoints: follow user, unfollow, get followers, get following, check status.
Specify: HTTP method, path, request/response, auth, status codes.
```

---

## Prompt 2: Backend Routes

**Mode:** EDIT MODE

Copy this prompt:

```
Create Express routes for follow/unfollow API in server/src/routes/follow.ts
Endpoints: POST /api/users/:id/follow, DELETE /api/users/:id/follow, GET /api/users/:id/followers, GET /api/users/:id/following
Include JWT auth middleware, validation, error handling, proper HTTP status codes.
```

---

## Prompt 3: Follow Button Component

**Mode:** EDIT MODE

Copy this prompt:

```
Create React component FollowButton in client/src/components/FollowButton.tsx
Props: userId, targetUserId, onFollowStatusChange
Features: Show Follow/Following text, loading state, error handling, call API endpoint.
Style with Tailwind CSS gradients. Use TypeScript.
```

---

## Prompt 4: API Documentation

**Mode:** ASK MODE

Copy this prompt:

```
Document the 5 follow/unfollow API endpoints with: method, path, description, auth, request body, response examples, error codes.
Format: Markdown with code blocks.
```

---
