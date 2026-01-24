function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Chicago",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

export default formatDate;
