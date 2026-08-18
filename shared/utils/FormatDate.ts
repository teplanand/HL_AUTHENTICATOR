import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export const SHORT_MONTH_DATE_FORMAT = "DD-MMM-YYYY";
export const SHORT_MONTH_DATE_TIME_FORMAT = "DD-MMM-YYYY hh:mm A";

/**
 * Format date for display (DD/MM/YYYY)
 */
export function formatSmartDate(inputDate: any) {
  if (!inputDate) return "";
  return dayjs(inputDate).format("DD/MM/YYYY");
}

/**
 * Format date for API calls (YYYY-MM-DD)
 */
export function formatDateForAPI(inputDate: any) {
  if (!inputDate) return undefined;
  return dayjs(inputDate).format("YYYY-MM-DD");
}

/**
 * Format datetime for API calls (ISO format)
 */
export function formatDateTimeForAPI(value: any) {
  if (!value) return undefined;

  // if the value has time (DateTime picker)
  if (dayjs(value).hour() || dayjs(value).minute()) {
    return dayjs(value).utc().format("YYYY-MM-DDTHH:mm:ss[Z]");
  }

  // if only date selected (Date picker)
  return dayjs(value).utc().startOf("day").format("YYYY-MM-DDTHH:mm:ss[Z]");
}
export const formatDateTimeForAPIV2 = (
  date: Date | null,
  time: string = "12:00"
): string => {
  if (!date) return "";

  const [hours, minutes] = time.split(":");
  const newDate = new Date(date);
  newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  return newDate.toISOString();
};
export const formatDateTime = (dateString: string) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  // Format: DD/MM/YYYY, HH:MM AM/PM
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  return `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`;
};

export const formatDateOnly = (dateString: string) => {
  if (!dateString) return "";

  const parsed = dayjs(dateString);
  if (!parsed.isValid()) return "";

  return parsed.format("DD/MM/YYYY");
};

export const formatDateWithShortMonth = (dateString: string) => {
  if (!dateString) return "";

  const parsed = dayjs(dateString);
  if (!parsed.isValid()) return "";

  return parsed.format(SHORT_MONTH_DATE_FORMAT);
};

export const formatDateTimeWithShortMonth = (dateString: string) => {
  if (!dateString) return "";

  const parsed = dayjs(dateString);
  if (!parsed.isValid()) return "";

  return parsed.format(SHORT_MONTH_DATE_TIME_FORMAT);
};
