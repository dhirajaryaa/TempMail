# TempMail - Product Requirements Document

## Overview

TempMail is a privacy-first, instant disposable email service built with Next.js. Users can generate a random temporary email address with one click and receive emails instantly. No signup, no data stored — pure ephemeral communication.

## Problem Statement

Users frequently need throwaway email addresses for:
- Signing up for services they want to test
- Avoiding spam when filling out forms
- Protecting their primary email from data breaches
- Quick verifications without exposing personal email

Existing solutions are cluttered with ads, require registration, or have poor UX.

## Core Features

### 1. Instant Email Generation
- **One-click generation**: User arrives → clicks "Generate" → gets a random temp email on `@linqmail.com`
- **Random address**: Auto-generated username using realistic human name formats + `linqmail.com` domain
- **Copy to clipboard**: One-click copy of the email address
- **Regenerate**: Option to generate a new address (destroys current session and redirects)
- **Choosable Duration**: Users can select 5, 10, 15, or 30-minute sessions on landing page

### 2. Inbox with Real-Time Polling
- **Auto-polling**: Check for new messages every 10 seconds directly from the client browser
- **Message list**: Shows sender, subject, preview text, and timestamp
- **Message viewer**: Full email content rendered safely (HTML via sandboxed iframe)
- **Empty state**: Clear UI when no messages have arrived yet

### 3. Session Timer
- **Countdown display**: MM:SS digital timer with progress bar
- **Visual urgency**: Green → Amber (< 1 min) → Red (< 30s) with pulse animation
- **Auto-expiry**: Session automatically ends on expiration, redirecting users to the home page with a clean alert message

### 4. Session Lifecycle
- **Home (/) → Mail (/mail)**:
  - Homepage is fully static for SEO optimization.
  - Active mailbox states are managed on `/mail` dynamically.
  - Sessions persist in `localStorage` so refreshing does not lose active mailboxes.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Package Manager | Bun |
| Email API | [GrabMail](https://grabmail.io/) |
| Deployment | Vercel |

## API Integration (GrabMail)

| Action | Endpoint |
|--------|----------|
| List messages | `GET /mailbox?address=X` |
| Read message | `GET /message/{id}?mailbox=X` |

**Rate limit**: 1 read/sec per address, 1200 requests/60s per client.

## User Flow

1. User visits `/` → sees static landing page with duration CTA
2. User selects duration and clicks "Generate Temporary Email"
3. App redirects to `/mail?duration=X&new=true`
4. Client browser requests mailbox from grabmail.io directly
5. Active view shows:
   - Email address with copy button
   - Countdown timer matching selected duration
   - Inbox (polling every 10s)
6. User copies email, uses it elsewhere
7. Incoming emails appear in inbox automatically
8. User clicks email to read full content
9. On expiration: user is redirected back to `/` showing a clean expiry warning banner

## Design Principles

- **Semantic Themes**: Zinc light/dark backgrounds with brand accent `#ff5a54` (no gradients)
- **Minimal**: No clutter, single-purpose tool
- **Responsive**: Works on mobile and desktop
- **Accessible**: Proper contrast, focus states, semantic HTML
- **Fast**: Static home page prerendering, no proxy API latency

## Non-Goals (Out of Scope)

- User accounts / persistence
- Sending emails
- Attachment downloads (out of scope for UI, GrabMail supports up to 5MB)
- Custom domains
- Email forwarding
- Multiple simultaneous inboxes
