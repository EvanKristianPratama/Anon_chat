"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ChatContainer } from "@/components/chat/chat-container";

export function UserDashboard() {
  return (
    <DashboardShell
      mode="user"
      title="Anonymous Chat"
      subtitle="Random match, anonymous messaging"
      hideHeader
    >
      <ChatContainer />
    </DashboardShell>
  );
}
