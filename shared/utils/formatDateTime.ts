export function formatDateTimeWithSeparation(created_date: string): string {
    if (!created_date) return "";
    const date = new Date(created_date);
    if (isNaN(date.getTime())) return "";
    const datePart = date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
    const timePart = date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
    return `${datePart} | ${timePart}`;
};
