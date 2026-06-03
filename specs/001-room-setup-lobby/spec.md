# Feature Specification: Room Setup and Lobby

**Feature Branch**: `001-room-setup-lobby`

**Created**: 2026-06-03

**Status**: Draft

**Input**: User description: "Room setup and lobby - Host tracking on room creation, join validation with clear error messages, verified multi-room isolation, automatic lobby polling within about 2 seconds, host-only start with 2-player minimum"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Hosting a new room (Priority: P1)

As a game creator, I want to create a new game room so that I can host a drawing game session and invite my friends.

**Why this priority**: Crucial first step. Without room creation, no games can be played.

**Independent Test**: A user can click "Create Room" on the home page, enter their name, click create, and see the lobby page with their name listed and a unique 4-character room code.

**Acceptance Scenarios**:

1. **Given** the player is on the Start page, **When** they click "Create Room", enter a player name, and submit, **Then** a new room is created, they are designated as the host, and they are redirected to the lobby page displaying the generated room code and themselves in the participant list.

---

### User Story 2 - Joining an existing room (Priority: P1)

As a player, I want to join an existing game room using a code provided by the host so that I can participate in their drawing session.

**Why this priority**: Fundamental to multiplayer gameplay. Players must be able to join an active room.

**Independent Test**: A user can enter a valid room code and their name on the "Join Room" screen and successfully navigate to the lobby. Entering a non-existent code shows an error.

**Acceptance Scenarios**:

1. **Given** a room exists with a code (e.g., "ABCD"), **When** a player enters "ABCD" and their name on the Join page and submits, **Then** they are added as a participant and redirected to the lobby page.
2. **Given** the player is on the Join page, **When** they submit an empty or non-existent room code, **Then** they remain on the Join page and see a clear error message (e.g., "Room not found" or "Invalid room code").

---

### User Story 3 - Synced lobby view (Priority: P2)

As a lobby participant, I want the player list to update automatically so that I can see who has joined without manual refreshing.

**Why this priority**: Essential UX for multiplayer coordination. Manual refresh buttons are tedious and prone to poor user experience.

**Independent Test**: With two browser windows open (one host, one guest), when the guest joins, the host's screen updates to show the guest's name within 2 seconds without clicking refresh.

**Acceptance Scenarios**:

1. **Given** a host is waiting in the lobby, **When** a new participant joins the room from another browser window, **Then** the new participant's name automatically appears on the host's participant list within 2 seconds.

---

### User Story 4 - Host-only starting control (Priority: P2)

As a host, I want to control when the game starts, ensuring that only I can start it and only when there are enough players.

**Why this priority**: Prevents game sessions from starting prematurely or without sufficient players (minimum 2).

**Independent Test**: The "Start Game" button is only visible/active for the host, and is disabled until a second player joins.

**Acceptance Scenarios**:

1. **Given** the host is alone in the lobby, **When** they look at the Start Game button, **Then** the button is disabled or not clickable.
2. **Given** a non-host participant is in the lobby, **When** they look at the lobby screen, **Then** the Start Game action/button is hidden or disabled, with a message stating they are waiting for the host.
3. **Given** the host is in the lobby and a second player has joined, **When** they click "Start Game", **Then** the game starts for all participants in the room.

---

### Edge Cases

- **Joining with empty or whitespace-only code**: The system must reject the request on the frontend before hitting the API, and display a validation error.
- **Accessing a non-existent room code via direct URL**: If a user tries to access a lobby directly or enters a bad code, they should be redirected back to the Start page with a clear error message.
- **Multiple rooms running concurrently**: Room isolation must ensure that participants in Room A do not appear in Room B, and game status changes in Room A do not affect Room B.
- **Lobby polling failure**: If polling the backend fails due to network issues, it should retry silently on the next interval rather than showing a crashing error screen.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow a player to create a new room, generating a unique, random 4-character uppercase alphanumeric room code.
- **FR-002**: The creator of the room MUST be recorded as the host of the room.
- **FR-003**: The system MUST support multiple isolated rooms. Actions in one room (joining, starting game) MUST NOT affect other rooms.
- **FR-004**: The system MUST validate room codes on join:
  - Empty or whitespace-only codes MUST be rejected immediately.
  - Codes that do not match an active room MUST return a `404 Not Found` response with a clear error message.
- **FR-005**: The system MUST expose the host's identity (e.g., `hostId`) in the room snapshot so the client can determine host permissions.
- **FR-006**: The client application MUST automatically poll the backend room snapshot endpoint at a regular interval (every 2 seconds) while in the lobby.
- **FR-007**: The client application MUST show the "Start Game" action only to the host player.
- **FR-008**: The "Start Game" action MUST be disabled unless there are at least 2 players in the lobby (the host + at least one other participant).
- **FR-009**: The server MUST validate that the request to start a game is initiated by the host of that room and that the room has at least 2 participants.

### Key Entities

- **Room**:
  - `code` (string, unique 4-character ID)
  - `status` (string, e.g., `"lobby"`, `"active"`)
  - `hostId` (string, participant ID of the room creator)
  - `participants` (array of Participant entities)
  - `createdAt` (timestamp string)
  - `updatedAt` (timestamp string)
- **Participant**:
  - `id` (string, unique uuid)
  - `name` (string, display name)
  - `joinedAt` (timestamp string)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Room creation completes, and the host enters the lobby in under 1 second under normal network conditions.
- **SC-002**: Attempts to join with invalid/non-existent room codes display a clear error message in under 500ms.
- **SC-003**: The lobby list updates within 2 seconds of a new player joining the room on another client.
- **SC-004**: Non-hosts have no mechanism in the UI to trigger game start.

## Assumptions

- The backend stores room state in-memory; restarting the server clears all rooms.
- Standard HTTP polling is sufficient for lobby synchronization, adhering to the project rule of "No WebSockets".
- A player's session is identified on the client by the `participantId` returned from room creation or joining.
