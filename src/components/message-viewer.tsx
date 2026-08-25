"use client";

import { ArrowLeft, Calendar, User, Loader2 } from "lucide-react";
import type { MessageFull } from "@/lib/mail-api";

interface MessageViewerProps {
  message: MessageFull | null;
  isLoading: boolean;
  onBack: () => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageViewer({ message, isLoading, onBack }: MessageViewerProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-violet-400 animate-spin mb-3" />
        <p className="text-sm text-zinc-500">Loading message...</p>
      </div>
    );
  }

  if (!message) return null;

  const htmlContent =
    message.html && message.html.length > 0
      ? message.html.join("")
      : null;

  const iframeSrcDoc = htmlContent
    ? `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 16px;
      background: #18181b;
      color: #e4e4e7;
      font-size: 14px;
      line-height: 1.6;
      word-break: break-word;
    }
    a { color: #a78bfa; }
    img { max-width: 100%; height: auto; }
    table { max-width: 100%; }
    pre, code { overflow-x: auto; max-width: 100%; }
  </style>
</head>
<body>${htmlContent}</body>
</html>`
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-800/50">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Inbox
        </button>

        <h2 className="text-lg font-semibold text-zinc-100 mb-3">
          {message.subject || "(No Subject)"}
        </h2>

        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>
              {message.from?.name && (
                <span className="text-zinc-300">{message.from.name} </span>
              )}
              <span className="text-zinc-500">
                &lt;{message.from?.address || "unknown"}&gt;
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(message.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {iframeSrcDoc ? (
          <iframe
            srcDoc={iframeSrcDoc}
            className="w-full h-full min-h-[400px] border-0"
            sandbox="allow-same-origin"
            title="Email content"
          />
        ) : (
          <div className="p-5">
            <pre className="whitespace-pre-wrap text-sm text-zinc-300 font-sans leading-relaxed">
              {message.text || "No content available."}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
