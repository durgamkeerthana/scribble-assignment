import { useState } from "react";
import { useRoomState, useRoomStore } from "../state/roomStore";

export function GuessForm() {
  const [guessText, setGuessText] = useState("");
  const [message, setMessage] = useState<{ type: "correct" | "incorrect" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const roomStore = useRoomStore();
  const { room, participantId } = useRoomState();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = guessText.trim();

    if (!trimmed) {
      setMessage({ type: "error", text: "Guess cannot be empty" });
      return;
    }

    if (!room || !participantId) {
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const result = await roomStore.submitGuess(room.code, participantId, trimmed);

      if (result.isCorrect) {
        setMessage({ type: "correct", text: "Correct!" });
      } else {
        setMessage({ type: "incorrect", text: "Incorrect — try again!" });
      }

      setGuessText("");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Submission failed";
      setMessage({ type: "error", text: errMsg });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label className="form__field">
        <input
          className="form__input"
          value={guessText}
          onChange={(event) => {
            setGuessText(event.target.value);
            setMessage(null);
          }}
          placeholder="Type your guess here..."
          disabled={submitting}
        />
      </label>

      {message ? (
        <div className={`guess-feedback guess-feedback--${message.type}`}>
          {message.text}
        </div>
      ) : null}

      <div className="button-row button-row--compact">
        <button className="button button--primary" type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Guess"}
        </button>
      </div>
    </form>
  );
}
