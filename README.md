# 📧 TempMail

> Instant disposable email addresses on `@linqmail.com`. No signup. No data stored. Choose your session duration.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- **🚀 One-Click Generation** — Get a realistic temporary email on `@linqmail.com` instantly
- **📬 Live Inbox** — Auto-polls for new messages every 10 seconds
- **⏱️ Choosable Duration** — Select 5, 10, 15, or 30-minute sessions before generating
- **📖 Message Viewer** — Read full email content (HTML rendered safely, supports light/dark contrast)
- **📋 Copy to Clipboard** — One click to copy your temp address
- **🔒 Privacy-First** — No signup, no tracking, direct browser-to-API communication
- **☀️ Light & Dark Theme** — System preference + manual toggling support with brand `#ff5a54` accent
- **More Tools link** — Quick access to other tools on `tools.dhirajarya.in`

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: [Lucide React](https://lucide.dev/)
- **Email API**: [GrabMail](https://grabmail.io/) ([API Docs](https://grabmail.io/docs/api))
- **Package Manager**: [Bun](https://bun.sh/)
- **Analytics**: Vercel Web Analytics

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/) 1.0+
- No API keys needed — GrabMail is free and open

### Installation

```bash
# Clone the repository
git clone https://github.com/dhirajaryaa/TempMail.git
cd tempmail

# Install dependencies
bun install

# Start development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
bun run build
bun start
```

## 📁 Project Structure

```
tempmail/
├── src/
│   ├── app/
│   │   ├── mail/             # Client-side dynamic /mail route
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Purely static landing page
│   │   ├── robots.ts          # SEO Crawler robots config
│   │   └── sitemap.ts         # Dynamic sitemap generator
│   ├── components/
│   │   ├── active-session.tsx  # Dynamic mailbox lifecycle
│   │   ├── countdown-timer.tsx
│   │   ├── email-display.tsx
│   │   ├── error-boundary.tsx
│   │   ├── footer.tsx         # Static footer component
│   │   ├── generate-button.tsx
│   │   ├── header.tsx         # Reusable responsive header
│   │   ├── inbox.tsx
│   │   ├── message-viewer.tsx
│   │   ├── static-landing.tsx  # Static landing wrapper
│   │   └── theme-toggle.tsx   # Light/dark toggle button
│   └── lib/
│       ├── config.ts          # Dynamic site domain configuration
│       └── mail-api.ts        # GrabMail API service layer
├── PRD.md                     # Product Requirements Document
├── package.json
└── README.md
```

## 🔄 How It Works

```
User selects duration (5/10/15/30m) & clicks "Generate" on homepage (/)
                     │
                     ▼
             Route to /mail
                     │
                     ├── LocalStorage check (restores session if active)
                     └── Fetch grabmail.io/api/v1/mailbox  (pick username@linqmail.com)
                     │
                     ▼
             Active Session
                     │
                     ├── Poll grabmail.io/api/v1/mailbox every 10s directly from browser
                     ├── Click message → Fetch grabmail.io/api/v1/message/{id}
                     └── Timer counts down
                     │
                     ▼
             Session Expires / Delete Clicked
                     │
                     └── Purge storage and redirect back to homepage (/)
```

## 🎨 Design

- **Color Scheme**: Zinc light/dark backgrounds with brand accent `#ff5a54` (no gradients)
- **Typography**: Geist Sans & Geist Mono (from Next.js)
- **Layout**: Centered, responsive, mobile-friendly

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

## 🙏 Credits

- Developed by [Dhiraj Arya](https://dhirajarya.in)
- Email service powered by [GrabMail](https://grabmail.io/)
- Built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/)
