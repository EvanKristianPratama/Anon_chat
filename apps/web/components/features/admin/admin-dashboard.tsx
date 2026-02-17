"use client";

import { Activity, Gauge, SignalHigh, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { AdminMetrics } from "@anon/contracts";
import { createSocket, type AppSocket } from "@/lib/socket";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:4000";

export function AdminDashboard() {
  const socketRef = useRef<AppSocket | null>(null);

  const [adminToken, setAdminToken] = useState("");
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const connectAdmin = (): void => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setConnected(false);
    setError(null);
    setMetrics(null);

    const socket = createSocket(wsUrl, "/admin");
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("admin:subscribe", { token: adminToken });
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("admin:metrics", (payload: AdminMetrics) => {
      setMetrics(payload);
    });

    socket.on("system:error", ({ code, message }) => {
      setError(`${code}: ${message}`);
    });

    socket.connect();
  };

  return (
    <DashboardShell
      mode="admin"
      title="Admin Monitoring"
      subtitle="Observe online users, active rooms, and session health"
    >
      <div className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
        <Card className="glass-panel border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SignalHigh className="h-5 w-5" />
              Live Feed
            </CardTitle>
            <CardDescription className="font-mono text-xs">websocket: {wsUrl}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={connected ? "default" : "outline"}>
                {connected ? "connected" : "disconnected"}
              </Badge>
              <Badge variant="secondary">namespace: /admin</Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              <Input
                placeholder="Admin token"
                value={adminToken}
                onChange={(event) => setAdminToken(event.target.value)}
              />
              <Button onClick={connectAdmin}>Connect Admin Feed</Button>
            </div>

            {error ? (
              <div className="rounded-lg border border-destructive/70 bg-destructive/10 p-3 text-sm">
                {error}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard
            title="Online Users"
            value={String(metrics?.onlineUsers ?? 0)}
            icon={<Users className="h-4 w-4" />}
          />
          <MetricCard
            title="Active Rooms"
            value={String(metrics?.activeRooms ?? 0)}
            icon={<Activity className="h-4 w-4" />}
          />
          <MetricCard
            title="Avg Session (sec)"
            value={metrics ? metrics.avgSessionDurationSec.toFixed(1) : "0.0"}
            icon={<Gauge className="h-4 w-4" />}
          />
          <MetricCard
            title="Peak Online"
            value={String(metrics?.peakOnlineUsers ?? 0)}
            icon={<SignalHigh className="h-4 w-4" />}
          />
        </div>
      </div>
    </DashboardShell>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: ReactNode;
}

function MetricCard({ title, value, icon }: MetricCardProps) {
  return (
    <Card className="glass-panel border-border/70">
      <CardHeader className="pb-2">
        <CardDescription className="font-mono text-xs">{title}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <p className="font-title text-2xl font-semibold">{value}</p>
          <div className="rounded-lg border border-border/60 bg-background/40 p-2">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
