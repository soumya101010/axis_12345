"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

export default function AnalyticsTracker() {
    const { data: session } = useSession();
    const sessionIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (!session?.user?.email) return;

        const startSession = async () => {
            try {
                const res = await fetch("/api/session/start", { method: "POST" });
                const data = await res.json();
                if (data.sessionId) {
                    sessionIdRef.current = data.sessionId;
                }
            } catch (error) {
                console.error("Failed to start session:", error);
            }
        };

        const endSession = async () => {
            if (!sessionIdRef.current) return;
            try {
                // Use sendBeacon for reliable end session tracking on close
                const blob = new Blob([JSON.stringify({ sessionId: sessionIdRef.current })], { type: 'application/json' });
                navigator.sendBeacon("/api/session/end", blob);
            } catch (error) {
                console.error("Failed to end session:", error);
            }
        };

        const ping = async () => {
            if (!sessionIdRef.current) return;
            try {
                await fetch("/api/session/ping", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sessionId: sessionIdRef.current }),
                });
            } catch (error) {
                console.error("Failed to ping session:", error);
            }
        };

        startSession();
        const interval = setInterval(ping, 30000); // 30 seconds

        window.addEventListener("beforeunload", endSession);

        return () => {
            clearInterval(interval);
            endSession();
            window.removeEventListener("beforeunload", endSession);
        };
    }, [session]);

    return null;
}
