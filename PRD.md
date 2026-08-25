# TempMail - Product Requirements Document

## Overview

TempMail is a privacy-first, instant disposable email service built with Next.js. Users can generate a random temporary email address with one click and receive emails for a maximum of 5 minutes. No signup, no data stored — pure ephemeral communication.

## Problem Statement

Users frequently need throwaway email addresses for:
- Signing up for services they want to test
- Avoiding spam when filling out forms
- Protecting their primary email from data breaches
- Quick verifications without exposing personal email

Existing solutions are cluttered with ads, require registration, or have poor UX.

## Core Features

### 1. Instant Email Generation
- **One-click generation**: User arrives → clicks "Generate" → gets a random temp email
- **Random address**: Auto-generated username + available domain from Mail.tm
- **Copy to clipboard**: One-click copy of the email address
- **Regenerate**: Option to generate a new address (destroys current session)

### 2. Inbox with Real-Time Polling
- **Auto-polling**: Check for new messages every 5 seconds
- **Message list**: Shows sender, subject, preview text, and timestamp
- **Message viewer**: Full email content rendered safely (HTML via sandboxed iframe)
- **Empty state**: Clear UI when no messages have arrived yet

### 3. 5-Minute Session Timer
- **Countdown display**: MM:SS digital timer with progress bar
- **Visual urgency**: Green → Amber (< 1 min) → Red (< 30s) with pulse animation
- **Auto-expiry**: Session automatically ends at 5 minutes
- **Cleanup**: Account is deleted from Mail.tm on expiry

### 4. Session Lifecycle
- **Landing → Active → Expired** state machine
- On expiry, user is shown "Session Expired" screen with option to generate new
- Account is deleted server-side on expiry (best-effort cleanup)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Package Manager | Bun |
| Email API | [Mail.tm](https://docs.mail.tm/) |
| Deployment | Vercel (recommended) |

## API Integration (Mail.tm)

| Action | Endpoint | Auth |
|--------|----------|------|
| List domains | `GET /domains` | No |
| Create account | `POST /accounts` | No |
| Get auth token | `POST /token` | No |
| List messages | `GET /messages` | Bearer |
| Read message | `GET /messages/{id}` | Bearer |
| Delete account | `DELETE /accounts/{id}` | Bearer |

**Rate limit**: 8 queries per second per IP.

## Architecture

```
┌─────────────────────────────────────────┐
│              Next.js App                │
│                                         │
│  ┌──────────┐     ┌──────────────────┐  │
│  │  Client   │────▶│  API Routes      │  │
│  │  (React)  │◀────│  /api/session    │  │
│  │           │     │  /api/messages   │  │
│  │  - Timer  │     │  /api/cleanup    │  │
│  │  - Inbox  │     └────────┬─────────┘  │
│  │  - Viewer │              │            │
│  └──────────┘              │            │
│                             ▼            │
│                   ┌──────────────────┐   │
│                   │  Mail.tm API     │   │
│                   │  api.mail.tm     │   │
│                   └──────────────────┘   │
└─────────────────────────────────────────┘
```

## User Flow

1. User visits the site → sees landing page with "Generate" CTA
2. Clicks "Generate Temporary Email"
3. API route creates Mail.tm account → returns session with token + email
4. Active view shows:
   - Email address with copy button
   - 5-minute countdown timer
   - Inbox (polling every 5s)
5. User copies email, uses it elsewhere
6. Incoming emails appear in inbox automatically
7. User clicks email to read full content
8. At 5 minutes: session expires, account deleted, user shown expired screen
9. User can generate a new email to start over

## Design Principles

- **Dark theme**: Zinc-based dark UI with violet accent colors
- **Minimal**: No clutter, single-purpose tool
- **Responsive**: Works on mobile and desktop
- **Accessible**: Proper contrast, focus states, semantic HTML
- **Fast**: No unnecessary dependencies, instant feedback

## Non-Goals (Out of Scope)

- User accounts / persistence
- Sending emails
- Attachment downloads
- Custom domains
- Session extension beyond 5 minutes
- Email forwarding
- Multiple simultaneous inboxes

## Success Metrics

- Time to first email generated: < 3 seconds
- Message delivery visibility: < 10 seconds after receipt
- Zero data persistence after session expiry
- Works on all modern browsers

## Attribution

As per Mail.tm terms of service, the app includes visible attribution linking to mail.tm.
