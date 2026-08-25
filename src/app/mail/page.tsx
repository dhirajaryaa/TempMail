import { Suspense } from "react";
import { TempMailApp } from "@/components/temp-mail-app";
import { Footer } from "@/components/footer";
import { ErrorBoundary } from "@/components/error-boundary";
import { Loader2 } from "lucide-react";

function MailAppFallback() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <p className="text-sm text-muted">Initializing disposable mailbox...</p>
      </div>
    </div>
  );
}

export default function MailPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ErrorBoundary>
        <Suspense fallback={<MailAppFallback />}>
          <TempMailApp />
        </Suspense>
      </ErrorBoundary>
      <Footer />
    </div>
  );
}
