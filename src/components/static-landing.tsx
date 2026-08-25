"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Zap, Clock, Timer } from "lucide-react";
import { DURATION_OPTIONS } from "@/lib/mail-api";
import type { DurationMinutes } from "@/lib/mail-api";
import { GenerateButton } from "@/components/generate-button";

export function StaticLanding() {
  const [selectedDuration, setSelectedDuration] = useState<DurationMinutes>(5);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  const handleGenerate = () => {
    setIsRedirecting(true);
    router.push(`/mail?duration=${selectedDuration}&new=true`);
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
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

        <GenerateButton onClick={handleGenerate} isLoading={isRedirecting} />

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
  );
}
