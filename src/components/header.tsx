"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface HeaderProps {
  sticky?: boolean;
  statusIndicator?: React.ReactNode;
}

export function Header({ sticky, statusIndicator }: HeaderProps) {
  return (
    <header
      className={`border-b border-border ${
        sticky ? "sticky top-0 bg-header-bg backdrop-blur-xl z-10" : ""
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="TempMail"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="font-semibold text-lg text-foreground">
            TempMail
          </span>
        </div>
        <div className="flex items-center gap-3">
          {statusIndicator}
          <a
            href="https://tools.dhirajarya.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-accent border border-accent-border hover:bg-accent-muted transition-colors"
          >
            More Tools
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
