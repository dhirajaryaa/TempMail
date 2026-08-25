"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface CountdownTimerProps {
  expiresAt: number;
  durationMinutes: number;
  onExpire: () => void;
}

export function CountdownTimer({
  expiresAt,
  durationMinutes,
  onExpire,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const update = () => {
      const remaining = Math.max(0, expiresAt - Date.now());
      setTimeLeft(remaining);
      if (remaining <= 0) {
        onExpire();
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const totalSeconds = Math.floor(timeLeft / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const totalDurationMs = durationMinutes * 60 * 1000;
  const progress = (timeLeft / totalDurationMs) * 100;
  const isLow = totalSeconds <= 60;
  const isCritical = totalSeconds <= 30;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isCritical ? (
            <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
          ) : (
            <Clock
              className={`w-4 h-4 ${isLow ? "text-amber-400" : "text-emerald-400"}`}
            />
          )}
          <span className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
            Time Remaining
          </span>
        </div>
        <span
          className={`font-mono text-lg font-bold tabular-nums ${
            isCritical
              ? "text-red-400 animate-pulse"
              : isLow
                ? "text-amber-400"
                : "text-emerald-400"
          }`}
        >
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
      </div>
      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            isCritical
              ? "bg-red-500"
              : isLow
                ? "bg-amber-500"
                : "bg-emerald-500"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
