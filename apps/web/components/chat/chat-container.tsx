"use client";

import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatActions } from "@/components/chat/chat-actions";
import { DisplayNameModal } from "@/components/chat/display-name-modal";
import { persistDisplayName } from "@/lib/user-preferences";
import { buildQueueAvatarPayload, type AvatarPreference } from "@/lib/avatar";
import type { QueueState } from "@/types/chat";

interface ChatContainerProps {
  displayName: string;
  setDisplayName: Dispatch<SetStateAction<string>>;
  avatarPreference: AvatarPreference;
  selfAvatarUrl: string;
  showDisplayNameModal: boolean;
  setShowDisplayNameModal: Dispatch<SetStateAction<boolean>>;
  onSessionStateChange?: (state: {
    queueState: QueueState;
    partnerAlias: string | null;
    partnerAvatar: string | null;
  }) => void;
}

export function ChatContainer({
  displayName,
  setDisplayName,
  avatarPreference,
  selfAvatarUrl,
  showDisplayNameModal,
  setShowDisplayNameModal,
  onSessionStateChange
}: ChatContainerProps) {
  const {
    connected,
    queueState,
    partnerId,
    partnerAlias,
    partnerAvatar,
    messages,
    joinQueue,
    skip,
    sendText,
    sendImage
  } = useChatSocket();

  const canInteract = connected && !showDisplayNameModal && displayName.length > 0;

  useEffect(() => {
    onSessionStateChange?.({ queueState, partnerAlias, partnerAvatar });
  }, [onSessionStateChange, partnerAlias, partnerAvatar, queueState]);

  const handleSaveDisplayName = (newDisplayName: string) => {
    const normalized = persistDisplayName(newDisplayName);
    setDisplayName(normalized);
    setShowDisplayNameModal(false);
  };

  const handleNext = () => {
    if (!displayName) {
      setShowDisplayNameModal(true);
      return;
    }

    joinQueue(displayName, buildQueueAvatarPayload(avatarPreference, displayName));
  };

  const handleSendText = (text: string) => {
    if (!canInteract) {
      return;
    }

    sendText(text, displayName);
  };

  const handleSendImage = (file: File) => {
    if (!canInteract) {
      return;
    }

    void sendImage(file, displayName);
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ChatHeader partnerId={partnerId} partnerAlias={partnerAlias} queueState={queueState} />

      <div className="min-h-0 flex-1 overflow-hidden">
        <ChatMessages
          messages={messages}
          displayName={displayName}
          selfAvatarUrl={selfAvatarUrl}
          partnerAvatarUrl={partnerAvatar}
        />
      </div>

      <div className="border-t border-border px-3 py-2 md:px-4 md:py-3">
        <ChatActions canInteract={canInteract} queueState={queueState} onNext={handleNext} onSkip={skip} />
        <ChatInput disabled={!canInteract} onSendText={handleSendText} onSendImage={handleSendImage} />
      </div>

      {showDisplayNameModal && (
        <DisplayNameModal initialDisplayName={displayName} onSave={handleSaveDisplayName} />
      )}
    </div>
  );
}
