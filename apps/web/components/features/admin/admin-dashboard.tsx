"use client";

import { Activity, Gauge, SignalHigh, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { AdminMetrics } from "@anon/contracts";
import { parseWsEnvelope, sendWsEvent, toWebSocketUrl } from "@/lib/ws";
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

const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:8787";
const adminSocketUrl = toWebSocketUrl(wsBaseUrl, "/admin/ws");

export function AdminDashboard() {
  const socketRef = useRef<WebSocket | null>(null);

  const [adminToken, setAdminToken] = useState("");
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, []);

  const connectAdmin = (): void => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setConnected(false);
    setError(null);
    setMetrics(null);

    const socket = new WebSocket(adminSocketUrl);
    socketRef.current = socket;

    const onOpen = () => {
      setConnected(true);
      sendWsEvent(socket, "admin:subscribe", { token: adminToken });
    };

    const onClose = () => {
      setConnected(false);
    };

    const onMessage = (event: MessageEvent) => {
      const envelope = parseWsEnvelope(event.data);
      if (!envelope) {
        return;
      }

      if (envelope.event === "admin:metrics") {
        setMetrics(envelope.payload as AdminMetrics);
        return;
      }

      if (envelope.event === "system:error") {
        const payload = envelope.payload as { code: string; message: string };
        setError(`${payload.code}: ${payload.message}`);
      }
    };

    socket.addEventListener("open", onOpen);
    socket.addEventListener("close", onClose);
    socket.addEventListener("message", onMessage);
  };

  return (
    <DashboardShell displayName="Admin">
      <div className="flex-1 overflow-auto p-4">
        <div className="mb-4">
          <h1 className="text-lg font-semibold">Admin Monitoring</h1>
          <p className="text-xs text-muted-foreground">Observe online users, active rooms, and session health</p>
        </div>
        <div className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SignalHigh className="h-5 w-5" />
              Live Feed
            </CardTitle>
            <CardDescription className="font-mono text-xs">websocket: {adminSocketUrl}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={connected ? "default" : "outline"}>
                {connected ? "connected" : "disconnected"}
              </Badge>
              <Badge variant="secondary">role: admin</Badge>
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
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="font-mono text-xs">{title}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <p className="text-2xl font-semibold">{value}</p>
          <div className="rounded-lg border border-border p-2">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
