import { Header } from "@/components/header";
import { StaticLanding } from "@/components/static-landing";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <StaticLanding />
      <Footer />
    </div>
  );
}
