"use client";

import { Zap, Loader2 } from "lucide-react";

interface GenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export function GenerateButton({ onClick, isLoading }: GenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-semibold text-white bg-accent rounded-2xl hover:bg-accent-hover transition-colors duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Zap className="w-5 h-5" />
          Generate Temporary Email
        </>
      )}
    </button>
  );
}
