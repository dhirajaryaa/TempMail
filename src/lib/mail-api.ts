// GrabMail API Service Layer
// Docs: https://grabmail.io/docs/api
// Base URL: https://grabmail.io/api/v1
// No API key, no account creation needed.
// An address exists the moment mail reaches it.
// Rate limit: 1 read/sec per address, 1200 req/60s per client.

const BASE_URL = "https://grabmail.io/api/v1";

export interface MailboxResponse {
  address: string;
  alias: string;
  messages: MessagePreview[];
}

export interface MessagePreview {
  id: string;
  from: string;
  subject: string;
  intro: string;
  timestamp: string;
  read: boolean;
  hasAttachments: boolean;
}

export interface MessageFull {
  id: string;
  from: string;
  to: string;
  subject: string;
  intro: string;
  text: string;
  html: string;
  timestamp: string;
  read: boolean;
  hasAttachments: boolean;
  attachments: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
}

export interface TempMailSession {
  address: string;
  alias: string;
  expiresAt: number;
  durationMinutes: number;
}

// Available duration options in minutes
export const DURATION_OPTIONS = [5, 10, 15, 30] as const;
export type DurationMinutes = (typeof DURATION_OPTIONS)[number];

// Common first and last names for realistic email generation
const FIRST_NAMES = [
  "james", "john", "robert", "michael", "david", "william", "richard", "joseph",
  "thomas", "daniel", "matthew", "andrew", "joshua", "christopher", "anthony",
  "mary", "patricia", "jennifer", "linda", "elizabeth", "barbara", "susan",
  "sarah", "karen", "nancy", "lisa", "betty", "helen", "sandra", "donna",
  "alex", "sam", "jordan", "taylor", "morgan", "casey", "riley", "avery",
  "charlie", "logan", "parker", "quinn", "blake", "drew", "jamie", "robin",
  "mark", "paul", "steven", "kevin", "brian", "george", "edward", "jason",
  "ryan", "jacob", "gary", "timothy", "larry", "jeffrey", "frank", "scott",
  "eric", "stephen", "raymond", "gregory", "benjamin", "patrick", "jack",
  "emma", "olivia", "sophia", "isabella", "charlotte", "amelia", "harper",
  "evelyn", "abigail", "emily", "madison", "chloe", "grace", "victoria",
  "anna", "natalie", "hannah", "lily", "ella", "aria", "mia", "layla",
];

const LAST_NAMES = [
  "smith", "johnson", "williams", "brown", "jones", "garcia", "miller",
  "davis", "rodriguez", "martinez", "hernandez", "lopez", "gonzalez",
  "wilson", "anderson", "thomas", "taylor", "moore", "jackson", "martin",
  "lee", "perez", "thompson", "white", "harris", "sanchez", "clark",
  "ramirez", "lewis", "robinson", "walker", "young", "allen", "king",
  "wright", "scott", "torres", "nguyen", "hill", "flores", "green",
  "adams", "nelson", "baker", "hall", "rivera", "campbell", "mitchell",
  "carter", "roberts", "turner", "phillips", "evans", "collins", "stewart",
  "morris", "reed", "cook", "morgan", "bell", "murphy", "bailey", "cooper",
  "ward", "cox", "diaz", "richardson", "wood", "watson", "brooks", "bennett",
  "gray", "james", "reyes", "cruz", "hughes", "price", "myers", "long",
  "foster", "sanders", "ross", "powell", "sullivan", "russell", "ortiz",
];

const SEPARATORS = [".", "_", ""];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randDigits(min: number, max: number): string {
  const len = min + Math.floor(Math.random() * (max - min + 1));
  let result = "";
  for (let i = 0; i < len; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

// Generate a realistic-looking email username
function generateRandomUsername(): string {
  try {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const sep = pick(SEPARATORS);
    const addDigits = Math.random() > 0.35;
    const digits = addDigits ? randDigits(1, 3) : "";

    const patterns = [
      () => `${first}${sep}${last}${digits}`,
      () => `${first[0]}${last}${digits}`,
      () => `${last}${sep}${first}${digits}`,
      () => `${first}${digits}`,
      () => `${first}${sep}${last[0]}${digits}`,
      () => `${last}${first[0]}${digits}`,
    ];

    const result = pick(patterns)();
    if (result && result.length > 2) {
      return result;
    }
    throw new Error("Invalid username generated");
  } catch {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let fallbackResult = "";
    for (let i = 0; i < 10; i++) {
      fallbackResult += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return fallbackResult;
  }
}

// Simple in-memory request cache to prevent double-fetches and rate limits (429)
// Keys are request URLs, value is the pending/completed promise + timestamp
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const requestCache = new Map<string, { promise: Promise<any>; timestamp: number }>();
const CACHE_TTL_MS = 2000; // Cache requests for 2 seconds to respect 1s rate-limit

async function fetchWithCache<T>(url: string, fetchFn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const cached = requestCache.get(url);

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.promise;
  }

  const promise = fetchFn().catch((err) => {
    // If the request fails, remove it from cache so retries can run immediately
    requestCache.delete(url);
    throw err;
  });

  requestCache.set(url, { promise, timestamp: now });
  return promise;
}

// Fetch mailbox (list messages) for an address
export async function getMessages(address: string): Promise<MessagePreview[]> {
  const url = `${BASE_URL}/mailbox?address=${encodeURIComponent(address)}`;

  return fetchWithCache(url, async () => {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 429) {
        throw new Error("Rate limited. Please wait a moment and try again.");
      }
      throw new Error(`Failed to fetch messages: ${res.status}`);
    }
    const data: MailboxResponse = await res.json();
    return data.messages || [];
  });
}

// Fetch a single message with full content
export async function getMessage(
  address: string,
  messageId: string
): Promise<MessageFull> {
  const url = `${BASE_URL}/message/${messageId}?mailbox=${encodeURIComponent(address)}`;

  return fetchWithCache(url, async () => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch message: ${res.status}`);
    }
    return res.json();
  });
}

// Create a new temp mail session
// With GrabMail, there is no account creation step.
// We just generate a random address on a public domain.
// The address exists the moment mail reaches it.
export async function createTempMailSession(
  durationMinutes: DurationMinutes = 5
): Promise<TempMailSession> {
  const username = generateRandomUsername();
  const domain = "linqmail.com";
  const address = `${username}@${domain}`;

  // Verify the mailbox works by fetching it (also gets the alias)
  const url = `${BASE_URL}/mailbox?address=${encodeURIComponent(address)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to initialize mailbox: ${res.status}`);
  }
  const data: MailboxResponse = await res.json();

  const expiresAt = Date.now() + durationMinutes * 60 * 1000;

  return {
    address: data.address,
    alias: data.alias,
    expiresAt,
    durationMinutes,
  };
}

// Delete account is not needed with GrabMail.
// Messages auto-delete after 5 days.
// We just clear localStorage on our side.
export async function deleteAccount(): Promise<void> {
  // No-op: GrabMail has no account deletion API.
  // Messages expire automatically after 5 days.
  return;
}
