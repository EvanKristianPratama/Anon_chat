"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import type { QueueState } from "@/types/chat";

interface DashboardShellProps {
  displayName: string;
  selfAvatarUrl?: string;
  queueState?: QueueState;
  partnerAlias?: string | null;
  partnerAvatar?: string | null;
  children: ReactNode;
}

export function DashboardShell({
  displayName,
  selfAvatarUrl,
  queueState = "idle",
  partnerAlias = null,
  partnerAvatar = null,
  children
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const saved = window.localStorage.getItem("anotalk_sidebar_collapsed");
    setDesktopCollapsed(saved === "1");
  }, []);

  const handleToggleDesktopCollapse = () => {
    setDesktopCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("anotalk_sidebar_collapsed", next ? "1" : "0");
      }
      return next;
    });
  };

  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <SidebarNav
        displayName={displayName}
        selfAvatarUrl={selfAvatarUrl}
        queueState={queueState}
        partnerAlias={partnerAlias}
        partnerAvatar={partnerAvatar}
        open={sidebarOpen}
        collapsed={desktopCollapsed}
        onToggleCollapse={handleToggleDesktopCollapse}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center border-b border-border px-3 py-2 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="ml-2 text-sm font-medium">Anotalk</span>
        </div>

        <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
