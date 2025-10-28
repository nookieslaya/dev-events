export function getBaseUrl() {
  // Prefer explicitly provided public base URL
  const explicit = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  // On Vercel, VERCEL_URL is like "my-app.vercel.app" (no protocol)
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const withProtocol = vercel.startsWith("http") ? vercel : `https://${vercel}`;
    return withProtocol.replace(/\/$/, "");
  }

  // Fallback for local dev/build
  return "http://localhost:3000";
}
