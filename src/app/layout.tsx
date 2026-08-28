import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/config";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TempMail - Instant Disposable Email",
  description:
    "Generate a temporary, realistic email address instantly. No registration, no spam. Receive incoming emails privately. Free disposable email service by Dhiraj Arya.",
  keywords: [
    "temp mail",
    "temporary email",
    "disposable email",
    "anonymous email",
    "fake email",
    "trash mail",
    "burn mail",
    "free tools",
    "dhiraj arya",
  ],
  authors: [{ name: "Dhiraj Arya", url: "https://dhirajarya.in" }],
  creator: "Dhiraj Arya",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "TempMail - Instant Disposable Email",
    description:
      "Generate a temporary, realistic email address instantly. No registration, no spam. Receive incoming emails privately. Free disposable email service by Dhiraj Arya.",
    url: SITE_URL,
    siteName: "TempMail",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TempMail - Instant Disposable Email",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TempMail - Instant Disposable Email",
    description:
      "Generate a temporary, realistic email address instantly. No registration, no spam. Receive incoming emails privately. Free disposable email service by Dhiraj Arya.",
    images: ["/og-image.png"],
    creator: "@dhirajaryaa",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
