# Quickstart: Game Start and Drawer Flow

## Prerequisites

- Backend dev server running (`cd backend && npm run dev`)
- Frontend dev server running (`cd frontend && npm run dev`)
- Two browser windows/tabs open

## Manual Verification

### Scenario 1: Host Starts Game and Becomes Drawer

1. Open **Window A** → navigate to `http://localhost:5173`
2. Click "Create Room", enter a name (e.g., "Alice"), click "Create and Continue"
3. Note the room code displayed
4. Open **Window B** → navigate to `http://localhost:5173`
5. Click "Join Room", enter the room code from step 3, enter a name (e.g., "Bob"), click "Join Lobby"
6. In **Window A** (host), verify Bob appears in the participant list
7. In **Window A**, click "Start Game"
8. **Expected**: Both windows navigate to `/game`. Alice sees a "You are the drawer!" badge and a secret word displayed. Bob sees a "Alice is drawing" message.

### Scenario 2: Empty Name Validation at Game Start

1. Follow steps 1-6 from Scenario 1
2. Using a direct API call or curl, set a participant's name to empty string:
   ```sh
   # This is an edge case — normally names are validated on create/join
   # Test by temporarily modifying a participant name to "  "
   ```
3. In **Window A**, click "Start Game"
4. **Expected**: Game does not start. An error message is shown: "Player name cannot be empty"

### Scenario 3: Non-Host Cannot Start Game

1. Create a room with 2+ players (as in Scenario 1)
2. In **Window B** (non-host), verify no "Start Game" button exists
3. **Expected**: Only the host sees the "Start Game" button. The non-host sees a waiting message.

### Scenario 4: Drawer-Only Word Visibility

1. Complete Scenario 1 (game started)
2. In **Window A** (drawer/Alice), check the game screen
3. **Expected**: Alice sees a secret word (e.g., "rocket") displayed
4. In **Window B** (guesser/Bob), check the game screen
5. **Expected**: Bob does NOT see the secret word. Instead, Bob sees "Alice is drawing" or similar placeholder

### Scenario 5: Verify Deterministic Word Selection

1. Start a game (Scenario 1 flow) — note the secret word
2. Restart the server, create a **new** room with the **same** participants
3. Start the game again
4. **Expected**: The secret word may differ (different room, different creation time) — determinism means the same room state always produces the same word for the same round number

## API Test Commands

```sh
# Create a room
curl -s -X POST http://localhost:3001/rooms \
  -H "Content-Type: application/json" \
  -d '{"playerName":"Alice"}' | jq .

# Join the room (use code from previous response)
curl -s -X POST http://localhost:3001/rooms/CODE/join \
  -H "Content-Type: application/json" \
  -d '{"playerName":"Bob"}' | jq .

# Start the game (host only)
curl -s -X POST http://localhost:3001/rooms/CODE/start \
  -H "Content-Type: application/json" \
  -d '{"participantId":"HOST_PARTICIPANT_ID"}' | jq .

# Fetch room as drawer (secretWord visible)
curl -s "http://localhost:3001/rooms/CODE?participantId=DRAWER_ID" | jq .room.currentRound

# Fetch room as guesser (secretWord is null)
curl -s "http://localhost:3001/rooms/CODE?participantId=GUESSER_ID" | jq .room.currentRound
```
