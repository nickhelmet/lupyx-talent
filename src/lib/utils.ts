export function timeAgo(date: string | { _seconds: number } | undefined): string {
  if (!date) return "";

  let ms: number;
  if (typeof date === "object" && "_seconds" in date) {
    ms = date._seconds * 1000;
  } else {
    ms = new Date(date as string).getTime();
  }

  const seconds = Math.floor((Date.now() - ms) / 1000);
  if (seconds < 60) return "Hace un momento";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Hace ${days} día${days > 1 ? "s" : ""}`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `Hace ${weeks} semana${weeks > 1 ? "s" : ""}`;
  const months = Math.floor(days / 30);
  return `Hace ${months} mes${months > 1 ? "es" : ""}`;
}
