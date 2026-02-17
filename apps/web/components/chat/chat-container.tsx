"use client";

import { useEffect, useState } from "react";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatActions } from "@/components/chat/chat-actions";
import { DisplayNameModal } from "@/components/chat/display-name-modal";

export function ChatContainer() {
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

    const [displayName, setDisplayName] = useState("");
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
    }, []);

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
        <>
            <div className="flex h-[calc(100vh-6rem)] flex-col gap-3 md:h-[82vh]">
                <ChatHeader
                    displayName={displayName}
                    partnerId={partnerId}
                    partnerAlias={partnerAlias}
                    connected={connected}
                    queueState={queueState}
                    onEditDisplayName={() => setShowDisplayNameModal(true)}
                />

                <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />

                <ChatMessages messages={messages} displayName={displayName} />

                <div className="space-y-3">
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
            </div>

            {showDisplayNameModal && (
                <DisplayNameModal initialDisplayName={displayName} onSave={handleSaveDisplayName} />
            )}
        </>
    );
}
