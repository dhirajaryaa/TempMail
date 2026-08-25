import { Suspense } from "react";
import { Header } from "@/components/header";
import { StaticLanding } from "@/components/static-landing";
import { Footer } from "@/components/footer";
import { Loader2 } from "lucide-react";

function StaticLandingFallback() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 text-accent animate-spin" />
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <Suspense fallback={<StaticLandingFallback />}>
        <StaticLanding />
      </Suspense>
      <Footer />
    </div>
  );
}
