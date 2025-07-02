import { format } from "date-fns";

export function formatInputDate(dateString: string): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  const zonedDate = date.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
  return format(zonedDate, "yyyy-MM-dd");
}
