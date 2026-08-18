import { memo } from "react";
import { Box, Card, Typography } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

import { Section } from "../types";
import RackCard from "./RackCard";

type RackGridProps = {
  section: Section;
  selectedRackId: string | null;
  onSelectRack: (rackId: string) => void;
  onAddRack: () => void;
};

function RackGridComponent({ section, selectedRackId, onSelectRack, onAddRack }: RackGridProps) {
  return (
    <Box>
      {!section.racks.length ? (
        <Box sx={{ pb: 3, px: 1 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No racks matched your search
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Try searching for a different rack ID or item name, or create a new rack for this zone.
          </Typography>
        </Box>
      ) : null}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 2,
        }}
      >
        {section.racks.map((rack) => (
          <RackCard
            key={rack.id}
            rack={rack}
            isSelected={rack.id === selectedRackId}
            onSelect={onSelectRack}
          />
        ))}
        <Card
          onClick={onAddRack}
          sx={{
            borderRadius: 3,
            border: "1px dashed",
            borderColor: "rgba(255,138,61,0.45)",
            p: 2,
            minHeight: 230,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 1.5,
            cursor: "pointer",
            background: "linear-gradient(180deg, rgba(255,138,61,0.08) 0%, rgba(255,255,255,0.95) 100%)",
            transition: "all 0.25s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 12px 30px rgba(255, 138, 61, 0.18)",
              borderColor: "#FF8A3D",
            },
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,138,61,0.14)",
              color: "#FF8A3D",
            }}
          >
            <AddOutlinedIcon fontSize="large" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0F172A" }}>
            Add Rack
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#64748B",
              textAlign: "center",
              maxWidth: 220,
            }}
          >
            Create a new rack in {section.name} and open the rack form directly.
          </Typography>
        </Card>
      </Box>
    </Box>
  );
}

export const RackGrid = memo(RackGridComponent);
