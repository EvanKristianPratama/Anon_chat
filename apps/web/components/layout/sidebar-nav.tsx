"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface SidebarItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarNavProps {
  mode: "user" | "admin";
  items: SidebarItem[];
}

export function SidebarNav({ mode, items }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <aside className="glass-panel rounded-2xl border p-4 md:p-5">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl border border-border/60 bg-background/50 p-2">
          {mode === "user" ? <LogIn className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        </div>

        <div>
          <p className="font-title text-sm font-semibold">Anon CB</p>
          <p className="font-mono text-xs text-muted-foreground">Realtime console</p>
        </div>
      </div>

      <Badge variant="outline" className="mb-4">
        {mode === "user" ? "User dashboard" : "Admin dashboard"}
      </Badge>

      <nav className="space-y-2">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition",
                active
                  ? "border-primary/70 bg-primary/10 text-foreground"
                  : "border-border/60 bg-background/30 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
