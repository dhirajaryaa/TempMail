"use client";

import { useState } from "react";
import { Copy, Check, Mail, RefreshCw } from "lucide-react";

interface EmailDisplayProps {
  address: string;
  onNewEmail: () => void;
  isGenerating: boolean;
}

export function EmailDisplay({
  address,
  onNewEmail,
  isGenerating,
}: EmailDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="w-4 h-4 text-accent" />
        <span className="text-xs text-muted uppercase tracking-wider font-medium">
          Your Temporary Email
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center bg-input-bg border border-input-border rounded-xl px-4 py-3 group hover:border-accent-border transition-colors">
          <span className="flex-1 font-mono text-sm sm:text-base text-foreground truncate select-all">
            {address}
          </span>
          <button
            onClick={handleCopy}
            className="ml-2 p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-hover-bg transition-all shrink-0"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
        <button
          onClick={onNewEmail}
          disabled={isGenerating}
          className="p-4 rounded-xl bg-input-bg border border-input-border text-muted hover:text-accent hover:border-accent-border transition-all disabled:opacity-50 shrink-0"
          title="Generate new email"
        >
          <RefreshCw
            className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`}
          />
        </button>
      </div>
      {copied && (
        <p className="text-xs text-success mt-2 flex items-center gap-1">
          <Check className="w-3 h-3" />
          Copied to clipboard!
        </p>
      )}
    </div>
  );
}
