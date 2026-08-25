import { TempMailApp } from "@/components/temp-mail-app";
import { Footer } from "@/components/footer";
import { ErrorBoundary } from "@/components/error-boundary";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ErrorBoundary>
        <TempMailApp />
      </ErrorBoundary>
      <Footer />
    </div>
  );
}
