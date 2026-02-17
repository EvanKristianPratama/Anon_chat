"use client";

import { useState } from "react";
import { User, ShieldCheck, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AliasModalProps {
    initialAlias: string;
    onSave: (alias: string) => void;
}

export function AliasModal({ initialAlias, onSave }: AliasModalProps) {
    const [alias, setAlias] = useState(initialAlias);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (alias.trim().length >= 2) {
            onSave(alias.trim());
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-modal-in">
            <div className="glass-panel w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-card/60 shadow-2xl">
                {/* Header */}
                <div className="relative h-32 w-full bg-gradient-to-br from-primary via-primary/80 to-accent p-6">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
                    <div className="relative z-10 flex flex-col justify-end h-full">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Welcome to Anon</h2>
                        <p className="text-white/80 text-sm font-medium">Choose your secret identity</p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="alias" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                                Your Alias
                            </label>
                            <div className="relative">
                                <Input
                                    id="alias"
                                    autoFocus
                                    placeholder="Enter a fun nickname..."
                                    value={alias}
                                    onChange={(e) => setAlias(e.target.value)}
                                    maxLength={24}
                                    className="h-12 border-border/40 bg-background/40 pl-11 pr-4 rounded-xl focus:ring-primary/20 transition-all font-medium"
                                />
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-[10px] text-muted-foreground ml-1 italic">Min. 2 characters, max. 24</p>
                        </div>

                        <Button
                            disabled={alias.trim().length < 2}
                            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                        >
                            Start Chatting
                        </Button>
                    </form>

                    {/* Privacy Rules */}
                    <div className="rounded-2xl bg-muted/30 p-4 border border-border/20">
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            <span className="text-xs font-bold text-foreground">Privacy Guardrails</span>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <RuleItem icon={<Info className="h-3 w-3" />} text="Messages are not saved on the server" />
                            <RuleItem icon={<Info className="h-3 w-3" />} text="Max message length: 500 characters" />
                            <RuleItem icon={<Info className="h-3 w-3" />} text="Images are automatically deleted" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RuleItem({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div className="flex items-start gap-2.5">
            <div className="mt-0.5 rounded-full bg-primary/10 p-1 text-primary">
                {icon}
            </div>
            <span className="text-[11px] leading-tight text-muted-foreground/90 font-medium">{text}</span>
        </div>
    );
}
