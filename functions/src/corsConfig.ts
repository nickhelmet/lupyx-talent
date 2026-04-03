export const ALLOWED_ORIGINS = [
  "https://lupyxtalent.com",
  "https://www.lupyxtalent.com",
  "https://lupyx-talent.web.app",
  "https://lupyx-talent.firebaseapp.com",
  "http://localhost:3000",
  "http://localhost:5173",
];

export function getCorsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Firebase-AppCheck",
    "Access-Control-Max-Age": "3600",
  };
}
