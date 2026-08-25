"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { TempMailSession, DurationMinutes } from "@/lib/mail-api";
import { DURATION_OPTIONS } from "@/lib/mail-api";
import { Header } from "@/components/header";
import { LandingSection } from "@/components/landing-section";
import { ActiveSession } from "@/components/active-session";
import { Loader2 } from "lucide-react";

type AppState = "landing" | "active";

const STORAGE_KEY = "tempmail_session";

export function TempMailApp() {
  const [appState, setAppState] = useState<AppState>("landing");
  const [session, setSession] = useState<TempMailSession | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<DurationMinutes>(5);
  const [isRestoring, setIsRestoring] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();
  const autoCreatedRef = useRef(false);

  // Generate a new temp email session
  const generateEmail = useCallback(async (durationOverride?: DurationMinutes) => {
    setIsGenerating(true);
    setError(null);

    // Safeguard: Discard click event arguments if passed dynamically
    const durationToUse =
      typeof durationOverride === "number" ? durationOverride : selectedDuration;

    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationMinutes: durationToUse }),
      });
      if (!res.ok) throw new Error("Failed to create session");
      const data: TempMailSession = await res.json();

      setSession(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setAppState("active");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
      setAppState("landing");
    } finally {
      setIsGenerating(false);
    }
  }, [selectedDuration]);

  // Restore session or auto-create on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const shouldBypass = searchParams.get("new") === "true";

        if (stored) {
          const parsed: TempMailSession = JSON.parse(stored);
          const remaining = parsed.expiresAt - Date.now();

          if (remaining > 0 && !shouldBypass) {
            setSession(parsed);
            setAppState("active");
            setIsRestoring(false);
            return;
          } else {
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

        // Auto-create session if not restored and not already triggered this mount
        if (!autoCreatedRef.current) {
          autoCreatedRef.current = true;

          // Parse duration from URL query parameter
          const durationParam = searchParams.get("duration");
          let initialDuration: DurationMinutes = 5;
          if (durationParam) {
            const parsedMins = parseInt(durationParam, 10);
            if (DURATION_OPTIONS.includes(parsedMins as DurationMinutes)) {
              initialDuration = parsedMins as DurationMinutes;
            }
          }

          setSelectedDuration(initialDuration);
          await generateEmail(initialDuration);

          // Clear parameters from URL
          if (shouldBypass) {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("new");
            const newQuery = params.toString() ? `?${params.toString()}` : "";
            router.replace(`/mail${newQuery}`);
          }
        }
      } catch {
        // fail silently
      } finally {
        setIsRestoring(false);
      }
    };

    initSession();
  }, [searchParams, generateEmail, router]);

  // Handle session expiry — automatically redirect to home page
  const handleExpire = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEY);
    router.push("/?expired=true");

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
  }, [session, router]);

  // Cancel/Delete session manually — redirect to home page
  const handleCancel = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEY);
    router.push("/");

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
    setSession(null);
  }, [session, router]);

  // Reset/Logo click handler
  const handleLogoClick = useCallback(() => {
    if (appState === "active") {
      if (confirm("Return to home? This will keep your active mailbox running in the background.")) {
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }, [appState, router]);

  if (isRestoring || (appState === "landing" && isGenerating && !session)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-sm text-muted">Securing your disposable mailbox...</p>
        </div>
      </div>
    );
  }

  // ── LANDING (Fallback if auto-create fails) ──
  if (appState === "landing") {
    return (
      <>
        <Header onLogoClick={handleLogoClick} />
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

  // ── ACTIVE ──
  return (
    <>
      <Header sticky onLogoClick={handleLogoClick} />
      {session && (
        <ActiveSession
          session={session}
          onExpire={handleExpire}
          onNewEmail={generateEmail}
          onCancel={handleCancel}
          isGenerating={isGenerating}
        />
      )}
    </>
  );
}
