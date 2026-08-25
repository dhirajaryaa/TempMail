export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://tempmail.dhirajarya.in";

export const SITE_DOMAIN = new URL(SITE_URL).hostname;
