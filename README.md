# 📧 TempMail

> Instant disposable email addresses. No signup. No data stored. 5-minute sessions.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- **🚀 One-Click Generation** — Get a random temporary email instantly
- **📬 Live Inbox** — Auto-polls for new messages every 5 seconds
- **⏱️ 5-Minute Timer** — Visual countdown with color-coded urgency
- **📖 Message Viewer** — Read full email content (HTML rendered safely)
- **📋 Copy to Clipboard** — One click to copy your temp address
- **🔒 Privacy-First** — No signup, no tracking, accounts auto-deleted
- **🌙 Dark Theme** — Beautiful dark UI with violet accents

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 16+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: [Lucide React](https://lucide.dev/)
- **Email API**: [Mail.tm](https://mail.tm/) ([API Docs](https://docs.mail.tm/))
- **Package Manager**: [Bun](https://bun.sh/)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/) 1.0+
- No API keys needed — Mail.tm is free and open

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
│   │   ├── api/
│   │   │   ├── session/       # POST - Create temp email session
│   │   │   │   └── route.ts
│   │   │   ├── messages/      # GET - Fetch inbox messages
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/      # GET - Fetch single message
│   │   │   │       └── route.ts
│   │   │   └── cleanup/       # POST - Delete account on expiry
│   │   │       └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx           # Main app (state machine)
│   ├── components/
│   │   ├── countdown-timer.tsx
│   │   ├── email-display.tsx
│   │   ├── generate-button.tsx
│   │   ├── inbox.tsx
│   │   └── message-viewer.tsx
│   └── lib/
│       └── mail-api.ts        # Mail.tm API service layer
├── PRD.md                     # Product Requirements Document
├── package.json
└── README.md
```

## 🔄 How It Works

```
User clicks "Generate"
        │
        ▼
  POST /api/session
        │
        ├── GET api.mail.tm/domains     (pick random domain)
        ├── POST api.mail.tm/accounts   (create account)
        └── POST api.mail.tm/token      (get auth token)
        │
        ▼
  Active Session (5 min)
        │
        ├── Poll GET /api/messages every 5s
        ├── Click message → GET /api/messages/{id}
        └── Timer counts down
        │
        ▼
  Session Expires
        │
        └── POST /api/cleanup → DELETE api.mail.tm/accounts/{id}
```

## 🎨 Design

- **Color Scheme**: Zinc dark backgrounds with violet/indigo accents
- **Typography**: Geist Sans & Geist Mono (from Next.js)
- **Animations**: Fade-in, slide-up, pulse on critical timer
- **Layout**: Centered, responsive, mobile-friendly

## ⚠️ Limitations

- **5-minute max session** — by design, for privacy
- **No attachments** — text/HTML email content only
- **No sending** — receive only
- **Rate limited** — Mail.tm allows 8 queries/second per IP
- **Domain availability** — depends on Mail.tm's active domains

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

## 🙏 Credits

- Email service powered by [Mail.tm](https://mail.tm/)
- Icons by [Lucide](https://lucide.dev/)
- Built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/)
