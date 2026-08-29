import { useCallback, useState } from "react";
import { Icon } from "./Icon";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import {
  CONVERSATION_ENABLED,
  ELEVENLABS_AGENT_ID,
  ELEVENLABS_SIGNED_URL_ENDPOINT,
  ELEVENLABS_VOICE_ID,
  fetchSignedUrl,
} from "./elevenlabs";
import { COACH_FIRST_MESSAGE, COACH_PROMPT, runContext } from "./persona";

export interface CoachTalkProps {
  elapsedSec: number;
  distanceKm: number;
  paceMinPerKm: number | null;
  streak: number;
}

export function CoachTalk(props: CoachTalkProps) {
  if (!CONVERSATION_ENABLED) {
    return (
      <p className="coach-hint">
        Talk-back coach is off — set <code>VITE_ELEVENLABS_AGENT_ID</code> to
        argue with him live.
      </p>
    );
  }
  return (
    <ConversationProvider>
      <CoachTalkSession {...props} />
    </ConversationProvider>
  );
}

function CoachTalkSession(props: CoachTalkProps) {
  const [error, setError] = useState<string | null>(null);
  const [lastSaid, setLastSaid] = useState<string | null>(null);

  const conversation = useConversation({
    onMessage: ({ source, message }: { source: string; message: string }) => {
      if (source === "ai") setLastSaid(message);
    },
    onError: (message: string) => setError(message),
    onDisconnect: () => setLastSaid(null),
  });

  const connected = conversation.status === "connected";

  const start = useCallback(async () => {
    setError(null);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const overrides = {
        agent: {
          prompt: {
            prompt: `${COACH_PROMPT}\n\n${runContext(props)}`,
          },
          firstMessage: COACH_FIRST_MESSAGE,
        },
        tts: { voiceId: ELEVENLABS_VOICE_ID },
      };
      if (ELEVENLABS_SIGNED_URL_ENDPOINT) {
        await conversation.startSession({
          signedUrl: await fetchSignedUrl(),
          connectionType: "websocket",
          overrides,
        });
      } else {
        await conversation.startSession({
          agentId: ELEVENLABS_AGENT_ID!,
          connectionType: "webrtc",
          overrides,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not start the conversation",
      );
    }
  }, [conversation, props]);

  const stop = useCallback(() => {
    void conversation.endSession();
  }, [conversation]);

  return (
    <div className="coach-talk">
      <button
        className={`btn ${connected ? "btn-danger" : ""}`}
        onClick={connected ? stop : start}
      >
        {connected ? (
          "End the conversation"
        ) : (
          <>
            <Icon name="mic" size={20} /> Talk to the coach
          </>
        )}
      </button>
      {connected && (
        <p className="coach-status">
          {conversation.isSpeaking ? "Coach is talking…" : "He is listening."}
        </p>
      )}
      {lastSaid && <p className="coach-line">“{lastSaid}”</p>}
      {error && <p className="gps-error">{error}</p>}
    </div>
  );
}
