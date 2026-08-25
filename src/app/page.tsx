"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Shield, Zap, Clock, Timer } from "lucide-react";
import Image from "next/image";
import type {
  TempMailSession,
  MessagePreview,
  MessageFull,
  DurationMinutes,
} from "@/lib/mail-api";
import { DURATION_OPTIONS } from "@/lib/mail-api";
import { EmailDisplay } from "@/components/email-display";
import { CountdownTimer } from "@/components/countdown-timer";
import { Inbox } from "@/components/inbox";
import { MessageViewer } from "@/components/message-viewer";
import { GenerateButton } from "@/components/generate-button";
import { ThemeToggle } from "@/components/theme-toggle";

type AppState = "landing" | "active" | "expired";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("landing");
  const [session, setSession] = useState<TempMailSession | null>(null);
  const [messages, setMessages] = useState<MessagePreview[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<MessageFull | null>(
    null
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<DurationMinutes>(5);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate a new temp email session
  const generateEmail = useCallback(
    async (duration?: DurationMinutes) => {
      setIsGenerating(true);
      setError(null);
      setMessages([]);
      setSelectedMessage(null);
      setSelectedId(null);

      const durationToUse = duration ?? selectedDuration;

      try {
        const res = await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ durationMinutes: durationToUse }),
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
    },
    [selectedDuration]
  );

  // Fetch messages function (reusable for polling + manual refresh)
  const fetchMessages = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch("/api/messages", {
        headers: { "x-mail-token": session.token },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch {
      // silently fail on polling errors
    }
  }, [session]);

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchMessages();
    setIsRefreshing(false);
  }, [fetchMessages]);

  // Poll for new messages every 10 seconds
  useEffect(() => {
    if (appState !== "active" || !session) return;

    fetchMessages();
    pollingRef.current = setInterval(fetchMessages, 10000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [appState, session, fetchMessages]);

  // Load full message when selected
  const handleSelectMessage = useCallback(
    async (id: string) => {
      if (!session) return;
      setSelectedId(id);
      setIsLoadingMessage(true);
      try {
        const res = await fetch(`/api/messages/${id}`, {
          headers: { "x-mail-token": session.token },
        });
        if (res.ok) {
          const data = await res.json();
          setSelectedMessage(data);
        }
      } catch {
        // fail silently
      } finally {
        setIsLoadingMessage(false);
      }
    },
    [session]
  );

  // Handle session expiry
  const handleExpire = useCallback(async () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
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

  // Handle back from message view
  const handleBack = useCallback(() => {
    setSelectedMessage(null);
    setSelectedId(null);
  }, []);

  // ── FOOTER COMPONENT ──
  const Footer = () => (
    <footer className="border-t border-border py-4">
      <div className="max-w-5xl mx-auto px-4 text-center text-xs text-muted-foreground">
        Free Tools Collection by{" "}
        <a
          href="https://github.com/dhirajaryaa"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-accent-hover transition-colors font-medium"
        >
          @dhirajaryaa
        </a>
      </div>
    </footer>
  );

  // ── LANDING STATE ──
  if (appState === "landing") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="border-b border-border">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="TempMail" width={32} height={32} className="rounded-lg" />
              <span className="font-semibold text-lg text-foreground">TempMail</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="max-w-2xl w-full text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-muted border border-accent-border text-accent text-xs font-medium mb-6">
              <Shield className="w-3 h-3" />
              Privacy-first • No signup required
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4 text-foreground">
              Instant Disposable Email
            </h1>

            <p className="text-lg text-muted mb-8 max-w-lg mx-auto">
              Generate a temporary email address in one click. Receive emails
              instantly. No registration, no data stored.
            </p>

            {/* Duration Picker */}
            <div className="flex flex-col items-center gap-3 mb-8">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Timer className="w-4 h-4 text-accent" />
                <span className="font-medium">Choose Duration</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {DURATION_OPTIONS.map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setSelectedDuration(mins)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                      selectedDuration === mins
                        ? "bg-accent border-accent text-white"
                        : "bg-card border-card-border text-muted hover:border-accent-border hover:text-foreground"
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
                {error}
              </div>
            )}

            <GenerateButton onClick={() => generateEmail()} isLoading={isGenerating} />

            <div className="grid grid-cols-3 gap-6 mt-16 text-sm">
              <div className="flex flex-col items-center gap-2 text-muted">
                <Zap className="w-5 h-5 text-accent" />
                <span>Instant Setup</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-muted">
                <Clock className="w-5 h-5 text-accent" />
                <span>Custom Duration</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-muted">
                <Shield className="w-5 h-5 text-accent" />
                <span>100% Private</span>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // ── EXPIRED STATE ──
  if (appState === "expired") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="max-w-md w-full text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-card border border-card-border flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-muted" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">Session Expired</h2>
            <p className="text-muted mb-8">
              Your temporary email has been deleted. All received messages are
              gone forever.
            </p>

            <GenerateButton
              onClick={() => {
                setAppState("landing");
                generateEmail();
              }}
              isLoading={isGenerating}
            />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── ACTIVE STATE ──
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border sticky top-0 bg-header-bg backdrop-blur-xl z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="TempMail" width={28} height={28} className="rounded-lg" />
            <span className="font-semibold text-foreground">TempMail</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-muted">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Active Session
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <div className="animate-slide-up space-y-6">
          {/* Email + Timer Section */}
          <div className="grid gap-4 md:grid-cols-[1fr,auto]">
            <div className="p-5 rounded-2xl bg-card border border-card-border">
              {session && (
                <EmailDisplay
                  address={session.account.address}
                  onNewEmail={() => generateEmail()}
                  isGenerating={isGenerating}
                />
              )}
            </div>
            <div className="p-5 rounded-2xl bg-card border border-card-border md:min-w-[240px]">
              {session && (
                <CountdownTimer
                  expiresAt={session.expiresAt}
                  durationMinutes={session.durationMinutes}
                  onExpire={handleExpire}
                />
              )}
            </div>
          </div>

          {/* Inbox / Message Viewer */}
          <div className="rounded-2xl bg-card border border-card-border min-h-[400px]">
            {selectedMessage || isLoadingMessage ? (
              <MessageViewer
                message={selectedMessage}
                isLoading={isLoadingMessage}
                onBack={handleBack}
              />
            ) : (
              <Inbox
                messages={messages}
                selectedId={selectedId}
                onSelect={handleSelectMessage}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
