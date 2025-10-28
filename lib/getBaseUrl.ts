export function getBaseUrl() {
  // Prefer explicitly provided public base URL
  const explicitRaw = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (explicitRaw) {
    const explicit = explicitRaw.startsWith("http") ? explicitRaw : `https://${explicitRaw}`;
    return explicit.replace(/\/$/, "");
  }

  // On Vercel, VERCEL_URL is like "my-app.vercel.app" (no protocol)
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const withProtocol = vercel.startsWith("http") ? vercel : `https://${vercel}`;
    return withProtocol.replace(/\/$/, "");
  }

  // Fallback for local dev/build
  return "http://localhost:3000";
}
