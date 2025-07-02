import { format } from "date-fns";

export function toLocaleDateTime(apiDate: string): string {
  const date = typeof apiDate === "string" ? new Date(apiDate) : apiDate;
  const zonedDate = date.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
  const formatString = "dd-MM-yyyy HH:mm:ss";
  return format(zonedDate, formatString);
}
