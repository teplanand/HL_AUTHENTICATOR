import { memo, useMemo } from "react";
import { Box, Typography, LinearProgress, Chip, alpha, Tooltip, Stack, Card } from "@mui/material";
import { Rack, Shelf } from "../types";
import { getRackTotals, getStatusColor, getShelfFill } from "../utils";

type RackCardProps = {
  rack: Rack;
  isSelected: boolean;
  onSelect: (rackId: string) => void;
};

const ShelfPreview = memo(function ShelfPreview({ shelf, color }: { shelf: Shelf; color: string }) {
  return (
    <Tooltip
      arrow
      title={
        <Box sx={{ py: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, display: "block" }}>{shelf.id}</Typography>
          <Typography variant="caption" sx={{ display: "block" }}>Usage: {shelf.used} / {shelf.capacity}</Typography>
          {shelf.pallets?.map(p => (
            <Typography key={p.id} variant="caption" sx={{ display: "block", color: "rgba(255,255,255,0.8)" }}>
              • {p.product} ({p.qty})
            </Typography>
          ))}
        </Box>
      }
    >
      <Box
        sx={{
          flex: "1 1 30px",
          height: 34,
          minWidth: 34,
          borderRadius: "6px",
          border: "1px solid",
          borderColor: alpha(color, 0.2),
          background: getShelfFill(color, shelf.used, shelf.capacity),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.65rem",
          fontWeight: 800,
          color: alpha(color, 0.8),
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: color,
            transform: "scale(1.1)",
            zIndex: 1,
          },
        }}
      >
        {shelf.id.split("-").pop()}
      </Box>
    </Tooltip>
  );
});

const RackCard = memo(function RackCard({ rack, isSelected, onSelect }: RackCardProps) {
  const totals = useMemo(() => getRackTotals(rack), [rack]);
  const usagePercent = Math.min((totals.used / totals.capacity) * 100, 100);
  const statusColor = getStatusColor(totals.used, totals.capacity);
  const accentColor = "#FF8A3D";

  const itemBadges = useMemo(() => {
    const items = new Set<string>();
    rack.shelves.forEach((shelf) => {
      shelf.pallets.forEach((pallet) => items.add(pallet.product));
    });
    return Array.from(items).slice(0, 3);
  }, [rack]);

  return (
    <Card
      onClick={() => onSelect(rack.id)}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "rgba(15,23,42,0.10)",
        p: 2,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 32px rgba(15,23,42,0.12)",
          borderColor: "rgba(15,23,42,0.2)",
        },
      }}
    >

      <Stack spacing={1}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              {rack.id}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
              {totals.used} / {totals.capacity} Units
            </Typography>
          </Box>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: statusColor,
              boxShadow: `0 0 8px ${statusColor}60`,
              mt: 1,
            }}
          />
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, width: "100%" }}>
          {rack.shelves.map((shelf) => (
            <ShelfPreview key={shelf.id} shelf={shelf} color={accentColor} />
          ))}
        </Box>

        <Box>
          <LinearProgress
            variant="determinate"
            value={usagePercent}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: "#E2E8F0",
              "& .MuiLinearProgress-bar": { backgroundColor: statusColor, borderRadius: 3 },
            }}
          />
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {itemBadges.map((item) => (
            <Chip
              key={item}
              label={item}
              size="small"
              sx={{
                height: 18,
                fontSize: "0.6rem",
                fontWeight: 800,
                backgroundColor: alpha(accentColor, 0.08),
                color: accentColor,
                borderRadius: "4px",
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          ))}
        </Box>
      </Stack>
    </Card>
  );
});

export default RackCard;
