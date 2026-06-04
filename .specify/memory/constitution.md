# Scribble Game Constitution

## Core Principles

### I. TypeScript First & Strict Typing
All code written for both the backend and frontend MUST be fully typed in TypeScript. The use of `any` is strictly prohibited; use `unknown` or specific interfaces instead.

### II. HTTP Polling Only (No WebSockets)
To keep the real-time sync mechanism simple and reliable, all client-server synchronization MUST use HTTP polling (e.g., at a ~2s interval). Use of WebSockets, Socket.io, Server-Sent Events, or any other push protocol is strictly forbidden.

### III. In-Memory State Only (No Databases)
All room, participant, and game state MUST be stored in-memory on the backend (e.g., using a JavaScript `Map`). No persistent databases (SQL, NoSQL, SQLite, Redis, etc.) are allowed. Room cleanups MUST explicitly remove inactive rooms to avoid stateful bloat.

### IV. No Authentication or Sessions
Do not implement user authentication, accounts, sessions, JWT, or OAuth. Sessions are identified purely by the `participantId` generated upon room creation or joining.

### V. Fail Fast & Resilient Error Handling
The backend MUST use centralized error handlers and return clear, descriptive error payloads with appropriate HTTP status codes. The frontend MUST handle API errors gracefully and ensure the UI never crashes on failed API requests.

### VI. Component Cleanliness & Standard CSS
Frontend React components MUST be functional, use strict React hooks (`useState`, `useEffect`, etc.), and keep business logic separated from presentational structure. Styling MUST reside in `app.css` or CSS modules; utility classes like TailwindCSS are not to be used unless explicitly configured.

## Additional Constraints

- **No Unjustified Dependencies**: Do not add new external libraries or packages without strong justification and approval.
- **Granular Git Commits**: Maintain clear, descriptive, and incremental commit messages.

## Development Workflow

1. **Specify**: Update the feature spec with acceptance criteria and edge cases.
2. **Clarify**: Resolve any architectural or scope ambiguities before coding.
3. **Plan**: Formulate the state model, file-level modifications, and contract specifications.
4. **Tasks**: Break down the implementation into discrete, ordered, and testable tasks.
5. **Implement**: Code incrementally, verifying each task before proceeding.
6. **Validate**: Perform multi-client browser testing to ensure scenarios work as described.

## Governance

- Complexity and architectural deviations from these principles MUST be explicitly justified in the implementation plan's Complexity Tracking section.
- Any amendment to these principles requires a minor or major version bump of this constitution.

**Version**: 1.0.0 | **Ratified**: 2026-06-03 | **Last Amended**: 2026-06-03
