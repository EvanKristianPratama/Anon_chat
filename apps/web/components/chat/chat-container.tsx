"use client";

import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatActions } from "@/components/chat/chat-actions";
import { DisplayNameModal } from "@/components/chat/display-name-modal";

interface ChatContainerProps {
    displayName: string;
    setDisplayName: Dispatch<SetStateAction<string>>;
}

export function ChatContainer({ displayName, setDisplayName }: ChatContainerProps) {
    const {
        connected,
        queueState,
        partnerId,
        partnerAlias,
        messages,
        joinQueue,
        skip,
        sendText,
        sendImage,
    } = useChatSocket();

    const [showDisplayNameModal, setShowDisplayNameModal] = useState(true);

    useEffect(() => {
        const saved =
            window.localStorage.getItem("anon_display_name") ??
            window.localStorage.getItem("anon_alias");

        if (saved && saved.trim().length > 0) {
            const normalized = saved.trim().slice(0, 24);
            setDisplayName(normalized);
            setShowDisplayNameModal(false);
        }
    }, [setDisplayName]);

    const canInteract = connected && !showDisplayNameModal && displayName.length > 0;

    const handleSaveDisplayName = (newDisplayName: string) => {
        setDisplayName(newDisplayName);
        setShowDisplayNameModal(false);
        window.localStorage.setItem("anon_display_name", newDisplayName);
        window.localStorage.setItem("anon_alias", newDisplayName);
    };

    const handleNext = () => {
        if (!displayName) {
            setShowDisplayNameModal(true);
            return;
        }
        joinQueue(displayName);
    };

    const handleSendText = (text: string) => {
        if (!canInteract) return;
        sendText(text, displayName);
    };

    const handleSendImage = (file: File) => {
        if (!canInteract) return;
        void sendImage(file, displayName);
    };

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <ChatHeader
                displayName={displayName}
                partnerId={partnerId}
                partnerAlias={partnerAlias}
                connected={connected}
                queueState={queueState}
                onEditDisplayName={() => setShowDisplayNameModal(true)}
            />

            <div className="min-h-0 flex-1 overflow-hidden">
                <ChatMessages messages={messages} displayName={displayName} />
            </div>

            <div className="border-t border-border px-3 py-2 md:px-4 md:py-3">
                <ChatActions
                    canInteract={canInteract}
                    queueState={queueState}
                    onNext={handleNext}
                    onSkip={skip}
                />
                <ChatInput
                    disabled={!canInteract}
                    onSendText={handleSendText}
                    onSendImage={handleSendImage}
                />
            </div>

            {showDisplayNameModal && (
                <DisplayNameModal initialDisplayName={displayName} onSave={handleSaveDisplayName} />
            )}
        </div>
    );
}
