"use client";

import { Inbox as InboxIcon, Mail, Paperclip, RefreshCw } from "lucide-react";
import type { MessagePreview } from "@/lib/mail-api";

interface InboxProps {
  messages: MessagePreview[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function Inbox({
  messages,
  selectedId,
  onSelect,
  onRefresh,
  isRefreshing,
}: InboxProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-4">
          <InboxIcon className="w-8 h-8 text-zinc-600" />
        </div>
        <h3 className="text-lg font-medium text-zinc-400 mb-1">
          Inbox Empty
        </h3>
        <p className="text-sm text-zinc-600 text-center max-w-xs">
          Waiting for incoming emails... Messages will appear here
          automatically.
        </p>
        <div className="flex items-center gap-3 mt-4">
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Auto-refresh every 10s
          </div>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-violet-400 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-violet-500/30 transition-all disabled:opacity-50"
            title="Refresh inbox now"
          >
            <RefreshCw
              className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-zinc-800/50">
      <div className="px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-violet-400" />
          <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
            Inbox
          </span>
          <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
            {messages.length} {messages.length === 1 ? "message" : "messages"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-600">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Auto 10s
          </div>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-violet-400 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-violet-500/30 transition-all disabled:opacity-50"
            title="Refresh inbox now"
          >
            <RefreshCw
              className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>
      {messages.map((msg) => (
        <button
          key={msg.id}
          onClick={() => onSelect(msg.id)}
          className={`w-full text-left px-5 py-4 hover:bg-zinc-800/30 transition-colors ${
            selectedId === msg.id ? "bg-zinc-800/50" : ""
          } ${!msg.seen ? "border-l-2 border-violet-500" : "border-l-2 border-transparent"}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-sm truncate ${
                    !msg.seen
                      ? "font-semibold text-zinc-100"
                      : "text-zinc-300"
                  }`}
                >
                  {msg.from?.name || msg.from?.address || "Unknown Sender"}
                </span>
                {msg.hasAttachments && (
                  <Paperclip className="w-3 h-3 text-zinc-500 shrink-0" />
                )}
              </div>
              <p
                className={`text-sm truncate mb-1 ${
                  !msg.seen ? "text-zinc-200" : "text-zinc-400"
                }`}
              >
                {msg.subject || "(No Subject)"}
              </p>
              <p className="text-xs text-zinc-600 truncate">
                {msg.intro || "No preview available"}
              </p>
            </div>
            <span className="text-xs text-zinc-600 shrink-0 mt-0.5">
              {formatTime(msg.createdAt)}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
