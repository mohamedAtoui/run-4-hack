import { useEffect, useRef, useState } from "react";

interface RecognitionAlternative {
  transcript: string;
}
interface RecognitionResult {
  0: RecognitionAlternative;
  isFinal: boolean;
}
interface RecognitionEvent {
  resultIndex: number;
  results: { length: number; [index: number]: RecognitionResult };
}
interface Recognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
}
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | undefined {
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export const WAKE_WORD_SUPPORTED = typeof window !== "undefined" && Boolean(recognitionCtor());

/** Matches "jose"/"josé" plus the way browsers commonly mishear it. */
const WAKE = /\b(jos[ée]|hos[ée]|joseph|jose[fy])\b/i;

export type WakeState = "off" | "waiting" | "question";

/**
 * Listens continuously for the wake word "José"; whatever is said after it is
 * handed to `onQuestion`. Pass `paused` while the coach is talking so he does
 * not answer himself.
 */
export function useWakeWord({
  enabled,
  paused,
  onQuestion,
}: {
  enabled: boolean;
  paused: boolean;
  onQuestion: (question: string) => void;
}): { state: WakeState; heard: string } {
  const [awaiting, setAwaiting] = useState(false);
  const [heard, setHeard] = useState("");
  const askedRef = useRef(onQuestion);

  useEffect(() => {
    askedRef.current = onQuestion;
  }, [onQuestion]);

  const listening = enabled && !paused && WAKE_WORD_SUPPORTED;

  useEffect(() => {
    const Ctor = recognitionCtor();
    if (!listening || !Ctor) return;

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    let awaitingQuestion = false;
    let stopped = false;

    const ask = (question: string) => {
      awaitingQuestion = false;
      setAwaiting(false);
      setHeard(question);
      askedRef.current(question);
    };

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result.isFinal) continue;
        const text = result[0].transcript.trim();
        if (!text) continue;

        if (awaitingQuestion) {
          ask(text);
          continue;
        }
        const match = WAKE.exec(text);
        if (!match) continue;
        const rest = text.slice(match.index + match[0].length).replace(/^[,\s]+/, "");
        if (rest.split(/\s+/).filter(Boolean).length >= 2) ask(rest);
        else {
          awaitingQuestion = true;
          setAwaiting(true);
        }
      }
    };

    recognition.onerror = () => {
      // "no-speech"/"network" end the session; onend restarts it.
    };
    recognition.onend = () => {
      if (!stopped) recognition.start();
    };

    recognition.start();

    return () => {
      stopped = true;
      recognition.onend = null;
      recognition.abort();
      setAwaiting(false);
    };
  }, [listening]);

  const state: WakeState = !listening ? "off" : awaiting ? "question" : "waiting";
  return { state, heard };
}
