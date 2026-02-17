import type { ReactNode } from "react";
import { ArrowRightLeft, Shield, Sparkles } from "lucide-react";
import { SidebarNav, type SidebarItem } from "@/components/layout/sidebar-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";

interface DashboardShellProps {
  mode: "user" | "admin";
  title: string;
  subtitle: string;
  hideHeader?: boolean;
  children: ReactNode;
}

const userItems: SidebarItem[] = [
  {
    href: "/",
    label: "User Chat",
    icon: ArrowRightLeft
  },
  {
    href: "/admin",
    label: "Admin Monitor",
    icon: Shield
  }
];

const adminItems: SidebarItem[] = [
  {
    href: "/admin",
    label: "Admin Monitor",
    icon: Shield
  },
  {
    href: "/",
    label: "User Chat",
    icon: ArrowRightLeft
  }
];

export function DashboardShell({
  mode,
  title,
  subtitle,
  hideHeader = false,
  children
}: DashboardShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-5 md:px-6 md:py-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-80px] top-[-60px] h-[320px] w-[320px] rounded-full bg-cyan-400/30 blur-3xl dark:bg-cyan-500/20" />
        <div className="absolute bottom-[-120px] right-[-60px] h-[360px] w-[360px] rounded-full bg-blue-500/25 blur-3xl dark:bg-indigo-500/20" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl gap-4 lg:grid-cols-[260px_1fr]">
        <SidebarNav mode={mode} items={mode === "user" ? userItems : adminItems} />

        <div className="glass-panel min-h-[85vh] rounded-2xl border p-4 md:p-6">
          {hideHeader ? null : (
            <header className="mb-5 flex flex-col gap-4 border-b border-border/60 pb-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    {mode === "user" ? "User Zone" : "Admin Zone"}
                  </Badge>
                </div>
                <h1 className="font-title text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
                <p className="font-mono text-xs text-muted-foreground md:text-sm">{subtitle}</p>
              </div>

              <ThemeToggle />
            </header>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
