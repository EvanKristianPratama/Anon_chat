"use client";

import { useEffect } from "react";
import { ExternalLink, Sparkles, X } from "lucide-react";

interface CreditsModalProps {
  open: boolean;
  onClose: () => void;
}

const CREDIT_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com/EvanKristianPratama",
    handle: "@EvanKristianPratama"
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/evankristiannn/",
    handle: "@evankristiannn"
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/evan-pratama-196119271/",
    handle: "evan-pratama-196119271"
  }
];

export function CreditsModal({ open, onClose }: CreditsModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onEsc);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Close credits modal"
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/55 bg-white/55 p-5 shadow-[0_24px_60px_hsl(var(--foreground)/0.26)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/10">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              Credits
            </p>
            <h3 className="mt-1 text-base font-semibold">Evan Kristian Pratama</h3>
            <p className="text-xs text-muted-foreground">Project author</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {CREDIT_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-xl border border-white/55 bg-white/60 px-3 py-2 text-sm transition-colors hover:border-primary/45 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <div className="min-w-0">
                <p className="font-medium">{link.label}</p>
                <p className="truncate text-xs text-muted-foreground">{link.handle}</p>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
            </a>
          ))}
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">Anotalk © 2026</p>
      </div>
    </div>
  );
}
