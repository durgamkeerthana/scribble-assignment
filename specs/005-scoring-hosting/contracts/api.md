# API Contract: Scoring & Results

## Base URL

All endpoints are relative to `/rooms`.

## POST `/rooms/:code/guess` (scoring response)

### Request

```json
{
  "participantId": "uuid-guesser",
  "text": "rocket"
}
```

### Response — 200 OK (correct guess)

```json
{
  "guess": {
    "participantId": "uuid-guesser",
    "participantName": "Bob",
    "text": "rocket",
    "isCorrect": true,
    "timestamp": "2026-01-01T00:00:45.000Z"
  },
  "isCorrect": true,
  "score": 100,
  "roundComplete": true
}
```

### Response — 200 OK (incorrect guess)

```json
{
  "guess": { "isCorrect": false, ... },
  "isCorrect": false,
  "score": 0,
  "roundComplete": false
}
```

### Errors

| Status | Condition |
|--------|-----------|
| 400 | Guess is empty |
| 403 | Drawer cannot guess |
| 404 | Room not found or Participant not found |
