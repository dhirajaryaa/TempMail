"use client";

import { useState, useCallback, useEffect } from "react";
import type { TempMailSession, DurationMinutes } from "@/lib/mail-api";
import { Header } from "@/components/header";
import { LandingSection } from "@/components/landing-section";
import { ActiveSession } from "@/components/active-session";
import { ExpiredSection } from "@/components/expired-section";
import { Loader2 } from "lucide-react";

type AppState = "landing" | "active" | "expired";

const STORAGE_KEY = "tempmail_session";

export function TempMailApp() {
  const [appState, setAppState] = useState<AppState>("landing");
  const [session, setSession] = useState<TempMailSession | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<DurationMinutes>(5);
  const [isRestoring, setIsRestoring] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: TempMailSession = JSON.parse(stored);
          const remaining = parsed.expiresAt - Date.now();

          if (remaining > 0) {
            setSession(parsed);
            setAppState("active");
          } else {
            // Already expired — clean up storage + trigger background delete
            localStorage.removeItem(STORAGE_KEY);
            await fetch("/api/cleanup", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                token: parsed.token,
                accountId: parsed.account.id,
              }),
            }).catch(() => {});
          }
        }
      } catch {
        // fail silently on parse errors
      } finally {
        setIsRestoring(false);
      }
    };

    restoreSession();
  }, []);

  // Generate a new temp email session
  const generateEmail = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationMinutes: selectedDuration }),
      });
      if (!res.ok) throw new Error("Failed to create session");
      const data: TempMailSession = await res.json();

      // Save to state and localStorage
      setSession(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setAppState("active");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setIsGenerating(false);
    }
  }, [selectedDuration]);

  // Handle session expiry + cleanup
  const handleExpire = useCallback(async () => {
    setAppState("expired");
    localStorage.removeItem(STORAGE_KEY);

    if (session) {
      try {
        await fetch("/api/cleanup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: session.token,
            accountId: session.account.id,
          }),
        });
      } catch {
        // best effort cleanup
      }
    }
  }, [session]);

  // Regenerate from expired state
  const handleRegenerate = useCallback(() => {
    setAppState("landing");
    generateEmail();
  }, [generateEmail]);

  if (isRestoring) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  // ── LANDING ──
  if (appState === "landing") {
    return (
      <>
        <Header />
        <LandingSection
          selectedDuration={selectedDuration}
          onDurationChange={setSelectedDuration}
          onGenerate={generateEmail}
          isGenerating={isGenerating}
          error={error}
        />
      </>
    );
  }

  // ── EXPIRED ──
  if (appState === "expired") {
    return (
      <>
        <Header />
        <ExpiredSection
          onRegenerate={handleRegenerate}
          isGenerating={isGenerating}
        />
      </>
    );
  }

  // ── ACTIVE ──
  return (
    <>
      <Header sticky />
      {session && (
        <ActiveSession
          session={session}
          onExpire={handleExpire}
          onNewEmail={generateEmail}
          isGenerating={isGenerating}
        />
      )}
    </>
  );
}
