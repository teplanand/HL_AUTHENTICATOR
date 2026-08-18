import type { MouseEventHandler, ReactNode } from "react";
import { Box, IconButton, Typography } from "@mui/material";

type QuantityControlProps = {
  label: string;
  value: number;
  icon: ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  color: string;
  backgroundColor: string;
};

export default function QuantityControl({
  label,
  value,
  icon,
  onClick,
  disabled = false,
  color,
  backgroundColor,
}: QuantityControlProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        px: 0.75,
        py: 0.5,
        borderRadius: 99,
        backgroundColor,
      }}
    >
      <Typography variant="caption" sx={{ color: "#64748B" }}>
        {label}: <Box component="span" sx={{ color: "#334155", fontWeight: 700 }}>{value}</Box>
      </Typography>
      <IconButton
        size="small"
        onClick={onClick}
        disabled={disabled}
        sx={{
          width: 22,
          height: 22,
          color,
          backgroundColor: "#FFFFFF",
          border: "1px solid",
          borderColor: "rgba(15,23,42,0.08)",
          "&:hover": {
            backgroundColor: "#FFFFFF",
          },
          "&.Mui-disabled": {
            color: "#CBD5E1",
            borderColor: "rgba(203,213,225,0.7)",
            backgroundColor: "rgba(255,255,255,0.6)",
          },
        }}
      >
        {icon}
      </IconButton>
    </Box>
  );
}
