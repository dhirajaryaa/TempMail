import { TempMailApp } from "@/components/temp-mail-app";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TempMailApp />
      <Footer />
    </div>
  );
}
