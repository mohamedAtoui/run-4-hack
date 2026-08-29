import { Icon } from "./Icon";
import { WAKE_WORD_SUPPORTED, type WakeState } from "./useWakeWord";

/**
 * Push-to-listen switch for the wake word: while it is on the app listens for
 * "José" and hands whatever follows to the coach.
 */
export function MicToggle({
  listening,
  onToggle,
  state,
  speaking,
  question,
}: {
  listening: boolean;
  onToggle: () => void;
  state: WakeState;
  speaking: boolean;
  question: string;
}) {
  if (!WAKE_WORD_SUPPORTED) {
    return (
      <p className="coach-hint">
        Voice needs a browser with speech recognition (Chrome).
      </p>
    );
  }

  const status =
    state === "denied"
      ? "Microphone blocked — allow it in the browser"
      : !listening
        ? "Mic off — tap to let him listen"
        : state === "question"
          ? "Listening… ask him anything"
          : speaking
            ? "He's talking. Interrupting is rude."
            : "Say “José” to ask the coach something";

  return (
    <div className="mic-row">
      <button
        type="button"
        className={`mic-btn${listening ? " mic-btn-on" : ""}`}
        onClick={onToggle}
        aria-pressed={listening}
        aria-label={listening ? "Stop listening" : "Start listening"}
      >
        <Icon name={listening ? "mic" : "mic-off"} size={26} />
      </button>
      <p className="mic-status">
        {status}
        {question && <span className="mic-heard">you asked: “{question}”</span>}
      </p>
    </div>
  );
}
