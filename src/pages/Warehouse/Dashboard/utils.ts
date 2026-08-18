import { Rack, Section } from "./types";

export const getShelfUsagePercent = (used: number, capacity: number) => {
  if (!capacity) {
    return 0;
  }

  return Math.min((used / capacity) * 100, 100);
};

export const getShelfFill = (
  color: string,
  used: number,
  capacity: number,
  direction: "horizontal" | "vertical" = "vertical"
) => {
  const percent = getShelfUsagePercent(used, capacity);
  const gradientDirection = direction === "horizontal" ? "90deg" : "180deg";

  return `linear-gradient(${gradientDirection}, ${color}55 ${percent}%, #fff ${percent}%)`;
};

export const getRackTotals = (rack: Rack) =>
  rack.shelves.reduce(
    (totals, shelf) => ({
      used: totals.used + shelf.used,
      capacity: totals.capacity + shelf.capacity,
      pallets: totals.pallets + (shelf.pallets?.length || 0),
    }),
    { used: 0, capacity: 0, pallets: 0 }
  );

export const getFirstRackId = (section?: Section | null) => section?.racks?.[0]?.id || null;

export const getStatusColor = (used: number, capacity: number) => {
  const percent = getShelfUsagePercent(used, capacity);
  if (percent < 70) return "#4CAF50"; // Safe (Green)
  if (percent < 90) return "#FFA726"; // Warning (Orange)
  return "#F44336"; // Critical (Red)
};

export const getStatusLabel = (used: number, capacity: number) => {
  const percent = getShelfUsagePercent(used, capacity);
  if (percent < 70) return "Safe";
  if (percent < 90) return "Warning";
  return "Critical";
};
