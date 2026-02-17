"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ChatContainer } from "@/components/chat/chat-container";
import { readStoredDisplayName } from "@/lib/user-preferences";
import {
  createDefaultAvatarPreference,
  readStoredAvatarPreference,
  resolveAvatarUrl,
  type AvatarPreference
} from "@/lib/avatar";
import type { QueueState } from "@/types/chat";

export function UserDashboard() {
  const [displayName, setDisplayName] = useState("");
  const [showDisplayNameModal, setShowDisplayNameModal] = useState(true);
  const [queueState, setQueueState] = useState<QueueState>("idle");
  const [partnerAlias, setPartnerAlias] = useState<string | null>(null);
  const [partnerAvatar, setPartnerAvatar] = useState<string | null>(null);
  const [avatarPreference, setAvatarPreference] = useState<AvatarPreference>(
    createDefaultAvatarPreference()
  );

  useEffect(() => {
    const savedName = readStoredDisplayName();
    if (savedName.length > 0) {
      setDisplayName(savedName);
      setShowDisplayNameModal(false);
    } else {
      setShowDisplayNameModal(true);
    }

    const savedAvatar = readStoredAvatarPreference(savedName);
    setAvatarPreference(savedAvatar);
  }, []);

  const selfAvatarUrl = resolveAvatarUrl(avatarPreference);

  return (
    <DashboardShell
      displayName={displayName}
      selfAvatarUrl={selfAvatarUrl}
      queueState={queueState}
      partnerAlias={partnerAlias}
      partnerAvatar={partnerAvatar}
    >
      <ChatContainer
        displayName={displayName}
        setDisplayName={setDisplayName}
        avatarPreference={avatarPreference}
        selfAvatarUrl={selfAvatarUrl}
        showDisplayNameModal={showDisplayNameModal}
        setShowDisplayNameModal={setShowDisplayNameModal}
        onSessionStateChange={({
          queueState: nextState,
          partnerAlias: nextPartnerAlias,
          partnerAvatar: nextPartnerAvatar
        }) => {
          setQueueState(nextState);
          setPartnerAlias(nextPartnerAlias);
          setPartnerAvatar(nextPartnerAvatar);
        }}
      />
    </DashboardShell>
  );
}
