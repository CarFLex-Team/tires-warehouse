export function formatTime(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Etc/GMT-2", // UTC+2
  }).format(new Date(dateString));
}
export default formatTime;
