"use client";

import { useState, useCallback } from "react";
import type { TempMailSession, DurationMinutes } from "@/lib/mail-api";
import { Header } from "@/components/header";
import { LandingSection } from "@/components/landing-section";
import { ActiveSession } from "@/components/active-session";
import { ExpiredSection } from "@/components/expired-section";

type AppState = "landing" | "active" | "expired";

export function TempMailApp() {
  const [appState, setAppState] = useState<AppState>("landing");
  const [session, setSession] = useState<TempMailSession | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<DurationMinutes>(5);

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
      setSession(data);
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

  // Status indicator for active header
  const activeIndicator = (
    <div className="flex items-center gap-2 text-xs text-muted">
      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
      Active Session
    </div>
  );

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
      <Header sticky statusIndicator={activeIndicator} />
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
