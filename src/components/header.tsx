"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface HeaderProps {
  sticky?: boolean;
}

export function Header({ sticky }: HeaderProps) {
  return (
    <header
      className={`border-b border-border bg-background ${
        sticky ? "sticky top-0 bg-header-bg backdrop-blur-xl z-10" : ""
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo.png"
            alt="TempMail Logo"
            width={32}
            height={32}
            className="rounded-lg w-7 h-7 sm:w-8 sm:h-8"
          />
          <span className="font-semibold text-base sm:text-lg text-foreground">
            TempMail
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://tools.dhirajarya.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium text-accent border border-accent-border hover:bg-accent-muted transition-colors shrink-0"
          >
            <span>More Tools</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
