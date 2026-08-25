// Mail.tm API Service Layer
// Docs: https://docs.mail.tm/
// Base URL: https://api.mail.tm
// Rate limit: 8 QPS per IP

const BASE_URL = "https://api.mail.tm";

// A realistic user agent to prevent Cloudflare/WAF blockages on Mail.tm side
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export interface Domain {
  id: string;
  domain: string;
  isActive: boolean;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  address: string;
  quota: number;
  used: number;
  isDisabled: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageSender {
  address: string;
  name: string;
}

export interface MessagePreview {
  id: string;
  msgid: string;
  from: MessageSender;
  to: MessageSender[];
  subject: string;
  intro: string;
  seen: boolean;
  isDeleted: boolean;
  hasAttachments: boolean;
  size: number;
  downloadUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageFull extends MessagePreview {
  text: string;
  html: string[];
  sourceUrl: string;
  accountId: string;
}

export interface TokenResponse {
  token: string;
  id: string;
}

export interface TempMailSession {
  account: Account;
  token: string;
  password: string;
  expiresAt: number; // timestamp when session expires
  durationMinutes: number; // chosen duration
}

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

// Separators used between name parts
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
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const sep = pick(SEPARATORS);
  const addDigits = Math.random() > 0.35; // 65% chance of digits
  const digits = addDigits ? randDigits(1, 3) : "";

  const patterns = [
    () => `${first}${sep}${last}${digits}`,
    () => `${first[0]}${last}${digits}`,
    () => `${last}${sep}${first}${digits}`,
    () => `${first}${digits}`,
    () => `${first}${sep}${last[0]}${digits}`,
    () => `${last}${first[0]}${digits}`,
  ];

  return pick(patterns)();
}

// Generate a random password
function generateRandomPassword(length = 16): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper to make fetch requests with custom headers and modern compatibility
async function fetchMail(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (!headers.has("User-Agent")) {
    headers.set("User-Agent", USER_AGENT);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

// Fetch available domains
export async function getDomains(): Promise<Domain[]> {
  const res = await fetchMail(`${BASE_URL}/domains`);
  if (!res.ok) throw new Error(`Failed to fetch domains: ${res.status}`);
  const data = await res.json();
  // API returns hydra:Collection format
  return data["hydra:member"] || data.member || data;
}

// Create a new temp mail account
export async function createAccount(
  address: string,
  password: string
): Promise<Account> {
  const res = await fetchMail(`${BASE_URL}/accounts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Failed to create account: ${res.status} - ${err.detail || err.message || "Unknown error"}`
    );
  }
  return res.json();
}

// Get auth token
export async function getToken(
  address: string,
  password: string
): Promise<TokenResponse> {
  const res = await fetchMail(`${BASE_URL}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address, password }),
  });
  if (!res.ok) throw new Error(`Failed to get token: ${res.status}`);
  return res.json();
}

// Fetch messages for authenticated account
export async function getMessages(token: string): Promise<MessagePreview[]> {
  const res = await fetchMail(`${BASE_URL}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch messages: ${res.status}`);
  const data = await res.json();
  return data["hydra:member"] || data.member || data;
}

// Fetch a single message with full content
export async function getMessage(
  token: string,
  messageId: string
): Promise<MessageFull> {
  const res = await fetchMail(`${BASE_URL}/messages/${messageId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch message: ${res.status}`);
  return res.json();
}

// Delete an account
export async function deleteAccount(
  token: string,
  accountId: string
): Promise<void> {
  const res = await fetchMail(`${BASE_URL}/accounts/${accountId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to delete account: ${res.status}`);
  }
}

// Delete a message
export async function deleteMessage(
  token: string,
  messageId: string
): Promise<void> {
  const res = await fetchMail(`${BASE_URL}/messages/${messageId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to delete message: ${res.status}`);
  }
}

// Available duration options in minutes
export const DURATION_OPTIONS = [5, 10, 15, 30] as const;
export type DurationMinutes = (typeof DURATION_OPTIONS)[number];

// High-level: create a full temp mail session
export async function createTempMailSession(
  durationMinutes: DurationMinutes = 5
): Promise<TempMailSession> {
  // 1. Get available domains
  const domains = await getDomains();
  const activeDomains = domains.filter((d) => d.isActive && !d.isPrivate);
  if (activeDomains.length === 0) {
    throw new Error("No active domains available");
  }

  let attempts = 0;
  const maxAttempts = 4;
  let lastError: Error | null = null;

  while (attempts < maxAttempts) {
    attempts++;

    // 2. Pick a random domain
    const domain =
      activeDomains[Math.floor(Math.random() * activeDomains.length)];

    // 3. Generate random credentials
    let username = generateRandomUsername();
    if (attempts > 1) {
      username += randDigits(2, 4);
    }

    const password = generateRandomPassword();
    const address = `${username}@${domain.domain}`;

    try {
      // 4. Create account
      const account = await createAccount(address, password);

      // 5. Get auth token
      const tokenData = await getToken(address, password);

      // 6. Set expiry based on chosen duration
      const expiresAt = Date.now() + durationMinutes * 60 * 1000;

      return {
        account,
        token: tokenData.token,
        password,
        expiresAt,
        durationMinutes,
      };
    } catch (err) {
      console.warn(`Attempt ${attempts} failed to create account:`, err);
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 300 * attempts));
      }
    }
  }

  throw lastError || new Error("Failed to create temporary email after multiple attempts");
}
