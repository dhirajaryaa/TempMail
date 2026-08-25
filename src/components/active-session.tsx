"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import type {
  TempMailSession,
  MessagePreview,
  MessageFull,
} from "@/lib/mail-api";
import { EmailDisplay } from "@/components/email-display";
import { CountdownTimer } from "@/components/countdown-timer";
import { Inbox } from "@/components/inbox";
import { MessageViewer } from "@/components/message-viewer";
import { Trash2 } from "lucide-react";

interface ActiveSessionProps {
  session: TempMailSession;
  onExpire: () => void;
  onNewEmail: () => void;
  onCancel: () => void;
  isGenerating: boolean;
}

export function ActiveSession({
  session,
  onExpire,
  onNewEmail,
  onCancel,
  isGenerating,
}: ActiveSessionProps) {
  const [messages, setMessages] = useState<MessagePreview[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<MessageFull | null>(
    null
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
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
  }, [session.token]);

  // Manual refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchMessages();
    setIsRefreshing(false);
  }, [fetchMessages]);

  // Poll every 10 seconds
  useEffect(() => {
    fetchMessages();
    pollingRef.current = setInterval(fetchMessages, 10000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchMessages]);

  // Handle expiry — also stop polling
  const handleExpire = useCallback(async () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    onExpire();
  }, [onExpire]);

  // Handle cancel session
  const handleCancelClick = async () => {
    if (confirm("Are you sure you want to delete this email session and all messages forever?")) {
      setIsCanceling(true);
      if (pollingRef.current) clearInterval(pollingRef.current);
      await onCancel();
      setIsCanceling(false);
    }
  };

  // Load full message
  const handleSelectMessage = useCallback(
    async (id: string) => {
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
    [session.token]
  );

  // Back to inbox
  const handleBack = useCallback(() => {
    setSelectedMessage(null);
    setSelectedId(null);
  }, []);

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
      <div className="animate-slide-up space-y-4 sm:space-y-6">
        {/* Status Indicator & Cancel Button Row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/20 text-success text-xs font-medium w-fit">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Active Temp Mailbox
          </div>

          <button
            onClick={handleCancelClick}
            disabled={isCanceling}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-danger border border-danger/20 bg-danger/5 hover:bg-danger/10 transition-colors disabled:opacity-50"
            title="Cancel session and delete mailbox"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Session</span>
          </button>
        </div>

        {/* Email + Timer Section */}
        <div className="grid gap-4 md:grid-cols-[1fr,auto]">
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-card-border">
            <EmailDisplay
              address={session.account.address}
              onNewEmail={onNewEmail}
              isGenerating={isGenerating}
            />
          </div>
          <div className="p-4 sm:p-5 rounded-2xl bg-card border border-card-border md:min-w-[240px] flex items-center">
            <CountdownTimer
              expiresAt={session.expiresAt}
              durationMinutes={session.durationMinutes}
              onExpire={handleExpire}
            />
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
  );
}
