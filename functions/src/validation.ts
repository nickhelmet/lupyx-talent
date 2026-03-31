// Input validation utilities

export function sanitizeString(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>/g, "")        // Strip HTML tags
    .replace(/&[^;]+;/g, "")        // Strip HTML entities
    .trim()
    .slice(0, 10000);               // Max length
}

export function validateEmail(email: unknown): string | null {
  if (typeof email !== "string") return null;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) ? email.toLowerCase().trim() : null;
}

export function validatePhone(phone: unknown): string | null {
  if (typeof phone !== "string") return null;
  const cleaned = phone.replace(/[^0-9+\-() ]/g, "").trim();
  return cleaned.length >= 8 ? cleaned : null;
}

export function validateDNI(dni: unknown): string | null {
  if (typeof dni !== "string") return null;
  const cleaned = dni.replace(/[^0-9]/g, "");
  return cleaned.length >= 7 && cleaned.length <= 8 ? cleaned : null;
}

export function validateJobStatus(status: unknown): "ACTIVE" | "PAUSED" | "CLOSED" | null {
  if (status === "ACTIVE" || status === "PAUSED" || status === "CLOSED") return status;
  return null;
}

export function validateApplicationStatus(status: unknown): string | null {
  const valid = ["PENDING", "REVIEWING", "INTERVIEW", "REJECTED", "ACCEPTED", "HIRED"];
  return typeof status === "string" && valid.includes(status) ? status : null;
}

export function validateEducationLevel(level: unknown): string | null {
  const valid = ["PRIMARY", "SECONDARY", "TERTIARY", "UNIVERSITY", "POSTGRADUATE", "MASTER", "PHD"];
  return typeof level === "string" && valid.includes(level) ? level : null;
}

// PDF magic bytes check
export function isPDFBuffer(buffer: Buffer): boolean {
  return buffer.length >= 4 && buffer.slice(0, 4).toString() === "%PDF";
}
