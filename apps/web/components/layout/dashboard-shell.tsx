"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { SidebarNav } from "@/components/layout/sidebar-nav";

interface DashboardShellProps {
  displayName: string;
  children: ReactNode;
}

export function DashboardShell({ displayName, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <SidebarNav
        displayName={displayName}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex items-center border-b border-border px-3 py-2 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="ml-2 text-sm font-medium">Anon Chat</span>
        </div>

        <main className="flex flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
