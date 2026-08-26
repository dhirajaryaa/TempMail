"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, User, Loader2, Paperclip, Download } from "lucide-react";
import type { MessageFull } from "@/lib/mail-api";

interface MessageViewerProps {
  message: MessageFull | null;
  isLoading: boolean;
  onBack: () => void;
  mailboxAddress: string;
}

function parseTimestamp(timestamp: string | number): Date {
  if (!timestamp) return new Date();

  if (typeof timestamp === "number") {
    return new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
  }

  const parsed = parseInt(timestamp, 10);
  if (!isNaN(parsed) && /^\d+$/.test(timestamp)) {
    return new Date(parsed < 10000000000 ? parsed * 1000 : parsed);
  }

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return new Date();
  }
  return date;
}

function formatDate(dateVal: string | number): string {
  const date = parseTimestamp(dateVal);
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageViewer({
  message,
  isLoading,
  onBack,
  mailboxAddress,
}: MessageViewerProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const frame = requestAnimationFrame(() => {
        setIsDark(document.documentElement.classList.contains("dark"));
      });

      // Setup a MutationObserver to listen to class changes on <html> (theme toggles)
      const observer = new MutationObserver(() => {
        setIsDark(document.documentElement.classList.contains("dark"));
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });

      return () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
      };
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-accent animate-spin mb-3" />
        <p className="text-sm text-muted">Loading message...</p>
      </div>
    );
  }

  if (!message) return null;

  const htmlContent = message.html && message.html.length > 0 ? message.html : null;

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
      background: transparent;
      color: ${isDark ? "#fafafa" : "#171717"};
      font-size: 14px;
      line-height: 1.6;
      word-break: break-word;
    }
    a { color: #ff5a54; }
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
      <div className="px-5 py-4 border-b border-border">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Inbox
        </button>

        <h2 className="text-lg font-semibold text-foreground mb-3">
          {message.subject || "(No Subject)"}
        </h2>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span className="text-foreground">{message.from}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(message.timestamp)}</span>
          </div>
        </div>
      </div>

      {/* Attachments Section */}
      {message.attachments && message.attachments.length > 0 && (
        <div className="px-5 py-3 border-b border-border bg-card/30">
          <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Paperclip className="w-3.5 h-3.5 text-accent" />
            <span>Attachments ({message.attachments.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {message.attachments.map((file) => {
              const formatFileSize = (bytes: number): string => {
                if (bytes === 0) return "0 B";
                const k = 1024;
                const sizes = ["B", "KB", "MB", "GB"];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
              };

              return (
                <a
                  key={file.id}
                  href={`https://grabmail.io/api/v1/attachment/${file.id}?mailbox=${encodeURIComponent(
                    mailboxAddress
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-card-border hover:border-accent-border hover:bg-hover-bg text-sm text-foreground transition-all duration-200"
                >
                  <span className="truncate max-w-[200px] font-medium">{file.filename}</span>
                  <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
                  <Download className="w-3.5 h-3.5 text-muted-foreground ml-1 shrink-0" />
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0">
        {iframeSrcDoc ? (
          <iframe
            srcDoc={iframeSrcDoc}
            className="w-full h-full min-h-[400px] border-0 bg-transparent"
            sandbox="allow-same-origin"
            title="Email content"
          />
        ) : (
          <div className="p-5">
            <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">
              {message.text || "No content available."}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
