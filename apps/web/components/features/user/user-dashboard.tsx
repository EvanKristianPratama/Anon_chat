"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ChatContainer } from "@/components/chat/chat-container";
import { useState } from "react";

export function UserDashboard() {
  const [displayName, setDisplayName] = useState("");

  return (
    <DashboardShell displayName={displayName}>
      <ChatContainer displayName={displayName} setDisplayName={setDisplayName} />
    </DashboardShell>
  );
}
