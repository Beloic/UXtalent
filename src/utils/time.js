export function timeAgo(iso) {
  const now = new Date();
  const then = new Date(iso);
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} j`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mois`;
  const years = Math.floor(months / 12);
  return `${years} an${years > 1 ? "s" : ""}`;
}

export const REMOTE_LABEL = {
  remote: "Full remote",
  onsite: "Sur site",
  hybrid: "Hybride",
};