import type { MouseEvent, ReactNode } from "react";
import { IconButton, Tooltip } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";

type IconActionButtonProps = {
  ariaLabel: string;
  tooltip: string;
  children: ReactNode;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  size?: "small" | "medium" | "large";
  sx?: SxProps<Theme>;
};

export default function IconActionButton({
  ariaLabel,
  tooltip,
  children,
  onClick,
  size = "small",
  sx,
}: IconActionButtonProps) {
  return (
    <Tooltip title={tooltip}>
      <IconButton
        aria-label={ariaLabel}
        size={size}
        onClick={onClick}
        sx={{
          color: "#94A3B8",
          transition: "color 0.2s ease, background-color 0.2s ease",
          "&:hover": {
            color: "#475569",
            backgroundColor: "rgba(148, 163, 184, 0.12)",
          },
          ...sx,
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}
