"use client";

import { Clock } from "lucide-react";
import { GenerateButton } from "@/components/generate-button";

interface ExpiredSectionProps {
  onRegenerate: () => void;
  isGenerating: boolean;
}

export function ExpiredSection({
  onRegenerate,
  isGenerating,
}: ExpiredSectionProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-card border border-card-border flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-muted" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-foreground">
          Session Expired
        </h2>
        <p className="text-muted mb-8">
          Your temporary email has been deleted. All received messages are gone
          forever.
        </p>

        <GenerateButton onClick={onRegenerate} isLoading={isGenerating} />
      </div>
    </div>
  );
}
